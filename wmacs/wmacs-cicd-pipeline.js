#!/usr/bin/env node

/**
 * WMACS MCP Guardian CI/CD Pipeline
 * 
 * Proper staging → production deployment pipeline for LDC Construction Tools
 * Uses correct container assignments from INFRASTRUCTURE_IMMUTABLE.md
 */

const { execSync } = require('child_process');
const fs = require('fs');

class WMACsCICDPipeline {
  constructor() {
    // CORRECT LDC Construction Tools container assignments
    this.config = {
      staging: {
        container: '135',
        ip: '10.92.3.25',
        port: '3001'
      },
      production: {
        container: '133', // CORRECTED: was 134 (JW Scheduler)
        ip: '10.92.3.23',  // CORRECTED: was 10.92.3.24 (JW Scheduler)
        port: '3001'
      },
      database: {
        container: '131',
        ip: '10.92.3.21',
        port: '5432'
      }
    };
    
    this.projectPath = '/opt/ldc-construction-tools';
    this.dbName = 'ldc_construction_tools';
  }

  async deployToProduction() {
    console.log('🛡️ WMACS MCP Guardian CI/CD Pipeline');
    console.log('=====================================');
    console.log(`📦 LDC Construction Tools: Staging → Production`);
    console.log(`🎯 Target: Container ${this.config.production.container} (${this.config.production.ip})`);
    console.log('');

    try {
      // Stage 1: Pre-deployment validation
      await this.validateStaging();
      
      // Stage 2: Merge staging to main
      await this.mergeToMain();
      
      // Stage 3: Deploy to production
      await this.deployProduction();
      
      // Stage 4: Post-deployment validation
      await this.validateProduction();
      
      console.log('🎉 WMACS CI/CD Pipeline: Deployment completed successfully!');
      this.printProductionInfo();
      
    } catch (error) {
      console.error('❌ WMACS CI/CD Pipeline failed:', error.message);
      process.exit(1);
    }
  }

  async validateStaging() {
    console.log('🔍 Stage 1: Pre-deployment validation...');
    
    // Check staging health
    console.log('   • Testing staging environment health...');
    const stagingHealth = await this.checkHealth(this.config.staging.ip, this.config.staging.port);
    if (!stagingHealth) {
      throw new Error('Staging environment unhealthy. Aborting deployment.');
    }
    console.log('   ✅ Staging environment healthy');
    
    // Check APIs
    console.log('   • Validating staging APIs...');
    const apis = ['/api/v1/projects', '/api/v1/volunteers', '/api/v1/trade-teams'];
    for (const api of apis) {
      const status = await this.checkAPI(this.config.staging.ip, this.config.staging.port, api);
      if (status !== 200) {
        throw new Error(`Staging API ${api} unhealthy (${status})`);
      }
    }
    console.log('   ✅ All staging APIs functional');
    
    // Check database connectivity
    console.log('   • Validating database connectivity...');
    const dbCheck = await this.checkDatabase();
    if (!dbCheck) {
      throw new Error('Database connectivity failed');
    }
    console.log('   ✅ Database connectivity verified');
  }

  async mergeToMain() {
    console.log('🔄 Stage 2: Merging staging to main branch...');
    
    try {
      // Ensure we're on staging branch
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      if (currentBranch !== 'staging') {
        throw new Error(`Expected staging branch, currently on: ${currentBranch}`);
      }
      
      // Switch to main and merge staging
      console.log('   • Switching to main branch...');
      execSync('git checkout main', { stdio: 'inherit' });
      
      console.log('   • Merging staging branch...');
      execSync('git merge staging --no-ff -m "feat: Deploy staging to production via WMACS CI/CD pipeline"', { stdio: 'inherit' });
      
      console.log('   • Pushing to remote main...');
      execSync('git push origin main', { stdio: 'inherit' });
      
      console.log('   ✅ Staging successfully merged to main');
      
    } catch (error) {
      throw new Error(`Git operations failed: ${error.message}`);
    }
  }

  async deployProduction() {
    console.log('📦 Stage 3: Deploying to production...');
    
    // Pull latest code on production
    console.log('   • Pulling latest code to production...');
    await this.execOnContainer(this.config.production.container, 
      `cd ${this.projectPath} && git pull origin main`);
    
    // CRITICAL: Replace staging references with production config
    console.log('   • Replacing staging references with production config...');
    await this.replaceEnvironmentConfig();
    
    // Install dependencies
    console.log('   • Installing production dependencies...');
    await this.execOnContainer(this.config.production.container,
      `cd ${this.projectPath}/frontend && npm ci --production`);
    
    // Generate Prisma client
    console.log('   • Generating Prisma client...');
    await this.execOnContainer(this.config.production.container,
      `cd ${this.projectPath}/frontend && npx prisma generate`);
    
    // Build for production
    console.log('   • Building for production...');
    await this.execOnContainer(this.config.production.container,
      `cd ${this.projectPath}/frontend && npm run build`);
    
    // Restart production services
    console.log('   • Restarting production services...');
    await this.execOnContainer(this.config.production.container,
      `cd ${this.projectPath}/frontend && pkill -f "next" || true && sleep 3 && npm start > /dev/null 2>&1 &`);
    
    console.log('   ✅ Production deployment completed');
  }

