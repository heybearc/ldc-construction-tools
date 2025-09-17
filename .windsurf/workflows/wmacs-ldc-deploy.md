---
description: WMACS deployment workflow for LDC Construction Tools
---

# WMACS LDC Deployment Workflow

This workflow provides WMACS-compliant deployment procedures for LDC Construction Tools, ensuring immutable artifacts, Guardian protection, and <30 second rollback capability.

## 🎯 WMACS Deployment Principles

1. **GitHub Actions CI/CD Pipeline** - All deployments via `.github/workflows/wmacs-ci-cd.yml`
2. **Immutable Artifacts** - SHA-based releases with locked dependencies
3. **Guardian Protection** - Automatic deadlock detection and recovery
4. **Atomic Deployments** - Symlink switching for zero-downtime
5. **Credit Budget Awareness** - Token-efficient deployment process

## 🏗️ Infrastructure Overview

### Staging Environment (Container 135)
- **Host:** 10.92.3.25
- **Frontend:** Port 3001
- **Backend:** Port 8000
- **Purpose:** Development and testing validation

### Production Environment (Container 133)
- **Host:** 10.92.3.23
- **Frontend:** Port 3001
- **Backend:** Port 8000
- **Purpose:** Live LDC Construction Tools application

### Database (Container 131)
- **Host:** 10.92.3.21:5432 (PostgreSQL)
- **Staging DB:** `ldc_construction_tools_staging`
- **Production DB:** `ldc_construction_tools`

## 🚀 Deployment Procedures

### 1. Automated Deployment (Recommended)

#### Deploy to Staging
```bash
# Commit changes to staging branch
git checkout staging
git add .
git commit -m "feat: implement assignment-workflow module"
git push origin staging
```

#### Deploy to Production
```bash
# Merge staging to main for production deployment
git checkout main
git merge staging
git push origin main
```

### 2. Manual Deployment (Emergency Use)

#### Deploy Specific Release to Staging
```bash
# Using WMACS deployment script
./scripts/wmacs-deploy-ldc.sh staging abc123f "Emergency hotfix deployment"

# Using Guardian-protected deployment
node wmacs-guardian-ldc.js start staging
```

#### Deploy Specific Release to Production
```bash
# Using WMACS deployment script
./scripts/wmacs-deploy-ldc.sh production abc123f "Scheduled production deployment"

# Using Guardian-protected deployment
node wmacs-guardian-ldc.js start production
```

### 3. SDD Module Phase Deployment

#### Deploy Phase 2 Modules (Assignment Workflow + Calendar Scheduling)
```bash
# Via MCP server operations
echo '{"environment": "staging", "phase": "phase2", "reason": "Deploy Phase 2 modules"}' | \
npx mcp-server-ops-ldc deploy_ldc_phase

# Via deployment script
./scripts/deploy-phase.sh phase2 assignment-workflow,calendar-scheduling
```

#### Deploy Specific Module
```bash
# Deploy single module to staging
./scripts/deploy-phase.sh phase2 assignment-workflow

# Deploy multiple modules to production
./scripts/deploy-phase.sh phase3 communication-hub,project-coordination
```

## 🛡️ Guardian-Protected Operations

### Start Application with Guardian Protection
```bash
# Start both frontend and backend with automatic recovery
node wmacs-guardian-ldc.js start staging

# Start specific service only
node wmacs-guardian-ldc.js start production frontend
```

### Health Check with Guardian Monitoring
```bash
# Comprehensive health check with automatic remediation
node wmacs-guardian-ldc.js health staging

# Detailed health check for production
node wmacs-guardian-ldc.js health production --detailed
```

### Force Recovery (Emergency)
```bash
# Automatic deadlock detection and recovery
node wmacs-guardian-ldc.js recover staging

# Nuclear option - full container restart
node wmacs-guardian-ldc.js recover production force
```

## 📋 MCP Server Operations

### Application Restart
```bash
# Restart with cache clearing
echo '{
  "environment": "staging",
  "reason": "Deploy new authentication module",
  "clearCache": true,
  "services": ["frontend", "backend"]
}' | npx mcp-server-ops-ldc restart_ldc_application
```

