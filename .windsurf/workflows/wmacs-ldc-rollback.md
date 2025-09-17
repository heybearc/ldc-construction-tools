---
description: WMACS rollback workflow for LDC Construction Tools - <30 second recovery
---

# WMACS LDC Rollback Workflow

This workflow provides ultra-fast rollback capabilities for LDC Construction Tools, ensuring <30 second recovery time with Guardian protection and MCP automation.

## 🎯 WMACS Rollback Principles

1. **<30 Second Recovery** - Atomic symlink switching for instant rollback
2. **Guardian Protection** - Automatic deadlock detection during rollback
3. **MCP Automation** - Automated rollback via server operations
4. **Immutable Releases** - Roll back to any previous SHA-based release
5. **Zero Data Loss** - Database-safe rollback procedures

## 🚨 Emergency Rollback Procedures

### 1. Instant Rollback (Production)

#### Ultra-Fast Rollback to Previous Release
```bash
# Immediate rollback via MCP (fastest method)
echo '{
  "environment": "production",
  "reason": "Critical production issue - immediate rollback"
}' | npx mcp-server-ops-ldc rollback_ldc_application

# Guardian-protected rollback
node wmacs-guardian-ldc.js rollback production quick
```

#### Rollback to Specific Release
```bash
# Rollback to known good release hash
echo '{
  "environment": "production", 
  "releaseHash": "a2e6079",
  "reason": "Rollback to last stable release before deployment issue"
}' | npx mcp-server-ops-ldc update_ldc_symlink

# Restart services after rollback
echo '{
  "environment": "production",
  "reason": "Restart after rollback to a2e6079",
  "clearCache": true
}' | npx mcp-server-ops-ldc restart_ldc_application
```

### 2. Staged Rollback (Staging First)

#### Test Rollback on Staging
```bash
# Rollback staging to test procedure
node wmacs-guardian-ldc.js rollback staging abc123f

# Verify rollback success
node wmacs-guardian-ldc.js health staging

# Apply same rollback to production
node wmacs-guardian-ldc.js rollback production abc123f
```

### 3. Selective Service Rollback

#### Rollback Frontend Only
```bash
# Rollback frontend service while keeping backend
ssh root@10.92.3.23 "cd /opt/ldc-construction-tools && \\
  ln -sfn releases/a2e6079/frontend current/frontend && \\
  systemctl restart ldc-frontend"
```

#### Rollback Backend Only
```bash
# Rollback backend service while keeping frontend
ssh root@10.92.3.23 "cd /opt/ldc-construction-tools && \\
  ln -sfn releases/a2e6079/backend current/backend && \\
  systemctl restart ldc-backend"
```

## 🔧 Rollback Verification

### Health Check After Rollback
```bash
# Comprehensive health check
node wmacs-guardian-ldc.js health production

# Manual verification
curl -f http://10.92.3.23:3001/ # Frontend
curl -f http://10.92.3.23:8000/api/v1/health # Backend
curl -f http://10.92.3.23:8000/api/v1/trade-teams # API functionality
```

### Verify Current Release
```bash
# Check current release hash
ssh root@10.92.3.23 "readlink /opt/ldc-construction-tools/current | xargs basename"

# Verify release metadata
ssh root@10.92.3.23 "cat /opt/ldc-construction-tools/current/deployment-metadata.json"
```

### Database Consistency Check
```bash
# Verify database connectivity and basic operations
curl -f http://10.92.3.23:8000/api/v1/volunteers?limit=1
curl -f http://10.92.3.23:8000/api/v1/trade-teams?limit=1

# Check for any database migration issues
ssh root@10.92.3.23 "cd /opt/ldc-construction-tools/current/backend && \\
  source venv/bin/activate && \\
  python -c 'from app.database import engine; print(\"DB OK\")'"
```

## 📋 Available Rollback Targets

### List Available Releases
```bash
# Show all available releases
ssh root@10.92.3.23 "ls -la /opt/ldc-construction-tools/releases/"

# Show releases with metadata
ssh root@10.92.3.23 "for dir in /opt/ldc-construction-tools/releases/*/; do \\
  echo \"Release: \$(basename \$dir)\"; \\
  cat \$dir/deployment-metadata.json 2>/dev/null | jq -r '.build_time, .branch' || echo 'No metadata'; \\
  echo '---'; \\
done"
```

