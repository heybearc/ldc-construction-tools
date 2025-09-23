---
description: Bidirectional WMACS Guardian system synchronization
---

# WMACS Guardian System Synchronization

This workflow synchronizes enhancements between the shared WMACS system and the current repository.

## Prerequisites

1. Ensure you have access to the shared WMACS system:
   ```bash
   ls ~/Documents/Cloudy-Work/shared/wmacs-guardian-system/
   ```

2. Verify current repository has WMACS directory:
   ```bash
   ls wmacs/
   ```

## Synchronization Steps

### 1. Check for Updates in Shared System

```bash
cd ~/Documents/Cloudy-Work/shared/wmacs-guardian-system
git status
git pull origin main
```

### 2. Compare Versions

```bash
# Check if shared system has newer files
diff -r ~/Documents/Cloudy-Work/shared/wmacs-guardian-system/ ./wmacs/ --exclude=".git"
```

### 3. Sync FROM Shared System (Pull Updates)

// turbo
```bash
# Copy updated files from shared system
cp ~/Documents/Cloudy-Work/shared/wmacs-guardian-system/WINDSURF_OPERATIONAL_GUIDELINES.md wmacs/
cp ~/Documents/Cloudy-Work/shared/wmacs-guardian-system/ENFORCEMENT_MECHANISMS.md wmacs/
cp ~/Documents/Cloudy-Work/shared/wmacs-guardian-system/OPERATIONAL_PROCEDURES.md wmacs/
cp ~/Documents/Cloudy-Work/shared/wmacs-guardian-system/wmacs-guardian.js wmacs/
cp ~/Documents/Cloudy-Work/shared/wmacs-guardian-system/wmacs-research-advisor.js wmacs/
cp ~/Documents/Cloudy-Work/shared/wmacs-guardian-system/wmacs-auto-advisor.js wmacs/
```

### 4. Update Project-Specific Configuration

```bash
# Ensure project-specific settings are maintained
echo "Verifying project-specific configuration..."
grep -n "ldc-construction-tools" wmacs-config.js
grep -n "Container 134" wmacs/WINDSURF_OPERATIONAL_GUIDELINES.md
```

### 5. Sync TO Shared System (Push Enhancements)

```bash
# Copy any project-specific improvements back to shared system
cp wmacs/WINDSURF_OPERATIONAL_GUIDELINES.md ~/Documents/Cloudy-Work/shared/wmacs-guardian-system/
```

### 6. Test WMACS System

// turbo
```bash
# Validate WMACS system functionality
node wmacs/wmacs-guardian.js diagnose
```

### 7. Commit Changes

```bash
git add wmacs/ wmacs-config.js .windsurf/
git commit -m "sync: Update WMACS Guardian system from shared repository

🛡️ WMACS SYNCHRONIZATION:
- Synced latest shared WMACS components
- Maintained project-specific configuration
- Validated system functionality

WMACS Guardian: Bidirectional sync completed"
```

### 8. Deploy to Staging

```bash
# Follow WMACS deployment rules
git checkout staging
git merge feature/role-management-module
git push origin staging
```

### 9. Update Shared System Repository

```bash
cd ~/Documents/Cloudy-Work/shared/wmacs-guardian-system
git add .
git commit -m "sync: Update from ldc-construction-tools project"
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

### Merge Conflicts
If there are conflicts between shared and local versions:
1. Review differences carefully
2. Preserve project-specific settings
3. Test functionality after resolution

### Missing Files
If shared system is missing files:
1. Check if files were moved or renamed
2. Verify git repository status
3. Contact system administrator if needed

## Automation Notes

This workflow can be automated using:
- Git hooks for automatic synchronization
- Cron jobs for scheduled updates
- CI/CD pipeline integration for deployment
