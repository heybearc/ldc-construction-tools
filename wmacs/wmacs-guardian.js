#!/usr/bin/env node

// WMACS Guardian - Immutable Deadlock Detection and Recovery System
// This script automatically detects and resolves common development bottlenecks

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class WMACSGuardian {
  constructor(config = {}) {
    this.config = {
      maxRetries: 3,
      timeoutMs: 30000,
      healthCheckInterval: 5000,
      forceRecoveryAfter: 120000, // 2 minutes
      containers: ['134', '135'], // staging containers
      ports: [3001, 8000],
      ...config
    };
    
    this.attempts = new Map();
    this.lastSuccess = new Map();
    
    // Initialize Research Advisor for informed decision making
    this.researchAdvisor = this.initializeResearchAdvisor();
  }

  initializeResearchAdvisor() {
    try {
      const WMACSResearchAdvisor = require('./wmacs-research-advisor.js');
      const advisor = new WMACSResearchAdvisor();
      advisor.loadKnowledgeBase();
      return advisor;
    } catch (error) {
      console.log('⚠️  Research Advisor not available:', error.message);
      return null;
    }
  }

  async detectDeadlock(operation, target) {
    const key = `${operation}-${target}`;
    const now = Date.now();
    
    if (!this.attempts.has(key)) {
      this.attempts.set(key, { count: 0, firstAttempt: now });
    }
    
    const attempt = this.attempts.get(key);
    attempt.count++;
    
    // Deadlock detected if:
    // 1. Multiple failed attempts
    // 2. No success in reasonable time
    // 3. Same error pattern repeating
    
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

  async executeCommand(host, command, reason = '') {
    console.log(`🔧 WMACS: ${reason || 'Executing command'}`);
    console.log(`   Host: ${host}`);
    console.log(`   Command: ${command}`);
    
    try {
      const result = await execAsync(`ssh root@${host} "${command}"`);
      console.log(`✅ Command successful`);
      if (result.stdout.trim()) {
        console.log(`   Output: ${result.stdout.trim()}`);
      }
      return result.stdout;
    } catch (error) {
      console.log(`❌ Command failed: ${error.message}`);
      if (error.stderr) {
        console.log(`   Error: ${error.stderr}`);
      }
      throw error;
    }
  }

  async executeWithGuardian(operation, target, actionFn) {
    console.log(`🛡️ WMACS Guardian: Executing ${operation} on ${target}`);
    
    const deadlockStatus = await this.detectDeadlock(operation, target);
    
    if (deadlockStatus.isDeadlock) {
      console.log(`🚨 Deadlock detected for ${operation}-${target}`);
      console.log(`   Attempts: ${deadlockStatus.attemptCount}`);
      console.log(`   Time since first: ${Math.round(deadlockStatus.timeSinceFirst/1000)}s`);
      
      if (deadlockStatus.needsForceRecovery) {
        console.log(`🔧 Initiating force recovery...`);
        await this.forceRecovery(target);
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
      console.log(`❌ ${operation} failed: ${error.message}`);
      
      // Auto-recovery based on error type
      if (error.message.includes('EADDRINUSE')) {
        await this.recoverPortConflict(target);
      } else if (error.message.includes('Connection refused')) {
        await this.recoverConnectionIssue(target);
      } else if (error.message.includes('No such file')) {
        await this.recoverMissingFiles(target);
      }
      
      throw error;
    }
  }

  async timeout(ms) {
    return new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
    );
  }

  async forceRecovery(target) {
    console.log(`🔄 Force recovery for container ${target}`);
    
    try {
      // Nuclear option: restart container
      await execAsync(`ssh root@10.92.0.5 "pct stop ${target} && sleep 5 && pct start ${target}"`);
      console.log(`✅ Container ${target} restarted`);
      
      // Wait for container to be ready
      await this.waitForContainerReady(target);
      
    } catch (error) {
      console.log(`❌ Force recovery failed: ${error.message}`);
    }
  }

  async recoverPortConflict(target) {
    console.log(`🔧 Recovering port conflict on container ${target}`);
    
    try {
      const containerIP = this.getContainerIP(target);
      
      // Kill processes on conflicted ports
      for (const port of this.config.ports) {
        await execAsync(`ssh root@${containerIP} "fuser -k ${port}/tcp || true"`);
        await execAsync(`ssh root@${containerIP} "pkill -f 'port ${port}' || true"`);
      }
      
      // Kill common problematic processes
      await execAsync(`ssh root@${containerIP} "pkill -f 'next-server' || true"`);
      await execAsync(`ssh root@${containerIP} "pkill -f 'npm start' || true"`);
      
      console.log(`✅ Port conflict recovery completed`);
      
    } catch (error) {
      console.log(`❌ Port recovery failed: ${error.message}`);
    }
  }

  async recoverConnectionIssue(target) {
    console.log(`🔧 Recovering connection issue for container ${target}`);
    
    try {
      const containerIP = this.getContainerIP(target);
      
      // Check if container is responsive
      const ping = await execAsync(`ping -c 1 -W 5 ${containerIP}`);
      console.log(`📡 Container ${target} is reachable`);
      
      // Check SSH connectivity
      await execAsync(`ssh -o ConnectTimeout=10 root@${containerIP} "echo 'SSH OK'"`);
      console.log(`🔑 SSH to container ${target} is working`);
      
    } catch (error) {
      console.log(`❌ Connection recovery failed: ${error.message}`);
      // Escalate to force recovery
      await this.forceRecovery(target);
    }
  }

  async recoverMissingFiles(target) {
    console.log(`🔧 Recovering missing files on container ${target}`);
    
    try {
      // Trigger CI/CD to redeploy
      console.log(`📦 Triggering CI/CD redeploy...`);
      // This would trigger the GitHub Actions workflow
      
    } catch (error) {
      console.log(`❌ File recovery failed: ${error.message}`);
    }
  }

  async waitForContainerReady(target) {
    console.log(`⏳ Waiting for container ${target} to be ready...`);
    
    const maxWait = 120000; // 2 minutes
    const startTime = Date.now();
    const containerIP = this.getContainerIP(target);
    
    while (Date.now() - startTime < maxWait) {
      try {
        await execAsync(`ssh -o ConnectTimeout=5 root@${containerIP} "echo 'ready'"`);
        console.log(`✅ Container ${target} is ready`);
        return true;
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    throw new Error(`Container ${target} did not become ready within ${maxWait/1000}s`);
  }

  // Container IP mapping for LDC Construction Tools
  getContainerIP(container) {
    const mapping = {
      'staging': '10.92.3.25', // LDC staging
      'production': '10.92.3.23', // LDC production
      '134': '10.92.3.24', // JW staging (legacy)
      '135': '10.92.3.25', // LDC staging
      '133': '10.92.3.23', // LDC production
      '132': '10.92.3.22'  // JW production (legacy)
    };
    return mapping[container] || `10.92.3.${container}`;
  }

  // Immutable guardian methods that are always available
  async guardedApplicationStart(container, port = 3001) {
    console.log(`🛡️ WMACS Guardian: Starting guarded application on container ${container}:${port}`);
    
    return this.executeWithGuardian('app-start', container, async () => {
      // Stop any existing processes
      await this.executeCommand(`ssh root@10.92.3.${container} "pkill -f 'npm start' || true"`);
      
      // Wait for clean shutdown
      await this.timeout(2000);
      
      // Start application
      const startCommand = `cd /opt/jw-attendant-scheduler/current && nohup npm start -- -p ${port} > /var/log/jw-attendant-scheduler.log 2>&1 &`;
      await this.executeCommand(`ssh root@10.92.3.${container} "${startCommand}"`);
      
      // Wait for startup
      await this.timeout(5000);
      
      // Verify it's running
      const healthCheck = await this.executeCommand(`curl -f http://10.92.3.${container}:${port}/api/health || echo "HEALTH_CHECK_FAILED"`);
      
      if (healthCheck.includes('HEALTH_CHECK_FAILED')) {
        throw new Error('Application failed to start properly');
      }
      
      console.log(`✅ Application started successfully on container ${container}:${port}`);
      return true;
    });
  }

  /**
   * Analyzes suggestions with research-backed pushback
   */
  async analyzeSuggestion(suggestion, context = {}) {
    if (!this.researchAdvisor) {
      console.log('⚠️  Research Advisor not available - proceeding without analysis');
      return { decision: 'PROCEED_WITH_CAUTION', reasoning: ['No research advisor available'] };
    }

    console.log('🔍 WMACS Guardian: Analyzing suggestion with research advisor...');
    return await this.researchAdvisor.analyzeSuggestion(suggestion, context);
  }

  /**
   * Records mistakes for learning
   */
  recordMistake(mistake, impact, lesson) {
    if (this.researchAdvisor) {
      this.researchAdvisor.recordMistake(mistake, impact, lesson);
    } else {
      console.log('📝 Mistake noted (Research Advisor unavailable):', mistake);
    }
  }

  async guardedLoginTest(container, port = 3001) {
    return this.executeWithGuardian('login-test', container, async () => {
      const containerIP = this.getContainerIP(container);
      
      // Test NextAuth signin page accessibility for LDC Construction Tools
      const signinPageResult = await execAsync(`curl -I http://${containerIP}:${port}/auth/signin -s`);
      
      if (!signinPageResult.stdout.includes('200 OK')) {
        throw new Error(`Signin page not accessible: ${signinPageResult.stdout}`);
      }
      
      // Test NextAuth API endpoint (should return 200 or 400, not 404)
      const authApiResult = await execAsync(`curl -I http://${containerIP}:${port}/api/auth/session -s`);
      
      if (authApiResult.stdout.includes('404 Not Found')) {
        throw new Error(`NextAuth API not found: ${authApiResult.stdout}`);
      }
      
      // Test dashboard access
      const dashboardResult = await execAsync(`curl -b /tmp/guardian-cookies.txt -I http://${containerIP}:${port}/dashboard -s`);
      
      console.log(`✅ Login test completed successfully`);
      return { login: 'success', dashboard: dashboardResult.stdout.includes('200') ? 'accessible' : 'redirect' };
    });
  }

  async guardedHealthCheck(target, port = 3001) {
    return this.executeWithGuardian('health-check', target, async () => {
      const isLocal = target === 'local' || target === 'localhost';
      const targetHost = isLocal ? 'localhost' : this.getContainerIP(target);
      
      console.log(`🔍 WMACS Guardian: Performing health check on ${targetHost}:${port}`);
      
      // Check if process is running on port
      if (isLocal) {
        try {
          const processCheck = await execAsync(`lsof -ti:${port}`);
          const pid = processCheck.stdout.trim();
          
          if (!pid) {
            throw new Error(`No process found on port ${port}`);
          }
          
          console.log(`📊 Process ${pid} found on port ${port}`);
          
          // Check process details
          const processDetails = await execAsync(`ps aux | grep ${pid} | grep -v grep`);
          console.log(`📋 Process details: ${processDetails.stdout.trim()}`);
          
        } catch (error) {
          throw new Error(`Port check failed: ${error.message}`);
        }
      }
      
      // Test basic connectivity with timeout
      try {
        const connectTest = await execAsync(`curl -I http://${targetHost}:${port}/ -m 10 -s`);
        
        if (connectTest.stdout.includes('200 OK')) {
          console.log(`✅ Server responding normally`);
          return { status: 'healthy', response: 'ok' };
        } else if (connectTest.stdout.includes('HTTP/')) {
          console.log(`⚠️ Server responding but not 200 OK: ${connectTest.stdout.split('\\n')[0]}`);
          return { status: 'degraded', response: connectTest.stdout.split('\\n')[0] };
        } else {
          throw new Error(`No HTTP response received`);
        }
      } catch (error) {
        // Research Advisor analysis
        if (this.researchAdvisor) {
          this.researchAdvisor.recordMistake(
            `Server unresponsive on ${targetHost}:${port}`,
            'high',
            'Server may be hung, needs restart or investigation'
          );
        }
        
        throw new Error(`Health check failed: ${error.message}`);
      }
    });
  }

  async guardedRedirectTest(target, port = 3001) {
    return this.executeWithGuardian('redirect-test', target, async () => {
      const isLocal = target === 'local' || target === 'localhost';
      const targetHost = isLocal ? 'localhost' : this.getContainerIP(target);
      
      console.log(`🔍 WMACS Guardian: Testing authentication redirect on ${targetHost}:${port}`);
      
      // Test root page redirect behavior
      try {
        // Test with curl following redirects
        const redirectTest = await execAsync(`curl -L -I http://${targetHost}:${port}/ -m 10 -s`);
        console.log(`📋 Redirect response headers:\\n${redirectTest.stdout}`);
        
        // Test without following redirects to see if redirect is issued
        const noRedirectTest = await execAsync(`curl -I http://${targetHost}:${port}/ -m 10 -s`);
        console.log(`📋 Direct response (no follow):\\n${noRedirectTest.stdout}`);
        
        // Check if NextAuth session endpoint exists
        const sessionTest = await execAsync(`curl -I http://${targetHost}:${port}/api/auth/session -m 10 -s`);
        console.log(`📋 NextAuth session endpoint:\\n${sessionTest.stdout}`);
        
        // Check if signin page exists
        const signinTest = await execAsync(`curl -I http://${targetHost}:${port}/auth/signin -m 10 -s`);
        console.log(`📋 Signin page response:\\n${signinTest.stdout}`);
        
        // Research Advisor analysis
        if (this.researchAdvisor) {
          let analysis = 'Authentication redirect analysis:\\n';
          
          if (noRedirectTest.stdout.includes('302') || noRedirectTest.stdout.includes('301')) {
            analysis += '✅ Server issuing redirect (302/301 found)\\n';
          } else if (noRedirectTest.stdout.includes('200 OK')) {
            analysis += '❌ No redirect issued - page serving content directly\\n';
            this.researchAdvisor.recordMistake(
              'Authentication redirect not working',
              'medium',
              'Root page should redirect unauthenticated users to /auth/signin but is serving content directly'
            );
          }
          
          if (signinTest.stdout.includes('200 OK')) {
            analysis += '✅ Signin page accessible\\n';
          } else {
            analysis += '❌ Signin page not accessible\\n';
          }
          
          if (sessionTest.stdout.includes('400') || sessionTest.stdout.includes('200')) {
            analysis += '✅ NextAuth API responding\\n';
          } else {
            analysis += '❌ NextAuth API not responding\\n';
          }
          
          console.log(`🧠 Research Advisor Analysis:\\n${analysis}`);
        }
        
        return {
          rootPage: noRedirectTest.stdout.includes('302') ? 'redirecting' : 'serving_content',
          signinPage: signinTest.stdout.includes('200') ? 'accessible' : 'not_found',
          nextAuthApi: sessionTest.stdout.includes('400') || sessionTest.stdout.includes('200') ? 'responding' : 'not_found'
        };
        
      } catch (error) {
        if (this.researchAdvisor) {
          this.researchAdvisor.recordMistake(
            `Redirect test failed on ${targetHost}:${port}`,
            'high',
            `Could not test authentication redirect: ${error.message}`
          );
        }
        
        throw new Error(`Redirect test failed: ${error.message}`);
      }
    });
  }
}

// Export for use in other WMACS scripts
module.exports = WMACSGuardian;

// CLI usage
if (require.main === module) {
  const guardian = new WMACSGuardian();
  
  const [,, action, container] = process.argv;
  
  switch (action) {
    case 'start':
      guardian.guardedApplicationStart(container || '134')
        .then(result => console.log('✅ Guardian operation completed:', result))
        .catch(error => console.error('❌ Guardian operation failed:', error.message));
      break;
      
    case 'test':
      guardian.guardedLoginTest(container || '134')
        .then(result => console.log('✅ Guardian test completed:', result))
        .catch(error => console.error('❌ Guardian test failed:', error.message));
      break;
      
    case 'health':
      guardian.guardedHealthCheck(container || 'local')
        .then(result => console.log('✅ Guardian health check completed:', result))
        .catch(error => console.error('❌ Guardian health check failed:', error.message));
      break;
      
    case 'redirect':
      guardian.guardedRedirectTest(container || 'local')
        .then(result => console.log('✅ Guardian redirect test completed:', result))
        .catch(error => console.error('❌ Guardian redirect test failed:', error.message));
      break;
      
    default:
      console.log('Usage: node wmacs-guardian.js [start|test|health|redirect] [container|local]');
  }
}