### Symlink Update
```bash
# Update to specific release
echo '{
  "environment": "production",
  "releaseHash": "abc123f",
  "reason": "Deploy Phase 2 assignment workflow"
}' | npx mcp-server-ops-ldc update_ldc_symlink
```

### Status Monitoring
```bash
# Basic status check
echo '{
  "environment": "production"
}' | npx mcp-server-ops-ldc check_ldc_application_status

# Detailed status with process information
echo '{
  "environment": "staging",
  "detailed": true
}' | npx mcp-server-ops-ldc check_ldc_application_status
```

## 🔧 Deployment Verification

### Health Check Commands
```bash
# Frontend health check
curl -f http://10.92.3.25:3001/ # Staging
curl -f http://10.92.3.23:3001/ # Production

# Backend health check
curl -f http://10.92.3.25:8000/api/v1/health # Staging
curl -f http://10.92.3.23:8000/api/v1/health # Production

# Database connectivity check
curl -f http://10.92.3.25:8000/api/v1/trade-teams # Staging API test
curl -f http://10.92.3.23:8000/api/v1/volunteers # Production API test
```

### Service Status Verification
```bash
# Check running processes
ssh root@10.92.3.25 "ps aux | grep -E '(ldc|next|uvicorn)'"

# Check service logs
ssh root@10.92.3.25 "tail -f /var/log/ldc-frontend.log"
ssh root@10.92.3.25 "tail -f /var/log/ldc-backend.log"

# Check current release
ssh root@10.92.3.25 "readlink /opt/ldc-construction-tools/current"
```

## 📊 WMACS Credit Budget Monitoring

### Track Deployment Costs
```bash
# View current credit usage
cat .wmacs/credit-budget.json | jq '.wmacs_credit_budget.current_session_cost'

# Monitor deployment history
cat .wmacs/credit-budget.json | jq '.wmacs_credit_budget.project_specific.ldc_construction_tools'

# Estimate deployment cost
echo "Estimated cost: Build(3.0) + Deploy(2.0) + Test(1.0) = 6.0 credits"
```

### Optimize Credit Usage
```bash
# Use diff-scoped analysis for targeted deployments
git diff main --name-only | grep -E '\.(py|tsx?|js)$'

# Deploy only changed modules
./scripts/deploy-phase.sh phase2 $(git diff main --name-only | grep 'lib/' | cut -d'/' -f2 | sort -u | tr '\n' ',')
```

## ⚠️ WMACS Compliance Rules

### ❌ NEVER DO:
1. **Direct server modifications** - All changes via WMACS pipeline
2. **Manual file edits on containers** - Use immutable artifacts only
3. **Bypass GitHub Actions** - All deployments must use WMACS CI/CD
4. **Ignore Guardian warnings** - Address deadlock detection immediately
5. **Skip health checks** - Always verify deployment success

### ✅ ALWAYS DO:
1. **Use Guardian protection** - Wrap all operations with Guardian
2. **Monitor credit budget** - Stay within 6.5 credits per cycle
3. **Verify deployments** - Run health checks after every deployment
4. **Use MCP operations** - Leverage automated server operations
5. **Follow SDD principles** - Maintain modular architecture

## 🔄 Integration with Existing Workflows

This workflow integrates with:
- `/staging-first-development` - Enhanced with LDC-specific procedures
- `/wmacs-guardian` - Universal Guardian with LDC extensions
- `/deploy` - General deployment enhanced for LDC Construction Tools

## 📈 Success Metrics

- **Deployment Success Rate:** >95%
- **Rollback Time:** <30 seconds
- **Guardian Recovery Rate:** >90%
- **Credit Budget Adherence:** Within 10% of 6.5 credits/cycle
- **Health Check Pass Rate:** >99%

This workflow ensures reliable, efficient deployment of LDC Construction Tools while maintaining WMACS principles and supporting the complex organizational structure of 8 trade teams with 42 specialized crews.
