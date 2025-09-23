---
description: WMACS Smart Synchronization - Intelligent sync with config preservation
---

# WMACS Smart Synchronization Workflow

This workflow provides intelligent synchronization between the shared WMACS system and repository-specific configurations, ensuring structural updates while preserving local settings.

## Architecture Overview

The new modular WMACS architecture separates concerns:

```
wmacs/
├── core/                    # Shared components (always synced)
├── config/                  # Repository-specific (protected)
├── local/                   # Local customizations (protected)
└── wmacs-guardian.js        # Intelligent wrapper (auto-generated)
```

## Quick Sync

For routine synchronization:

```bash
node wmacs/wmacs-smart-sync.js
```

## Manual Sync Steps

### 1. Check Shared System Status

```bash
cd ~/Documents/Cloudy-Work/shared/wmacs-guardian-system
git status
git pull origin main
```

### 2. Run Smart Sync

// turbo
```bash
node wmacs/wmacs-smart-sync.js
```

This will:
- ✅ Validate shared system exists
- ✅ Create modular structure if needed
- ✅ Backup protected configuration files
- ✅ Sync shared components to `wmacs/core/`
- ✅ Generate intelligent wrapper for `wmacs-guardian.js`
- ✅ Restore protected files
- ✅ Validate configuration integrity

### 3. Test WMACS System

// turbo
```bash
node wmacs/wmacs-guardian.js test 135
```

### 4. Commit Changes

```bash
git add wmacs/
git commit -m "sync: Smart WMACS synchronization with config preservation

🛡️ WMACS SMART SYNC:
- Updated shared components in wmacs/core/
- Preserved repository-specific configurations
- Generated intelligent wrapper with project settings
- Validated system functionality

WMACS Guardian: Smart sync completed successfully"
```

## Configuration Files (Protected)

These files are **NEVER** overwritten during sync:

### `wmacs/config/project.json`
```json
{
  "projectName": "ldc-construction-tools",
  "authentication": {
    "endpoints": { "signin": "/api/auth/signin" },
    "credentials": { "testUser": "admin@ldc-construction.local" }
  },
  "features": {
    "roleManagement": true,
    "personnelTracking": true
  }
}
```

### `wmacs/config/environments.json`
```json
{
  "staging": {
    "container": "135",
    "ip": "10.92.3.25",
    "sshHost": "prox"
  },
  "production": {
    "container": "133", 
    "ip": "10.92.3.22"
  }
}
```

## Shared Components (Always Synced)

These components are automatically updated from the shared system:

- `wmacs/core/WINDSURF_OPERATIONAL_GUIDELINES.md`
- `wmacs/core/ENFORCEMENT_MECHANISMS.md`
- `wmacs/core/wmacs-research-advisor.js`
- `wmacs/core/wmacs-auto-advisor.js`
- `wmacs/core/cascade-rules.json`
- `wmacs/core/health-check.sh`

## Intelligent Wrapper

The `wmacs-guardian.js` file is auto-generated and:

1. **Loads Configuration Hierarchy**:
   - Core defaults (from shared system)
   - Project configuration (`config/project.json`)
   - Environment settings (`config/environments.json`)
   - Local overrides (`config/overrides.json`)

2. **Provides Unified Interface**:
   - `node wmacs/wmacs-guardian.js test [container]`
   - `node wmacs/wmacs-guardian.js start [container]`

3. **Maintains Compatibility**:
   - Works with existing CI/CD pipelines
   - Preserves project-specific authentication
   - Supports environment-specific configurations

## Benefits

### ✅ **Structural Updates**
- Get latest WMACS enhancements automatically
- Receive new enforcement mechanisms
- Access updated operational procedures

### ✅ **Configuration Preservation**
- Repository-specific settings never overwritten
- Environment configurations maintained
- Local customizations preserved

### ✅ **Intelligent Merging**
- Configuration hierarchy respected
- Project-specific overrides supported
- Validation ensures compatibility

### ✅ **CI/CD Integration**
- Works with existing deployment pipelines
- Maintains environment-specific variables
- Supports automated testing workflows

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

## Integration with CI/CD

The smart sync system integrates seamlessly with the existing CI/CD pipeline:

1. **Staging Environment**: Container 135 (10.92.3.25)
2. **Production Environment**: Container 133 (10.92.3.22)
3. **Database**: PostgreSQL Container 131 (10.92.3.21)

Environment-specific configurations are automatically loaded based on container ID, ensuring proper deployment across all environments.
