#!/usr/bin/env node

// WMACS Guardian - LDC Construction Tools Specific Implementation
// Extends the universal guardian with LDC-specific recovery logic

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class WMACSGuardianLDC {
  constructor(config = {}) {
    this.config = {
      projectId: 'ldc-construction-tools',
      operationNamespace: 'ldc-tools',
      maxRetries: 3,
      timeoutMs: 30000,
      healthCheckInterval: 5000,
      forceRecoveryAfter: 120000,
      containers: {
        staging: { id: '135', ip: '10.92.3.25' },
        production: { id: '133', ip: '10.92.3.23' }
      },
      ports: {
        frontend: 3001,
        backend: 8000
      },
      services: {
        frontend: 'ldc-tools-frontend',
        backend: 'ldc-tools-backend'
      },
      ...config
    };
    
    this.attempts = new Map();
    this.lastSuccess = new Map();
  }

  async detectDeadlock(operation, target) {
    const key = `${operation}-${target}`;
    const now = Date.now();
    
    if (!this.attempts.has(key)) {
      this.attempts.set(key, { count: 0, firstAttempt: now });
    }
    
    const attempt = this.attempts.get(key);
    attempt.count++;
    
    const timeSinceFirst = now - attempt.firstAttempt;
    const lastSuccessTime = this.lastSuccess.get(key) || 0;
    const timeSinceLastSuccess = now - lastSuccessTime;
    
    return {
      isDeadlock: attempt.count >= 3 && timeSinceFirst > 60000,
      needsForceRecovery: timeSinceLastSuccess > this.config.forceRecoveryAfter,
      attemptCount: attempt.count,
      timeSinceFirst
    };
  }

  async executeWithGuardian(operation, target, actionFn) {
    console.log(`🛡️ LDC Guardian: Executing ${operation} on ${target}`);
    
    const deadlockStatus = await this.detectDeadlock(operation, target);
    
    if (deadlockStatus.isDeadlock) {
      console.log(`🚨 LDC Deadlock detected for ${operation}-${target}`);
      console.log(`   Attempts: ${deadlockStatus.attemptCount}`);
      console.log(`   Time since first: ${Math.round(deadlockStatus.timeSinceFirst/1000)}s`);
      
      if (deadlockStatus.needsForceRecovery) {
        console.log(`🔧 Initiating LDC force recovery...`);
        await this.forceRecoveryLDC(target);
      }
    }
    
    try {
      const result = await Promise.race([
        actionFn(),
        this.timeout(this.config.timeoutMs)
      ]);
      
      // Success - reset counters
      this.attempts.delete(`${operation}-${target}`);
      this.lastSuccess.set(`${operation}-${target}`, Date.now());
      
      return result;
    } catch (error) {
      console.log(`❌ LDC ${operation} failed: ${error.message}`);
      
      // LDC-specific auto-recovery
      if (error.message.includes('EADDRINUSE')) {
        await this.recoverLDCPortConflict(target);
      } else if (error.message.includes('Connection refused')) {
        await this.recoverLDCConnectionIssue(target);
      } else if (error.message.includes('Database')) {
        await this.recoverLDCDatabaseIssue(target);
      } else if (error.message.includes('No such file')) {
        await this.recoverLDCMissingFiles(target);
      }
      
      throw error;
    }
  }

  async timeout(ms) {
    return new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`LDC operation timed out after ${ms}ms`)), ms)
    );
  }

  async forceRecoveryLDC(target) {
    console.log(`🔄 LDC Force recovery for ${target}`);
    
    try {
      const container = this.getContainerInfo(target);
      
      // Stop LDC services gracefully first
      await execAsync(`ssh root@${container.ip} "systemctl stop ldc-frontend ldc-backend || true"`);
      
      // Kill any remaining processes
      await execAsync(`ssh root@${container.ip} "pkill -f 'ldc-tools' || true"`);
      await execAsync(`ssh root@${container.ip} "pkill -f 'next-server' || true"`);
      await execAsync(`ssh root@${container.ip} "pkill -f 'fastapi' || true"`);
      
      // Clear port bindings
      for (const port of Object.values(this.config.ports)) {
        await execAsync(`ssh root@${container.ip} "fuser -k ${port}/tcp || true"`);
      }
      
      // Nuclear option: restart container if needed
      if (target.includes('force')) {
        await execAsync(`ssh root@10.92.0.5 "pct stop ${container.id} && sleep 5 && pct start ${container.id}"`);
        console.log(`✅ Container ${container.id} restarted`);
        await this.waitForContainerReady(container);
      }
      
    } catch (error) {
      console.log(`❌ LDC Force recovery failed: ${error.message}`);
    }
  }

  async recoverLDCPortConflict(target) {
    console.log(`🔧 Recovering LDC port conflict on ${target}`);
    
    try {
      const container = this.getContainerInfo(target);
      
      // Kill processes on LDC ports
      for (const port of Object.values(this.config.ports)) {
        await execAsync(`ssh root@${container.ip} "fuser -k ${port}/tcp || true"`);
        await execAsync(`ssh root@${container.ip} "pkill -f 'port ${port}' || true"`);
      }
      
      // Kill LDC-specific processes
      await execAsync(`ssh root@${container.ip} "pkill -f 'ldc-tools' || true"`);
      await execAsync(`ssh root@${container.ip} "pkill -f 'npm.*ldc' || true"`);
      await execAsync(`ssh root@${container.ip} "pkill -f 'uvicorn.*ldc' || true"`);
      
      console.log(`✅ LDC Port conflict recovery completed`);
      
    } catch (error) {
      console.log(`❌ LDC Port recovery failed: ${error.message}`);
    }
  }

  async recoverLDCConnectionIssue(target) {
    console.log(`🔧 Recovering LDC connection issue for ${target}`);
    
    try {
      const container = this.getContainerInfo(target);
      
      // Check container connectivity
      const ping = await execAsync(`ping -c 1 -W 5 ${container.ip}`);
      console.log(`📡 LDC Container ${target} is reachable`);
      
      // Check SSH connectivity
      await execAsync(`ssh -o ConnectTimeout=10 root@${container.ip} "echo 'LDC SSH OK'"`);
      console.log(`🔑 SSH to LDC container ${target} is working`);
      
      // Check LDC application directories
      await execAsync(`ssh root@${container.ip} "ls -la /opt/ldc-construction-tools/current"`);
      console.log(`📁 LDC application directory exists`);
      
    } catch (error) {
      console.log(`❌ LDC Connection recovery failed: ${error.message}`);
      // Escalate to force recovery
      await this.forceRecoveryLDC(target);
    }
  }

  async recoverLDCDatabaseIssue(target) {
    console.log(`🔧 Recovering LDC database issue for ${target}`);
    
    try {
      const container = this.getContainerInfo(target);
      
      // Test database connectivity
      const dbTest = target.includes('staging') ? 
        'ldc_construction_tools_staging' : 'ldc_construction_tools';
      
      await execAsync(`ssh root@${container.ip} "cd /opt/ldc-construction-tools/current && python3 -c 'import psycopg2; conn = psycopg2.connect(host=\"10.92.3.21\", database=\"${dbTest}\", user=\"ldc_user\", password=\"ldc_password\"); print(\"DB OK\"); conn.close()'"`);
      console.log(`✅ LDC Database connectivity restored`);
      
    } catch (error) {
      console.log(`❌ LDC Database recovery failed: ${error.message}`);
    }
  }

  async recoverLDCMissingFiles(target) {
    console.log(`🔧 Recovering LDC missing files on ${target}`);
    
    try {
      console.log(`📦 Triggering LDC WMACS redeploy...`);
      // This would trigger the GitHub Actions workflow for LDC
      // For now, log the recovery action needed
      console.log(`⚠️  Manual intervention needed: Redeploy LDC via WMACS pipeline`);
      
    } catch (error) {
      console.log(`❌ LDC File recovery failed: ${error.message}`);
    }
  }

  async waitForContainerReady(container) {
    console.log(`⏳ Waiting for LDC container ${container.id} to be ready...`);
    
    const maxWait = 120000; // 2 minutes
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      try {
        await execAsync(`ssh -o ConnectTimeout=5 root@${container.ip} "echo 'ready'"`);
        console.log(`✅ LDC Container ${container.id} is ready`);
        return true;
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    throw new Error(`LDC Container ${container.id} did not become ready within ${maxWait/1000}s`);
  }

  getContainerInfo(target) {
    if (target.includes('staging') || target.includes('135')) {
      return this.config.containers.staging;
    } else if (target.includes('production') || target.includes('133')) {
      return this.config.containers.production;
    }
    throw new Error(`Unknown LDC target: ${target}`);
  }

  // LDC-specific guardian methods
  async guardedLDCApplicationStart(environment, services = ['frontend', 'backend']) {
    return this.executeWithGuardian('ldc-app-start', environment, async () => {
      const container = this.getContainerInfo(environment);
      
      // Pre-flight checks
      await this.recoverLDCPortConflict(environment);
      
      // Start LDC services
      for (const service of services) {
        const port = this.config.ports[service];
        const serviceName = this.config.services[service];
        
        console.log(`🚀 Starting LDC ${service} on port ${port}`);
        
        if (service === 'frontend') {
          const startCmd = `ssh root@${container.ip} "cd /opt/ldc-construction-tools/current/frontend && \\
NODE_ENV=production \\
PORT=${port} \\
npm start > /var/log/ldc-frontend.log 2>&1 &"`;
          
          await execAsync(startCmd);
        } else if (service === 'backend') {
          const startCmd = `ssh root@${container.ip} "cd /opt/ldc-construction-tools/current/backend && \\
source venv/bin/activate && \\
uvicorn app.main:app --host 0.0.0.0 --port ${port} > /var/log/ldc-backend.log 2>&1 &"`;
          
          await execAsync(startCmd);
        }
      }
      
      // Verify startup
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      for (const service of services) {
        const port = this.config.ports[service];
        const healthEndpoint = service === 'frontend' ? '/' : '/api/v1/health';
        
        const healthCheck = await execAsync(`curl -s -o /dev/null -w "%{http_code}" http://${container.ip}:${port}${healthEndpoint}`);
        
        if (!['200', '302'].includes(healthCheck.stdout.trim())) {
          throw new Error(`LDC ${service} failed to start properly: HTTP ${healthCheck.stdout.trim()}`);
        }
      }
      
      console.log(`✅ LDC Application started successfully on ${container.ip}`);
      return { container: container.ip, services, status: 'running' };
    });
  }

  async guardedLDCHealthCheck(environment) {
    return this.executeWithGuardian('ldc-health-check', environment, async () => {
      const container = this.getContainerInfo(environment);
      
      const results = {};
      
      // Check frontend
      try {
        const frontendCheck = await execAsync(`curl -s -o /dev/null -w "%{http_code}" http://${container.ip}:${this.config.ports.frontend}/`);
        results.frontend = frontendCheck.stdout.trim();
      } catch (error) {
        results.frontend = 'error';
      }
      
      // Check backend
      try {
        const backendCheck = await execAsync(`curl -s -o /dev/null -w "%{http_code}" http://${container.ip}:${this.config.ports.backend}/api/v1/health`);
        results.backend = backendCheck.stdout.trim();
      } catch (error) {
        results.backend = 'error';
      }
      
      // Check database
      try {
        const dbName = environment.includes('staging') ? 'ldc_construction_tools_staging' : 'ldc_construction_tools';
        await execAsync(`ssh root@${container.ip} "cd /opt/ldc-construction-tools/current && python3 -c 'import psycopg2; psycopg2.connect(host=\"10.92.3.21\", database=\"${dbName}\", user=\"ldc_user\", password=\"ldc_password\").close()'"`);
        results.database = 'ok';
      } catch (error) {
        results.database = 'error';
      }
      
      console.log(`✅ LDC Health check completed:`, results);
      return results;
    });
  }
}

// Export for use in other WMACS scripts
module.exports = WMACSGuardianLDC;

// CLI usage
if (require.main === module) {
  const guardian = new WMACSGuardianLDC();
  
  const [,, action, environment] = process.argv;
  
  switch (action) {
    case 'start':
      guardian.guardedLDCApplicationStart(environment || 'staging')
        .then(result => console.log('✅ LDC Guardian operation completed:', result))
        .catch(error => console.error('❌ LDC Guardian operation failed:', error.message));
      break;
      
    case 'health':
      guardian.guardedLDCHealthCheck(environment || 'staging')
        .then(result => console.log('✅ LDC Guardian health check completed:', result))
        .catch(error => console.error('❌ LDC Guardian health check failed:', error.message));
      break;
      
    case 'recover':
      guardian.forceRecoveryLDC(environment || 'staging')
        .then(() => console.log('✅ LDC Guardian recovery completed'))
        .catch(error => console.error('❌ LDC Guardian recovery failed:', error.message));
      break;
      
    default:
      console.log('Usage: node wmacs-guardian-ldc.js [start|health|recover] [staging|production]');
  }
}
