#!/usr/bin/env node

/**
 * WMACS Server Operations MCP - LDC Construction Tools
 * 
 * A Model Context Protocol server for automated server-side operations
 * within the WMACS framework for LDC Construction Tools, maintaining
 * strict guardrails and audit trails.
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

class LDCServerOperationsMCP {
  constructor() {
    this.server = new Server(
      {
        name: 'ldc-server-ops',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Guardrails configuration
    this.config = {
      allowedHosts: ['10.92.3.23', '10.92.3.25'], // Production and Staging
      allowedPaths: ['/opt/ldc-construction-tools'],
      maxOperationsPerHour: 10,
      operationLog: '/var/log/wmacs-ldc-mcp-ops.log',
      containers: {
        production: { id: '133', ip: '10.92.3.23', ports: [3001, 8000] },
        staging: { id: '135', ip: '10.92.3.25', ports: [3001, 8000] }
      }
    };

    this.operationCount = new Map();
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'restart_ldc_application',
          description: 'Safely restart the LDC Construction Tools application with optional cache clearing',
          inputSchema: {
            type: 'object',
            properties: {
              environment: {
                type: 'string',
                enum: ['staging', 'production'],
                description: 'Target environment'
              },
              reason: {
                type: 'string',
                description: 'Reason for restart (required for audit trail)'
              },
              clearCache: {
                type: 'boolean',
                default: false,
                description: 'Whether to clear application cache'
              },
              services: {
                type: 'array',
                items: { type: 'string', enum: ['frontend', 'backend', 'all'] },
                default: ['all'],
                description: 'Which services to restart'
              }
            },
            required: ['environment', 'reason']
          }
        },
        {
          name: 'update_ldc_symlink',
          description: 'Update current release symlink with validation',
          inputSchema: {
            type: 'object',
            properties: {
              environment: {
                type: 'string',
                enum: ['staging', 'production'],
                description: 'Target environment'
              },
              releaseHash: {
                type: 'string',
                pattern: '^[a-f0-9]{7,40}$',
                description: 'Git commit hash of the release'
              },
              reason: {
                type: 'string',
                description: 'Reason for deployment (required for audit trail)'
              }
            },
            required: ['environment', 'releaseHash', 'reason']
          }
        },
        {
          name: 'check_ldc_application_status',
          description: 'Health check and status monitoring for LDC Construction Tools',
          inputSchema: {
            type: 'object',
            properties: {
              environment: {
                type: 'string',
                enum: ['staging', 'production'],
                description: 'Target environment'
              },
              detailed: {
                type: 'boolean',
                default: false,
                description: 'Include detailed service information'
              }
            },
            required: ['environment']
          }
        },
        {
          name: 'get_ldc_operation_log',
          description: 'Audit trail of recent LDC operations',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                default: 10,
                minimum: 1,
                maximum: 50,
                description: 'Number of recent operations to return'
              },
              environment: {
                type: 'string',
                enum: ['staging', 'production', 'all'],
                default: 'all',
                description: 'Filter by environment'
              }
            }
          }
        },
        {
          name: 'deploy_ldc_phase',
          description: 'Deploy specific LDC module phase with validation',
          inputSchema: {
            type: 'object',
            properties: {
              environment: {
                type: 'string',
                enum: ['staging', 'production'],
                description: 'Target environment'
              },
              phase: {
                type: 'string',
                enum: ['phase1', 'phase2', 'phase3', 'phase4', 'phase5'],
                description: 'SDD module phase to deploy'
              },
              modules: {
                type: 'array',
                items: { type: 'string' },
                description: 'Specific modules to deploy (optional)'
              },
              reason: {
                type: 'string',
                description: 'Reason for deployment'
              }
            },
            required: ['environment', 'phase', 'reason']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // Rate limiting check
      if (!this.checkRateLimit()) {
        throw new Error('Rate limit exceeded: Maximum 10 operations per hour');
      }

      // Log operation attempt
      await this.logOperation(name, args, 'attempted');

      try {
        let result;
        switch (name) {
          case 'restart_ldc_application':
            result = await this.restartLDCApplication(args);
            break;
          case 'update_ldc_symlink':
            result = await this.updateLDCSymlink(args);
            break;
          case 'check_ldc_application_status':
            result = await this.checkLDCApplicationStatus(args);
            break;
          case 'get_ldc_operation_log':
            result = await this.getLDCOperationLog(args);
            break;
          case 'deploy_ldc_phase':
            result = await this.deployLDCPhase(args);
            break;
          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        // Log successful operation
        await this.logOperation(name, args, 'completed', result);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        // Log failed operation
        await this.logOperation(name, args, 'failed', { error: error.message });
        throw error;
      }
    });
  }

  checkRateLimit() {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    
    // Clean old entries
    for (const [timestamp] of this.operationCount) {
      if (timestamp < hourAgo) {
        this.operationCount.delete(timestamp);
      }
    }
    
    // Check current count
    return this.operationCount.size < this.config.maxOperationsPerHour;
  }

  async logOperation(operation, args, status, result = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      operation,
      args,
      status,
      result: result ? JSON.stringify(result) : null
    };

    try {
      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.appendFile(this.config.operationLog, logLine);
    } catch (error) {
      console.error('Failed to write operation log:', error);
    }

    // Track for rate limiting
    if (status === 'attempted') {
      this.operationCount.set(Date.now(), operation);
    }
  }

  async restartLDCApplication(args) {
    const { environment, reason, clearCache = false, services = ['all'] } = args;
    
    if (!this.config.allowedHosts.includes(this.config.containers[environment].ip)) {
      throw new Error(`Unauthorized host for environment: ${environment}`);
    }

    const container = this.config.containers[environment];
    const servicesToRestart = services.includes('all') ? ['frontend', 'backend'] : services;

    const results = {
      environment,
      reason,
      clearCache,
      services: servicesToRestart,
      operations: []
    };

    try {
      // Stop services gracefully
      for (const service of servicesToRestart) {
        const stopCmd = `ssh root@${container.ip} "systemctl stop ldc-${service} || pkill -f 'ldc.*${service}' || true"`;
        await execAsync(stopCmd);
        results.operations.push(`Stopped ${service} service`);
      }

      // Clear cache if requested
      if (clearCache) {
        const clearCacheCmd = `ssh root@${container.ip} "cd /opt/ldc-construction-tools/current && rm -rf frontend/.next/cache backend/__pycache__ || true"`;
        await execAsync(clearCacheCmd);
        results.operations.push('Cleared application cache');
      }

      // Start services
      for (const service of servicesToRestart) {
        if (service === 'frontend') {
          const startCmd = `ssh root@${container.ip} "cd /opt/ldc-construction-tools/current/frontend && NODE_ENV=production PORT=3001 npm start > /var/log/ldc-frontend.log 2>&1 &"`;
          await execAsync(startCmd);
        } else if (service === 'backend') {
          const startCmd = `ssh root@${container.ip} "cd /opt/ldc-construction-tools/current/backend && source venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 > /var/log/ldc-backend.log 2>&1 &"`;
          await execAsync(startCmd);
        }
        results.operations.push(`Started ${service} service`);
      }

      // Health check
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      for (const service of servicesToRestart) {
        const port = service === 'frontend' ? 3001 : 8000;
        const endpoint = service === 'frontend' ? '/' : '/api/v1/health';
        
        try {
          const healthCheck = await execAsync(`curl -s -o /dev/null -w "%{http_code}" http://${container.ip}:${port}${endpoint}`);
          const statusCode = healthCheck.stdout.trim();
          
          if (['200', '302'].includes(statusCode)) {
            results.operations.push(`${service} health check passed (${statusCode})`);
          } else {
            results.operations.push(`${service} health check warning (${statusCode})`);
          }
        } catch (error) {
          results.operations.push(`${service} health check failed: ${error.message}`);
        }
      }

      results.status = 'success';
      return results;

    } catch (error) {
      results.status = 'failed';
      results.error = error.message;
      throw new Error(`LDC application restart failed: ${error.message}`);
    }
  }

  async updateLDCSymlink(args) {
    const { environment, releaseHash, reason } = args;
    
    const container = this.config.containers[environment];
    
    if (!this.config.allowedHosts.includes(container.ip)) {
      throw new Error(`Unauthorized host for environment: ${environment}`);
    }

    try {
      // Validate release exists
      const validateCmd = `ssh root@${container.ip} "test -d /opt/ldc-construction-tools/releases/${releaseHash}"`;
      await execAsync(validateCmd);

      // Update symlink atomically
      const symlinkCmd = `ssh root@${container.ip} "ln -sfn /opt/ldc-construction-tools/releases/${releaseHash} /opt/ldc-construction-tools/current-new && mv /opt/ldc-construction-tools/current-new /opt/ldc-construction-tools/current"`;
      await execAsync(symlinkCmd);

      // Verify symlink
      const verifyCmd = `ssh root@${container.ip} "readlink /opt/ldc-construction-tools/current"`;
      const { stdout } = await execAsync(verifyCmd);
      
      const currentRelease = path.basename(stdout.trim());
      
      if (currentRelease === releaseHash) {
        return {
          status: 'success',
          environment,
          releaseHash,
          reason,
          currentRelease,
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error(`Symlink verification failed: expected ${releaseHash}, got ${currentRelease}`);
      }

    } catch (error) {
      throw new Error(`LDC symlink update failed: ${error.message}`);
    }
  }

  async checkLDCApplicationStatus(args) {
    const { environment, detailed = false } = args;
    
    const container = this.config.containers[environment];
    
    const status = {
      environment,
      timestamp: new Date().toISOString(),
      services: {},
      overall: 'unknown'
    };

    try {
      // Check current release
      const releaseCmd = `ssh root@${container.ip} "readlink /opt/ldc-construction-tools/current 2>/dev/null | xargs basename || echo 'none'"`;
      const { stdout: releaseOutput } = await execAsync(releaseCmd);
      status.currentRelease = releaseOutput.trim();

      // Check services
      const services = ['frontend', 'backend'];
      let healthyServices = 0;

      for (const service of services) {
        const port = service === 'frontend' ? 3001 : 8000;
        const endpoint = service === 'frontend' ? '/' : '/api/v1/health';
        
        try {
          const healthCheck = await execAsync(`curl -s -o /dev/null -w "%{http_code}" http://${container.ip}:${port}${endpoint}`, { timeout: 5000 });
          const statusCode = healthCheck.stdout.trim();
          
          status.services[service] = {
            port,
            status: ['200', '302'].includes(statusCode) ? 'healthy' : 'unhealthy',
            statusCode,
            endpoint: `http://${container.ip}:${port}${endpoint}`
          };
          
          if (['200', '302'].includes(statusCode)) {
            healthyServices++;
          }
        } catch (error) {
          status.services[service] = {
            port,
            status: 'down',
            error: error.message,
            endpoint: `http://${container.ip}:${port}${endpoint}`
          };
        }

        // Detailed information
        if (detailed) {
          try {
            const processCheck = `ssh root@${container.ip} "pgrep -f 'ldc.*${service}' | wc -l"`;
            const { stdout: processCount } = await execAsync(processCheck);
            status.services[service].processes = parseInt(processCount.trim());
          } catch (error) {
            status.services[service].processes = 0;
          }
        }
      }

      // Overall status
      if (healthyServices === services.length) {
        status.overall = 'healthy';
      } else if (healthyServices > 0) {
        status.overall = 'degraded';
      } else {
        status.overall = 'down';
      }

      return status;

    } catch (error) {
      status.overall = 'error';
      status.error = error.message;
      return status;
    }
  }

  async getLDCOperationLog(args) {
    const { limit = 10, environment = 'all' } = args;
    
    try {
      const logContent = await fs.readFile(this.config.operationLog, 'utf8');
      const lines = logContent.trim().split('\n').filter(line => line.length > 0);
      
      let operations = lines
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(op => op !== null)
        .reverse(); // Most recent first

      // Filter by environment if specified
      if (environment !== 'all') {
        operations = operations.filter(op => 
          op.args && op.args.environment === environment
        );
      }

      // Limit results
      operations = operations.slice(0, limit);

      return {
        operations,
        total: operations.length,
        environment,
        limit
      };

    } catch (error) {
      if (error.code === 'ENOENT') {
        return {
          operations: [],
          total: 0,
          environment,
          limit,
          message: 'No operation log found'
        };
      }
      throw new Error(`Failed to read operation log: ${error.message}`);
    }
  }

  async deployLDCPhase(args) {
    const { environment, phase, modules = [], reason } = args;
    
    const container = this.config.containers[environment];
    
    if (!this.config.allowedHosts.includes(container.ip)) {
      throw new Error(`Unauthorized host for environment: ${environment}`);
    }

    try {
      // Execute deployment script
      const deployCmd = `ssh root@${container.ip} "cd /opt/ldc-construction-tools/current && ./scripts/deploy-phase.sh ${phase} ${modules.join(',') || 'all'}"`;
      const { stdout, stderr } = await execAsync(deployCmd);

      return {
        status: 'success',
        environment,
        phase,
        modules: modules.length > 0 ? modules : ['all'],
        reason,
        output: stdout,
        errors: stderr || null,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      throw new Error(`LDC phase deployment failed: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('LDC Server Operations MCP server running on stdio');
  }
}

// Run the server
if (require.main === module) {
  const server = new LDCServerOperationsMCP();
  server.run().catch(console.error);
}

module.exports = LDCServerOperationsMCP;
