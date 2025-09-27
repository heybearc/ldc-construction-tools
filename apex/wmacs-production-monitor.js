#!/usr/bin/env node

/**
 * APEX Production Service Monitor
 * 
 * Ensures production service stays running and restarts automatically
 */

const { execSync, spawn } = require('child_process');

class APEXProductionMonitor {
  constructor() {
    this.config = {
      production: { container: '133', ip: '10.92.3.23', ports: { frontend: 3001 } }
    };
    this.restartAttempts = 0;
    this.maxRestarts = 5;
  }

  async checkService() {
    try {
      const result = execSync(`curl -s -o /dev/null -w "%{http_code}" http://10.92.3.23:3001/`, { encoding: 'utf8' });
      const status = result.trim();
      return ['200', '307'].includes(status);
    } catch (error) {
      return false;
    }
  }

  async isProcessRunning() {
    try {
      const result = execSync(`ssh prox "pct exec 133 -- bash -c 'ps aux | grep next | grep -v grep'"`, { encoding: 'utf8' });
      return result.includes('next');
    } catch (error) {
      return false;
    }
  }

  async startService() {
    console.log(`🛡️ APEX Monitor: Starting production service (attempt ${this.restartAttempts + 1})`);
    
    try {
      // Kill any existing processes
      execSync(`ssh prox "pct exec 133 -- bash -c 'pkill -f \"next\" || true'"`, { stdio: 'inherit' });
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Start service in background with proper logging
      execSync(`ssh prox "pct exec 133 -- bash -c 'cd /opt/ldc-construction-tools/frontend && nohup npm run dev > production.log 2>&1 &'"`, { stdio: 'inherit' });
      
      console.log('✅ APEX Monitor: Service start command executed');
      
      // Wait for startup
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Check if it's actually running
      const isRunning = await this.isProcessRunning();
      const isResponding = await this.checkService();
      
      if (isRunning && isResponding) {
        console.log('✅ APEX Monitor: Production service is running and responding');
        this.restartAttempts = 0;
        return true;
      } else if (isRunning) {
        console.log('⚠️  APEX Monitor: Service running but not responding yet');
        return true;
      } else {
        console.log('❌ APEX Monitor: Service failed to start');
        return false;
      }
      
    } catch (error) {
      console.error('❌ APEX Monitor: Error starting service:', error.message);
      return false;
    }
  }

  async monitor() {
    console.log('🛡️ APEX Production Monitor: Starting monitoring...');
    
    while (this.restartAttempts < this.maxRestarts) {
      const isRunning = await this.isProcessRunning();
      const isResponding = await this.checkService();
      
      if (isRunning && isResponding) {
        console.log('✅ APEX Monitor: Production service healthy');
        return { success: true, message: 'Service is running and responding' };
      } else if (!isRunning) {
        console.log('⚠️  APEX Monitor: Service not running, attempting restart...');
        const started = await this.startService();
        
        if (!started) {
          this.restartAttempts++;
          console.log(`❌ APEX Monitor: Restart failed (${this.restartAttempts}/${this.maxRestarts})`);
          
          if (this.restartAttempts >= this.maxRestarts) {
            return { 
              success: false, 
              message: `Failed to start service after ${this.maxRestarts} attempts`,
              recommendations: [
                'Check for database connection issues',
                'Verify Prisma client generation',
                'Check for port conflicts',
                'Review application logs for errors'
              ]
            };
          }
          
          // Wait before next attempt
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } else {
        console.log('⚠️  APEX Monitor: Service running but not responding, waiting...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
    
    return { success: false, message: 'Monitoring completed with issues' };
  }

  async getLogs() {
    try {
      const logs = execSync(`ssh prox "pct exec 133 -- bash -c 'cd /opt/ldc-construction-tools/frontend && tail -20 production.log 2>/dev/null || echo \"No logs available\"'"`, { encoding: 'utf8' });
      return logs;
    } catch (error) {
      return 'Error retrieving logs: ' + error.message;
    }
  }
}

// CLI interface
if (require.main === module) {
  const monitor = new APEXProductionMonitor();
  
  const [action] = process.argv.slice(2);
  
  if (action === 'logs') {
    monitor.getLogs().then(logs => {
      console.log('🛡️ APEX Monitor: Production Logs:');
      console.log(logs);
    });
  } else {
    monitor.monitor().then(result => {
      console.log('🎉 APEX Monitor: Final Result:', JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    });
  }
}

module.exports = APEXProductionMonitor;