### Known Good Releases
```bash
# Phase 1 Stable Release
PHASE1_RELEASE="a2e6079"  # Complete SDD Phase 1 implementation

# Last Working Production
LAST_PROD_RELEASE=$(ssh root@10.92.3.23 "ls -t /opt/ldc-construction-tools/releases/ | head -2 | tail -1")

# Emergency Fallback (minimal functionality)
EMERGENCY_RELEASE="184a7d8"  # Basic functionality confirmed
```

## 🛡️ Guardian-Protected Rollback

### Automatic Deadlock Recovery During Rollback
```bash
# Guardian will automatically handle:
# - Port conflicts during service restart
# - SSH timeouts during rollback operations
# - Database connection issues
# - Service startup failures

# Force recovery if rollback gets stuck
node wmacs-guardian-ldc.js recover production force
```

### Rollback with Guardian Monitoring
```bash
# Guardian monitors entire rollback process
node wmacs-guardian-ldc.js executeWithGuardian rollback production abc123f

# Guardian provides automatic retry on failure
# Guardian escalates to force recovery if needed
# Guardian verifies rollback success automatically
```

## 📊 Rollback Success Metrics

### Performance Targets
- **Rollback Time:** <30 seconds (symlink switch)
- **Service Restart:** <15 seconds
- **Health Check:** <10 seconds
- **Total Recovery:** <60 seconds end-to-end

### Verification Checklist
- [ ] Symlink updated to target release
- [ ] Frontend responding (HTTP 200/302)
- [ ] Backend API responding (HTTP 200)
- [ ] Database connectivity confirmed
- [ ] Critical API endpoints functional
- [ ] No error logs in service logs

## 🚨 Emergency Procedures

### Nuclear Option - Full Container Restart
```bash
# If rollback fails completely, restart entire container
ssh root@10.92.0.5 "pct stop 133 && sleep 5 && pct start 133"

# Wait for container to be ready
node wmacs-guardian-ldc.js waitForContainerReady production

# Verify services after container restart
node wmacs-guardian-ldc.js health production
```

### Database Rollback (Use with Extreme Caution)
```bash
# Only if database schema changes are incompatible
# This should be avoided - design migrations to be backward compatible

# Restore database from backup (coordinate with DBA)
# ssh root@10.92.3.21 "pg_restore -d ldc_construction_tools /backups/pre-deployment.sql"
```

### Communication During Rollback
```bash
# Log rollback operation
echo "$(date): ROLLBACK INITIATED - Production LDC Tools to release abc123f" >> /var/log/ldc-rollback.log

# Notify team (implement notification system)
# curl -X POST webhook-url -d "LDC Production rolled back to abc123f due to: $REASON"
```

## 🔄 Post-Rollback Actions

### Investigation and Analysis
1. **Capture logs** from failed deployment
2. **Document root cause** of rollback necessity
3. **Update deployment procedures** to prevent recurrence
4. **Test fix** on staging before re-deployment

### Re-deployment Preparation
```bash
# After fixing issues, prepare for re-deployment
git checkout staging
# Apply fixes
git add . && git commit -m "fix: resolve deployment issue that caused rollback"
git push origin staging

# Test on staging thoroughly
node wmacs-guardian-ldc.js health staging

# When ready, deploy to production
git checkout main && git merge staging && git push origin main
```

## ⚠️ Rollback Best Practices

### ✅ DO:
1. **Test rollback procedure** on staging first when possible
2. **Document rollback reason** for audit trail
3. **Verify health checks** after rollback
4. **Communicate rollback** to stakeholders
5. **Investigate root cause** before re-deployment

### ❌ DON'T:
1. **Skip health verification** after rollback
2. **Roll back database** without DBA consultation
3. **Rush re-deployment** without proper testing
4. **Ignore Guardian warnings** during rollback
5. **Rollback without documenting reason**

## 📈 Integration with WMACS

This rollback workflow integrates with:
- **WMACS CI/CD Pipeline** - Automated rollback triggers
- **Guardian System** - Protected rollback operations
- **MCP Server Operations** - Automated rollback procedures
- **Credit Budget System** - Rollback operations cost 0.5 credits

## 🎯 Success Criteria

- **Recovery Time:** <30 seconds for symlink rollback
- **Success Rate:** >99% automated rollback success
- **Guardian Protection:** >95% automatic issue resolution
- **Zero Data Loss:** 100% database consistency maintained

This workflow ensures LDC Construction Tools can recover quickly from any deployment issues while maintaining the complex organizational structure support for 8 trade teams and 42 specialized crews.
