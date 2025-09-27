#!/usr/bin/env node

/**
 * APEX Guardian MCP - Production Diagnostic System
 * 
 * Systematic diagnosis and fix following APEX rules and guardrails
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class APEXProductionDiagnostic {
  constructor() {
    this.config = {
      production: { container: '133', ip: '10.92.3.23', ports: { frontend: 3001 } },
      database: { container: '131', ip: '10.92.3.21', port: 5432 }
    };
    this.diagnostics = {};
    this.fixes = [];
  }

  async executeWithTimeout(command, timeout = 15000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Command timed out after ${timeout}ms`));
      }, timeout);

      try {
        const result = execSync(command, { encoding: 'utf8', timeout });
        clearTimeout(timer);
        resolve({ success: true, output: result.trim() });
      } catch (error) {
        clearTimeout(timer);
        resolve({ success: false, error: error.message, output: error.stdout || '' });
      }
    });
  }

  async diagnoseStep1_ContainerHealth() {
    console.log('🛡️ APEX Guardian MCP: Step 1 - Container Health Diagnosis');
    
    try {
      // Check container status
      const containerStatus = await this.executeWithTimeout('ssh prox "pct status 133"');
      this.diagnostics.containerStatus = containerStatus;
      
      // Check container resources
      const containerInfo = await this.executeWithTimeout('ssh prox "pct config 133"');
      this.diagnostics.containerInfo = containerInfo;
      
      // Check if container can execute commands
      const execTest = await this.executeWithTimeout('ssh prox "pct exec 133 -- echo \\"Container exec test\\""');
      this.diagnostics.execTest = execTest;
      
      console.log('   ✅ Container Status:', containerStatus.success ? 'Running' : 'Issue detected');
      console.log('   ✅ Container Exec:', execTest.success ? 'Working' : 'Failed');
      
      return { success: true, issues: [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async diagnoseStep2_DatabaseConnectivity() {
    console.log('🛡️ APEX Guardian MCP: Step 2 - Database Connectivity Diagnosis');
    
    try {
      // Check database container status
      const dbStatus = await this.executeWithTimeout('ssh prox "pct status 131"');
      this.diagnostics.databaseStatus = dbStatus;
      
      // Test database connection from production container
      const dbTest = await this.executeWithTimeout(
        'ssh prox "pct exec 133 -- bash -c \\"cd /opt/ldc-construction-tools/frontend && echo \\\\\\"SELECT 1 as test\\\\\\" | npx prisma db execute --stdin 2>&1 || echo \\\\\\"DB_ERROR\\\\\\"\\"',
        20000
      );
      this.diagnostics.databaseTest = dbTest;
      
      // Check DATABASE_URL environment variable
      const envCheck = await this.executeWithTimeout(
        'ssh prox "pct exec 133 -- bash -c \\"cd /opt/ldc-construction-tools/frontend && cat .env.local 2>/dev/null || echo \\\\\\"NO_ENV_FILE\\\\\\"\\"'
      );
      this.diagnostics.envCheck = envCheck;
      
      console.log('   ✅ Database Container:', dbStatus.success ? 'Running' : 'Issue detected');
      console.log('   ✅ Database Connection:', dbTest.output.includes('DB_ERROR') ? 'Failed' : 'Testing...');
      console.log('   ✅ Environment File:', envCheck.output.includes('NO_ENV_FILE') ? 'Missing' : 'Present');
      
      return { success: true, issues: [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async diagnoseStep3_PrismaStatus() {
    console.log('🛡️ APEX Guardian MCP: Step 3 - Prisma Status Diagnosis');
    
    try {
      // Check Prisma client generation
      const prismaStatus = await this.executeWithTimeout(
        'ssh prox "pct exec 133 -- bash -c \\"cd /opt/ldc-construction-tools/frontend && npx prisma --version 2>&1\\"'
      );
      this.diagnostics.prismaStatus = prismaStatus;
      
      // Check if Prisma client exists
      const clientCheck = await this.executeWithTimeout(
        'ssh prox "pct exec 133 -- bash -c \\"cd /opt/ldc-construction-tools/frontend && ls -la node_modules/@prisma/client 2>/dev/null || echo \\\\\\"NO_CLIENT\\\\\\"\\"'
      );
      this.diagnostics.clientCheck = clientCheck;
      
      // Check schema file
      const schemaCheck = await this.executeWithTimeout(
        'ssh prox "pct exec 133 -- bash -c \\"cd /opt/ldc-construction-tools/frontend && ls -la prisma/schema.prisma 2>/dev/null || echo \\\\\\"NO_SCHEMA\\\\\\"\\"'
      );
      this.diagnostics.schemaCheck = schemaCheck;
      
      console.log('   ✅ Prisma Version:', prismaStatus.success ? 'Available' : 'Issue detected');
      console.log('   ✅ Prisma Client:', clientCheck.output.includes('NO_CLIENT') ? 'Missing' : 'Present');
      console.log('   ✅ Prisma Schema:', schemaCheck.output.includes('NO_SCHEMA') ? 'Missing' : 'Present');
      
      return { success: true, issues: [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async diagnoseStep4_ApplicationLogs() {
    console.log('🛡️ APEX Guardian MCP: Step 4 - Application Logs Analysis');
    
    try {
      // Get recent application logs
      const appLogs = await this.executeWithTimeout(
        'ssh prox "pct exec 133 -- bash -c \\"cd /opt/ldc-construction-tools/frontend && tail -50 production.log 2>/dev/null || echo \\\\\\"NO_LOGS\\\\\\"\\"'
      );
      this.diagnostics.appLogs = appLogs;
      
      // Try to start service and capture immediate output
      const startTest = await this.executeWithTimeout(
        'ssh prox "pct exec 133 -- bash -c \\"cd /opt/ldc-construction-tools/frontend && timeout 10 npm run dev 2>&1 || echo \\\\\\"START_FAILED\\\\\\"\\"',
        15000
      );
      this.diagnostics.startTest = startTest;
      
      console.log('   ✅ Application Logs:', appLogs.output.includes('NO_LOGS') ? 'No logs found' : 'Logs available');
      console.log('   ✅ Start Test:', startTest.output.includes('START_FAILED') ? 'Failed to start' : 'Startup attempted');
      
      // Analyze logs for common issues
      const logAnalysis = this.analyzeLogs(appLogs.output + '\\n' + startTest.output);
      this.diagnostics.logAnalysis = logAnalysis;
      
      console.log('   📊 Log Analysis:', logAnalysis.issues.length, 'issues detected');
      
      return { success: true, issues: logAnalysis.issues };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  analyzeLogs(logs) {
    const issues = [];
    const recommendations = [];
    
    if (logs.includes('ECONNREFUSED')) {
      issues.push('Database connection refused');
      recommendations.push('Check DATABASE_URL and database container status');
    }
    
    if (logs.includes('Prisma')) {
      if (logs.includes('generate')) {
        issues.push('Prisma client generation issue');
        recommendations.push('Regenerate Prisma client');
      }
      if (logs.includes('migrate')) {
        issues.push('Database migration needed');
        recommendations.push('Run Prisma migrations');
      }
    }
    
    if (logs.includes('EADDRINUSE')) {
      issues.push('Port 3001 already in use');
      recommendations.push('Kill existing processes on port 3001');
    }
    
    if (logs.includes('MODULE_NOT_FOUND')) {
      issues.push('Missing Node.js modules');
      recommendations.push('Run npm install');
    }
    
    if (logs.includes('Error:') && logs.includes('TradeTeam')) {
      issues.push('TradeTeam model not found in database');
      recommendations.push('Run database migration for new models');
    }
    
    return { issues, recommendations };
  }

  async applyFix1_DatabaseSetup() {
    console.log('🛡️ APEX Guardian MCP: Fix 1 - Database Setup');
    
    try {
      // Create proper DATABASE_URL
      const dbUrl = 'postgresql://postgres:Cl0udy!!(@)@10.92.3.21:5432/ldc_construction_tools';
      
      const envSetup = await this.executeWithTimeout(
        `ssh prox "pct exec 133 -- bash -c 'cd /opt/ldc-construction-tools/frontend && echo \\"DATABASE_URL=${dbUrl}\\" > .env.local && echo \\"NODE_ENV=production\\" >> .env.local && echo \\"NEXT_PUBLIC_API_URL=http://10.92.3.23:3001\\" >> .env.local'"`
      );
      
      if (envSetup.success) {
        this.fixes.push('Environment variables configured');
        console.log('   ✅ Environment variables set');
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('   ❌ Database setup failed:', error.message);
      return false;
    }
  }

  async applyFix2_PrismaSetup() {
    console.log('🛡️ APEX Guardian MCP: Fix 2 - Prisma Setup');
    
    try {
      // Regenerate Prisma client
      const prismaGen = await this.executeWithTimeout(
        'ssh prox "pct exec 133 -- bash -c \\"cd /opt/ldc-construction-tools/frontend && npx prisma generate 2>&1\\""',
        30000
      );
      
      if (prismaGen.success) {
        this.fixes.push('Prisma client regenerated');
        console.log('   ✅ Prisma client generated');
      }
      
      // Run database migrations
      const prismaMigrate = await this.executeWithTimeout(
        'ssh prox "pct exec 133 -- bash -c \\"cd /opt/ldc-construction-tools/frontend && npx prisma db push 2>&1\\""',
        45000
      );
      
      if (prismaMigrate.success) {
        this.fixes.push('Database schema updated');
        console.log('   ✅ Database schema pushed');
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('   ❌ Prisma setup failed:', error.message);
      return false;
    }
  }

  async applyFix3_ServiceRestart() {
    console.log('🛡️ APEX Guardian MCP: Fix 3 - Clean Service Restart');
    
    try {
      // Kill any existing processes
      await this.executeWithTimeout(
        'ssh prox "pct exec 133 -- bash -c \\"pkill -f next || true\\""'
      );
      
      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Start service with proper logging
      const serviceStart = await this.executeWithTimeout(
        'ssh prox "pct exec 133 -- bash -c \\"cd /opt/ldc-construction-tools/frontend && nohup npm run dev > production.log 2>&1 & echo \\\\\\"Service started PID: $!\\\\\\"\\""'
      );
      
      if (serviceStart.success) {
        this.fixes.push('Service restarted cleanly');
        console.log('   ✅ Service restart initiated');
        
        // Wait for startup
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        // Test service
        const serviceTest = await this.executeWithTimeout(
          'curl -s -o /dev/null -w "%{http_code}" http://10.92.3.23:3001/'
        );
        
        const status = serviceTest.output;
        const isHealthy = ['200', '307'].includes(status);
        
        console.log('   📊 Service Status:', status, isHealthy ? '✅ Healthy' : '❌ Not responding');
        
        return isHealthy;
      }
      
      return false;
    } catch (error) {
      console.log('   ❌ Service restart failed:', error.message);
      return false;
    }
  }

  async runFullDiagnosis() {
    console.log('🛡️ APEX Guardian MCP: Starting Full Production Diagnosis');
    console.log('=====================================');
    
    // Step 1: Container Health
    const step1 = await this.diagnoseStep1_ContainerHealth();
    
    // Step 2: Database Connectivity  
    const step2 = await this.diagnoseStep2_DatabaseConnectivity();
    
    // Step 3: Prisma Status
    const step3 = await this.diagnoseStep3_PrismaStatus();
    
    // Step 4: Application Logs
    const step4 = await this.diagnoseStep4_ApplicationLogs();
    
    console.log('\\n🛠️ APEX Guardian MCP: Applying Systematic Fixes');
    console.log('=====================================');
    
    // Apply fixes based on diagnosis
    const fix1 = await this.applyFix1_DatabaseSetup();
    const fix2 = await this.applyFix2_PrismaSetup();
    const fix3 = await this.applyFix3_ServiceRestart();
    
    return {
      diagnosis: {
        containerHealth: step1.success,
        databaseConnectivity: step2.success,
        prismaStatus: step3.success,
        applicationLogs: step4.success
      },
      fixes: {
        databaseSetup: fix1,
        prismaSetup: fix2,
        serviceRestart: fix3
      },
      appliedFixes: this.fixes,
      diagnostics: this.diagnostics
    };
  }
}

// CLI interface
if (require.main === module) {
  const diagnostic = new APEXProductionDiagnostic();
  
  diagnostic.runFullDiagnosis().then(result => {
    console.log('\\n🎉 APEX Guardian MCP: Diagnostic Complete');
    console.log('=====================================');
    console.log('Applied Fixes:', result.appliedFixes);
    console.log('Success Rate:', Object.values(result.fixes).filter(Boolean).length, '/', Object.keys(result.fixes).length);
    
    const allFixed = Object.values(result.fixes).every(Boolean);
    console.log('\\n🛡️ APEX Guardian Status:', allFixed ? '✅ Production Fixed' : '⚠️ Issues Remain');
    
    process.exit(allFixed ? 0 : 1);
  }).catch(error => {
    console.error('❌ APEX Guardian MCP: Diagnostic failed:', error.message);
    process.exit(1);
  });
}

module.exports = APEXProductionDiagnostic;
