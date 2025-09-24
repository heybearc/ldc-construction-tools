#!/usr/bin/env node

/**
 * APEX Guardian MCP
 * 
 * Enhanced MCP server with diagnostic capabilities for production issues
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class APEXGuardianMCP {
  constructor() {
    this.config = this.loadConfig();
    this.timeout = 15000; // 15 second timeout for diagnostics
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, 'config', 'environments.json');
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
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

  async diagnoseProduction() {
    console.log('🛡️ APEX Guardian MCP: Diagnosing production issues');
    
    const env = this.config.production;
    const diagnostics = {};

    try {
      // Check if container is running
      console.log('   • Checking container status...');
      const containerCheck = await this.executeWithTimeout('ssh', [
        'prox', `pct list | grep ${env.container}`
      ]);
      diagnostics.container = {
        running: containerCheck.success && containerCheck.stdout.includes('running'),
        details: containerCheck.stdout || containerCheck.stderr
      };

      // Check if Next.js process is running
      console.log('   • Checking Next.js process...');
      const processCheck = await this.executeWithTimeout('ssh', [
        'prox', `pct exec ${env.container} -- bash -c 'ps aux | grep next | grep -v grep'`
      ]);
      diagnostics.nextjs = {
        running: processCheck.success && processCheck.stdout.includes('next'),
        details: processCheck.stdout || 'No Next.js process found'
      };

      // Check if port is listening
      console.log('   • Checking port availability...');
      const portCheck = await this.executeWithTimeout('ssh', [
        'prox', `pct exec ${env.container} -- bash -c 'netstat -tlnp | grep :3001 || ss -tlnp | grep :3001'`
      ]);
      diagnostics.port = {
        listening: portCheck.success && portCheck.stdout.includes('3001'),
        details: portCheck.stdout || 'Port 3001 not listening'
      };

      // Check application logs
      console.log('   • Checking application logs...');
      const logCheck = await this.executeWithTimeout('ssh', [
        'prox', `pct exec ${env.container} -- bash -c 'cd /opt/ldc-construction-tools/frontend && tail -20 production.log 2>/dev/null || echo "No log file found"'`
      ]);
      diagnostics.logs = {
        available: logCheck.success,
        content: logCheck.stdout || logCheck.stderr || 'No logs available'
      };

      return {
        success: true,
        environment: 'production',
        container: env.container,
        ip: env.ip,
        diagnostics,
        recommendations: this.generateRecommendations(diagnostics)
      };

    } catch (error) {
      return {
        success: false,
        environment: 'production',
        error: error.message,
        diagnostics
      };
    }
  }

  generateRecommendations(diagnostics) {
    const recommendations = [];

    if (!diagnostics.container?.running) {
      recommendations.push('Container is not running - check Proxmox status');
    }

    if (!diagnostics.nextjs?.running) {
      recommendations.push('Next.js process not running - restart service');
    }

    if (!diagnostics.port?.listening) {
      recommendations.push('Port 3001 not listening - check service startup');
    }

    if (diagnostics.logs?.content.includes('error') || diagnostics.logs?.content.includes('Error')) {
      recommendations.push('Errors found in logs - check application configuration');
    }

    if (recommendations.length === 0) {
      recommendations.push('All diagnostics passed - check network connectivity');
    }

    return recommendations;
  }

  async forceRestart() {
    console.log('🛡️ APEX Guardian MCP: Force restarting production service');
    
    const env = this.config.production;

    try {
      // Kill any existing processes
      console.log('   • Killing existing processes...');
      await this.executeWithTimeout('ssh', [
        'prox', `pct exec ${env.container} -- bash -c 'pkill -f "next" || true'`
      ]);

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Start fresh
      console.log('   • Starting fresh service...');
      const startResult = await this.executeWithTimeout('ssh', [
        'prox', `pct exec ${env.container} -- bash -c 'cd /opt/ldc-construction-tools/frontend && nohup npm run dev > production.log 2>&1 & echo "Service started with PID: $!"'`
      ]);

      return {
        success: startResult.success,
        environment: 'production',
        container: env.container,
        ip: env.ip,
        message: 'Force restart completed',
        details: startResult.stdout || startResult.stderr
      };

    } catch (error) {
      return {
        success: false,
        environment: 'production',
        error: error.message,
        message: 'Force restart failed'
      };
    }
  }

  async healthCheck() {
    console.log('🛡️ APEX Guardian MCP: Comprehensive health check');
    
    const staging = await this.quickTest('staging');
    const production = await this.quickTest('production');
    const prodDiagnostics = await this.diagnoseProduction();

    return {
      success: true,
      timestamp: new Date().toISOString(),
      environments: {
        staging,
        production: {
          ...production,
          diagnostics: prodDiagnostics.diagnostics,
          recommendations: prodDiagnostics.recommendations
        }
      },
      message: 'Comprehensive health check completed'
    };
  }

  async quickTest(environment) {
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
}

// CLI interface
if (require.main === module) {
  const guardian = new APEXGuardianMCP();
  const [operation, ...args] = process.argv.slice(2);

  const operations = {
    'diagnose': () => guardian.diagnoseProduction(),
    'force-restart': () => guardian.forceRestart(),
    'health': () => guardian.healthCheck(),
    'test': (env) => guardian.quickTest(env || 'production')
  };

  if (!operation || !operations[operation]) {
    console.log('🛡️ APEX Guardian MCP - Available Operations:');
    Object.keys(operations).forEach(op => console.log(`   • ${op}`));
    console.log('\nUsage: node apex-guardian-mcp.js <operation> [args...]');
    process.exit(0);
  }

  operations[operation](...args)
    .then(result => {
      console.log('🎉 APEX Guardian MCP: Result:', JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ APEX Guardian MCP: Error:', error.message);
      process.exit(1);
    });
}

module.exports = APEXGuardianMCP;
