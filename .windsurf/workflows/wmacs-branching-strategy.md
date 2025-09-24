---
description: WMACS Branching Strategy for LDC Construction Tools Module Development
---

# WMACS Branching Strategy

## Branch Structure

### Main Branches
- **`main`** - Production-ready code (final deployment target)
- **`staging`** - Integration, testing, and staging deployment branch

### Feature Branches (ALL branch from staging)
- **`feature/[module-name]`** - Individual module development
- **`feature/[component-name]`** - Specific component work
- **`hotfix/[issue-name]`** - Critical production fixes

## Current Module Branches

### Active Development
- **`feature/role-management-module`** - Role Management system
- **`feature/phase25-admin-auth-prisma`** - Admin authentication
- **`feature/enhancements`** - General enhancements

## Workflow Process

### 1. Start New Module Work (ALWAYS from staging)
```bash
# Create feature branch from staging
git checkout staging
git pull origin staging
git checkout -b feature/[module-name]
```

### 2. Development Work (on feature branch)
```bash
# Work on feature branch
git add [files]
git commit -m "feat: [WMACS compliant message]"
git push origin feature/[module-name]
```

### 3. Integration to Staging (for staging deployment)
```bash
# Merge feature back to staging for deployment
git checkout staging
git pull origin staging
git merge feature/[module-name]
git push origin staging
```

### 4. WMACS Guardian Validation (mandatory)
```bash
# Always validate staging deployment
node wmacs/wmacs-guardian.js test 135
node wmacs/wmacs-guardian.js health 135
```

### 5. Production Deployment (staging → main)
```bash
# Deploy staging to production when ready
git checkout main
git pull origin main
git merge staging
git push origin main
```

## Branch Protection Rules

- **No direct commits to `main`**
- **All changes through feature branches**
- **WMACS Guardian validation required**
- **Staging testing before production**

## Current Recommendation

For role management work, use:
```bash
git checkout feature/role-management-module
```