  async replaceEnvironmentConfig() {
    console.log('     🔄 Replacing staging IP addresses with production...');
    
    // Replace staging IP (10.92.3.25) with production IP (10.92.3.23) in all API routes
    const stagingIP = this.config.staging.ip;
    const productionIP = this.config.production.ip;
    
    const apiFiles = [
      'src/app/api/v1/export/route.ts',
      'src/app/api/v1/volunteers/[id]/route.ts', 
      'src/app/api/v1/admin/route.ts',
      'src/app/api/v1/projects/[id]/route.ts',
      'src/app/api/v1/projects/[id]/assignments/route.ts',
      'src/app/api/v1/admin/reset/route.ts'
    ];
    
    for (const file of apiFiles) {
      await this.execOnContainer(this.config.production.container,
        `cd ${this.projectPath}/frontend && sed -i 's/${stagingIP}/${productionIP}/g' ${file} || true`);
    }
    
    console.log(`     ✅ Replaced ${stagingIP} → ${productionIP} in ${apiFiles.length} files`);
    
    // Replace any other staging references
    console.log('     🔄 Replacing other staging references...');
    await this.execOnContainer(this.config.production.container,
      `cd ${this.projectPath}/frontend && find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -l "staging" | xargs sed -i 's/staging/production/g' || true`);
    
    // Update environment-specific configuration files
    console.log('     🔄 Updating environment configuration...');
    await this.execOnContainer(this.config.production.container,
      `cd ${this.projectPath} && echo "NODE_ENV=production" > frontend/.env.local`);
    
    await this.execOnContainer(this.config.production.container,
      `cd ${this.projectPath} && echo "NEXT_PUBLIC_API_URL=http://${productionIP}:3001" >> frontend/.env.local`);
    
    console.log('     ✅ Environment configuration updated for production');
  }

  async validateProduction() {
    console.log('🏥 Stage 4: Post-deployment validation...');
    
    // Wait for services to start
    console.log('   • Waiting for services to start...');
    await this.sleep(15000);
    
    // Check production health
    console.log('   • Testing production environment health...');
    const productionHealth = await this.checkHealth(this.config.production.ip, this.config.production.port);
    if (!productionHealth) {
      throw new Error('Production environment health check failed');
    }
    console.log('   ✅ Production environment healthy');
    
    // Check APIs
    console.log('   • Validating production APIs...');
    const apis = ['/api/v1/projects', '/api/v1/volunteers', '/api/v1/trade-teams'];
    for (const api of apis) {
      const status = await this.checkAPI(this.config.production.ip, this.config.production.port, api);
      if (status !== 200) {
        throw new Error(`Production API ${api} failed (${status})`);
      }
    }
    console.log('   ✅ All production APIs functional');
  }

  async checkHealth(ip, port) {
    try {
      const result = execSync(`curl -s -o /dev/null -w "%{http_code}" http://${ip}:${port}/`, { encoding: 'utf8' });
      return result.trim() === '307'; // Redirect to auth is expected
    } catch (error) {
      return false;
    }
  }

  async checkAPI(ip, port, endpoint) {
    try {
      const result = execSync(`curl -s -o /dev/null -w "%{http_code}" http://${ip}:${port}${endpoint}`, { encoding: 'utf8' });
      return parseInt(result.trim());
    } catch (error) {
      return 0;
    }
  }

  async checkDatabase() {
    try {
      const result = execSync(`ssh prox "pct exec ${this.config.database.container} -- su - postgres -c 'psql -d ${this.dbName} -c \"SELECT COUNT(*) FROM users;\"'"`, { encoding: 'utf8' });
      return result.includes('2'); // Should have 2 users
    } catch (error) {
      return false;
    }
  }

  async execOnContainer(container, command) {
    try {
      execSync(`ssh prox "pct exec ${container} -- bash -c '${command}'"`, { stdio: 'inherit' });
    } catch (error) {
      throw new Error(`Command failed on container ${container}: ${error.message}`);
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  printProductionInfo() {
    console.log('\n📍 PRODUCTION DEPLOYMENT INFO:');
    console.log('===============================');
    console.log(`🌐 Frontend: http://${this.config.production.ip}:${this.config.production.port}`);
    console.log(`🗄️  Database: postgresql://ldc_user:ldc_password@${this.config.database.ip}:${this.config.database.port}/${this.dbName}`);
    console.log(`📦 Container: ${this.config.production.container} (${this.config.production.ip})`);
    console.log(`🔧 Path: ${this.projectPath}`);
    console.log('\n🛡️ WMACS Guardian: Production deployment validated and operational');
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const pipeline = new WMACsCICDPipeline();
  
  if (args.includes('--deploy') || args.includes('-d')) {
    pipeline.deployToProduction();
  } else {
    console.log('🛡️ WMACS MCP Guardian CI/CD Pipeline');
    console.log('Usage: node wmacs-cicd-pipeline.js --deploy');
    console.log('\nThis will:');
    console.log('1. Validate staging environment');
    console.log('2. Merge staging to main branch');
    console.log('3. Deploy to production (Container 133)');
    console.log('4. Validate production deployment');
  }
}

module.exports = WMACsCICDPipeline;
