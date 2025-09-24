#!/usr/bin/env node

/**
 * APEX MCP Async Server
 * 
 * Non-blocking MCP server for APEX operations
 * Uses timeouts and async operations to prevent hanging
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class WMACsMCPAsync {
  constructor() {
    this.config = this.loadConfig();
    this.timeout = 10000; // 10 second timeout
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, 'config', 'environments.json');
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      console.error('❌ Failed to load APEX config:', error.message);
      return {
        production: { container: '133', ip: '10.92.3.23', ports: { frontend: 3001 } },
        staging: { container: '135', ip: '10.92.3.25', ports: { frontend: 3001 } }
      };
    }
  }

  async executeWithTimeout(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        child.kill('SIGKILL');
        reject(new Error(`Command timed out after ${this.timeout}ms`));
      }, this.timeout);

      const child = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        ...options
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        clearTimeout(timeout);
        resolve({
          code,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          success: code === 0
        });
      });

      child.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  async quickTest(environment) {
    console.log(`🛡️ APEX MCP Async: Quick test ${environment}`);
    
    const env = this.config[environment];
    if (!env) {
      return { success: false, error: `Environment ${environment} not found` };
    }

    try {
      const result = await this.executeWithTimeout('curl', [
        '-s', '-o', '/dev/null', '-w', '%{http_code}',
        `http://${env.ip}:${env.ports.frontend}/`
      ]);

      const status = result.stdout;
      const isHealthy = ['200', '307'].includes(status);

      return {
        success: isHealthy,
        environment,
        container: env.container,
        ip: env.ip,
        status,
        message: isHealthy ? 'Service responding' : `HTTP ${status}`
      };
    } catch (error) {
      return {
        success: false,
        environment,
        error: error.message,
        message: 'Service not responding'
      };
    }
  }

  async restartService(environment) {
    console.log(`🛡️ APEX MCP Async: Restart service ${environment}`);
    
    const env = this.config[environment];
    if (!env) {
      return { success: false, error: `Environment ${environment} not found` };
    }

    try {
      const command = `pct exec ${env.container} -- bash -c 'cd /opt/ldc-construction-tools/frontend && pkill -f "next dev" || true && sleep 2 && nohup npm run dev > /dev/null 2>&1 &'`;
      
      const result = await this.executeWithTimeout('ssh', ['prox', command]);

      return {
        success: result.success,
        environment,
        container: env.container,
        ip: env.ip,
        message: result.success ? 'Service restart initiated' : 'Restart failed',
        details: result.stderr || result.stdout
      };
    } catch (error) {
      return {
        success: false,
        environment,
        error: error.message,
        message: 'Restart command timed out'
      };
    }
  }

  async getStatus() {
    console.log('🛡️ APEX MCP Async: Getting system status');
    
    const environments = ['staging', 'production'];
    const results = {};

    for (const env of environments) {
      results[env] = await this.quickTest(env);
    }

    return {
      success: true,
      timestamp: new Date().toISOString(),
      environments: results,
      message: 'Status check completed'
    };
  }

  async deploymentSummary() {
    console.log('🛡️ APEX MCP Async: Deployment summary');
    
    return {
      success: true,
      deployment: {
        staging: {
          container: '135',
          ip: '10.92.3.25',
          status: 'operational',
          features: ['Dashboard', 'Trade Teams', 'Projects', 'Volunteers']
        },
        production: {
          container: '133',
          ip: '10.92.3.23',
          status: 'deployed',
          features: ['Next.js 15 compatibility', 'Environment config updated', 'Code deployed']
        }
      },
      nextSteps: [
        'Validate production service is running',
        'Test production endpoints',
        'Complete admin module work'
      ],
      message: 'Deployment status summary generated'
    };
  }
}

// CLI interface
if (require.main === module) {
  const server = new WMACsMCPAsync();
  const [operation, ...args] = process.argv.slice(2);

  const operations = {
    'test': (env) => server.quickTest(env || 'production'),
    'restart': (env) => server.restartService(env || 'production'),
    'status': () => server.getStatus(),
    'summary': () => server.deploymentSummary()
  };

  if (!operation || !operations[operation]) {
    console.log('🛡️ APEX MCP Async Server - Available Operations:');
    Object.keys(operations).forEach(op => console.log(`   • ${op}`));
    console.log('\nUsage: node apex-mcp-async.js <operation> [args...]');
    process.exit(0);
  }

  operations[operation](...args)
    .then(result => {
      console.log('🎉 APEX MCP Async: Result:', JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ APEX MCP Async: Error:', error.message);
      process.exit(1);
    });
}

module.exports = WMACsMCPAsync;
