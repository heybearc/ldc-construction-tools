// WMACS Guardian Configuration Template
// Copy this file to your project root as 'wmacs-config.js' and customize

module.exports = {
  // Project identification
  projectName: 'ldc-construction-tools',
  projectType: 'nextjs', // Helps with recovery strategies
  
  // Environment configuration
  environments: {
    staging: {
      container: '135',
      ip: '10.92.3.25',
      sshHost: 'ldc-construction-tools',
      sshKey: '~/.ssh/ldc_construction_key',
      sshConfig: '/Users/cory/Documents/Cloudy-Work/ssh_config_jw_attendant',
      ports: {
        frontend: 3001,
        backend: 8000,
        database: 5432
      }
    },
    production: {
      container: '133', 
      ip: '10.92.3.23',
      sshHost: 'ldc-construction-tools-prod',
      sshKey: '~/.ssh/ldc_construction_key',
      ports: {
        frontend: 3001,
        backend: 8000,
        database: 5432
      }
    }
  },
  
  // Container management
  containers: ['133', '135'], // Production, Staging
  proxmoxHost: '10.92.0.5',
  sshConfig: '/Users/cory/Documents/Cloudy-Work/ssh_config_jw_attendant',
  
  // Process management
  processes: {
    frontend: {
      name: 'npm start|next start',
      healthCheck: 'curl -f http://localhost:3001/',
      logFile: '/var/log/ldc-frontend.log'
    },
    backend: {
      name: 'uvicorn main:app',
      healthCheck: 'curl -f http://localhost:8000/health',
      logFile: '/var/log/ldc-backend.log'
    }
  },
  
  // Recovery strategies
  recovery: {
    maxRetries: 3,
    timeoutMs: 30000,
    forceRecoveryAfter: 120000, // 2 minutes
    
    // Custom recovery functions
    customStrategies: {
      // LDC Construction Tools specific recovery
      containerRestart: async function(container) {
        const sshCmd = `ssh -F ${this.sshConfig} proxmox "pct restart ${container}"`;
        return await this.executeCommand(sshCmd);
      },
      
      // Service restart on container
      serviceRestart: async function(environment) {
        const env = this.environments[environment];
        const sshCmd = `ssh -F ${this.sshConfig} ${env.sshHost} "systemctl restart ldc-backend ldc-frontend"`;
        return await this.executeCommand(sshCmd);
      },
      
      // Database connection recovery
      databaseRecovery: async function(container) {
        const sshCmd = `ssh -F ${this.sshConfig} jw-postgres "systemctl restart postgresql"`;
        return await this.executeCommand(sshCmd);
      },
      
      // Next.js build cache clearing
      cacheRecovery: async function(environment) {
        const env = this.environments[environment];
        const sshCmd = `ssh -F ${this.sshConfig} ${env.sshHost} "cd /opt/ldc-construction-tools && rm -rf .next && npm run build"`;
        return await this.executeCommand(sshCmd);
      }
    }
  },
  
  // Research Advisor configuration
  researchAdvisor: {
    knowledgeBasePath: '.wmacs/knowledge-base.json',
    autoAnalysis: true,
    pushbackThreshold: 'medium', // low|medium|high
    
    // Project-specific patterns
    positivePatterns: [
      'proper ci/cd implementation',
      'battle-tested deployment',
      'staging first development'
    ],
    
    riskPatterns: [
      'bypass staging',
      'manual production deployment',
      'skip testing'
    ]
  },
  
  // Monitoring configuration
  monitoring: {
    healthCheckInterval: 5000,
    alertThresholds: {
      responseTime: 5000,
      errorRate: 0.05,
      memoryUsage: 0.85
    }
  },
  
  // Project-specific compliance requirements
  compliance: {
    // LDC Construction Tools specific compliance
    standards: ['USLDC-2829-E', 'USLDC-2275-E'],
    requiredTests: ['role-management', 'trade-teams', 'volunteer-management'],
    documentationRequirements: ['Personnel Contact responsibilities', 'Trade Crew Overseer assignments']
  },
  
  // CI/CD Integration
  cicd: {
    githubActions: true,
    artifactDeployment: true,
    stagingBranch: 'staging',
    productionBranch: 'main',
    deploymentTimeout: 300000, // 5 minutes
    healthCheckRetries: 3,
    rollbackOnFailure: true
  }
};
