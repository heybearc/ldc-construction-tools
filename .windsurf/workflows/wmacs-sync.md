---
description: WMACS Smart Synchronization - Intelligent sync with config preservation
---

# WMACS Guardian System Synchronization

This workflow provides intelligent synchronization between the shared WMACS system and repository-specific configurations, ensuring structural updates while preserving local settings.

## Prerequisites

1. Ensure you have access to the shared WMACS system:
   ```bash
   ls ~/Documents/Cloudy-Work/shared/wmacs-guardian-system/
   ```

2. Verify WMACS smart sync system is available:
   ```bash
   ls wmacs/wmacs-smart-sync.js
   ```

## Smart Synchronization Steps

### 1. Check for Updates in Shared System

```bash
cd ~/Documents/Cloudy-Work/shared/wmacs-guardian-system
git status
git pull origin main
```

### 2. Run Intelligent Sync (Preserves Local Config)

// turbo
```bash
# Smart sync automatically preserves repository-specific configurations
node wmacs/wmacs-smart-sync.js
```

This intelligent sync will:
- ✅ Backup all protected configuration files
- ✅ Sync shared components to `wmacs/core/`
- ✅ Generate intelligent wrapper with project settings
- ✅ Restore protected files (auth, environments, SSH configs)
- ✅ Validate configuration integrity

### 3. Validate System Functionality

// turbo
```bash
# Test WMACS Guardian with preserved project configuration
node wmacs/wmacs-guardian.js test 135
```

### 4. Run Integration Tests

// turbo
```bash
# Comprehensive validation of CI/CD integration
node wmacs/ci-cd-integration-test.js
```

### 5. Validate MCP Server Integration

// turbo
```bash
# Test MCP server functionality (credit-aware operations)
node mcp-server-ops-ldc/src/index.js &
MCP_PID=$!
sleep 2
# Test MCP tools via WMACS Guardian
node wmacs/wmacs-guardian.js test 135
kill $MCP_PID 2>/dev/null || true
```

### 7. Commit Changes

```bash
git add wmacs/ wmacs-config.js .windsurf/
git commit -m "sync: Update WMACS Guardian system from shared repository

🛡️ WMACS SYNCHRONIZATION:
- Synced latest shared WMACS components
- Maintained project-specific configuration
- Validated system functionality
- MCP server integration tested and validated

WMACS Guardian: Bidirectional sync completed with MCP integration"
```

### 5. Deploy to Staging

```bash
# Follow WMACS deployment rules
git push origin staging
```

### 6. Update Shared System Repository (Bidirectional Sync)

// turbo
```bash
# Copy enhancements back to shared system
cp wmacs/wmacs-smart-sync.js ~/Documents/Cloudy-Work/shared/wmacs-guardian-system/
cp wmacs/ci-cd-integration-test.js ~/Documents/Cloudy-Work/shared/wmacs-guardian-system/
cp wmacs/core/mcp-server-core/* ~/Documents/Cloudy-Work/shared/wmacs-guardian-system/mcp-server-core/ 2>/dev/null || true
```

```bash
cd ~/Documents/Cloudy-Work/shared/wmacs-guardian-system
git add .
git commit -m "sync: Update from ldc-construction-tools project

🛡️ WMACS BIDIRECTIONAL SYNC:
- Added smart sync system for config preservation
- Enhanced CI/CD integration testing
- Improved modular architecture support

WMACS Guardian: Shared system updated with project improvements"
git push origin main
```

## Validation Checklist

- [ ] Shared system files copied successfully
- [ ] Project-specific configuration preserved
- [ ] WMACS system passes diagnostic tests
- [ ] Changes committed to feature branch
- [ ] Updates deployed to staging
- [ ] Shared system updated with improvements

## Troubleshooting

### Sync Conflicts
If sync fails due to conflicts:
```bash
# Check what's different
diff -r ~/Documents/Cloudy-Work/shared/wmacs-guardian-system/wmacs-guardian.js wmacs/wmacs-guardian.js

# Force regeneration
rm wmacs/wmacs-guardian.js
node wmacs/wmacs-smart-sync.js
```

### Configuration Issues
If configuration validation fails:
```bash
# Check required files exist
ls wmacs/config/
cat wmacs/config/project.json
cat wmacs/config/environments.json
```

### Testing Issues
If WMACS tests fail:
```bash
# Validate configuration
node -e "console.log(JSON.stringify(require('./wmacs/config/project.json'), null, 2))"

# Test manually
curl -X POST -F "email=admin@ldc-construction.local" -F "password=AdminPass123!" http://10.92.3.25:3001/api/auth/signin
```

## Automation Notes

This workflow can be automated using:
- Git hooks for automatic synchronization
- Cron jobs for scheduled updates
- CI/CD pipeline integration for deployment
