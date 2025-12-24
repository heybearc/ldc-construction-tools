# LDC Construction Tools - Blue-Green Deployment

## Infrastructure Overview

### Containers
- **ldctools-blue** (Container 133 - 10.92.3.23) - STANDBY environment
- **ldctools-green** (Container 135 - 10.92.3.25) - LIVE environment
- **Database** (Container 131 - 10.92.3.21) - Shared PostgreSQL

### Domains
- **BLUE:** https://blue.ldctools.com (STANDBY)
- **GREEN:** https://green.ldctools.com (LIVE)
- **Main:** https://ldc.cloudigan.net (points to current LIVE)

## Blue-Green Deployment Process

### Development Workflow
1. Develop and test on **BLUE** (STANDBY)
2. Verify all features work on BLUE
3. Version bump and create changelog
4. Switch traffic to make BLUE the new LIVE
5. Previous LIVE becomes new STANDBY

### Deployment Commands

#### Deploy to BLUE (STANDBY)
```bash
ssh root@10.92.3.23
cd /opt/ldc-construction-tools/frontend
git pull
npm install
npm run build
pm2 restart ldc-frontend
```

#### Deploy to GREEN (LIVE)
```bash
ssh root@10.92.3.25
cd /opt/ldc-construction-tools/frontend
git pull
npm install
npm run build
pm2 restart ldc-frontend
```

#### Switch Traffic (Blue → Green or Green → Blue)
Update NPM proxy or load balancer to point main domain to desired container.

### Environment Variables
- `NEXTAUTH_URL` - Set to container's public URL
- `DATABASE_URL` - Shared database connection (same for both)
- `NODE_ENV` - Set to "production" on both containers

## Current Status
**Last Updated:** December 24, 2024

- **BLUE (10.92.3.23):** LIVE/Production
- **GREEN (10.92.3.25):** STANDBY/Testing
- **Database:** Shared between both environments (10.92.3.21)

**⚠️ UPDATE THIS SECTION AFTER EVERY TRAFFIC SWITCH**

## ⚠️ CRITICAL: Blue-Green Deployment Workflow

**Use MCP Server Workflows (Recommended):**
1. **`/bump`** - Version bump, deploy to STANDBY, create release notes
2. **`/release`** - Switch traffic (STANDBY → LIVE)
3. **`/sync`** - Sync new STANDBY with LIVE code

**NEVER deploy to both environments simultaneously!**

---

## Deployment Methods

### Method 1: MCP Server Workflows (RECOMMENDED)

**See workflow files in `.windsurf/workflows/`:**
- [`bump.md`](../.windsurf/workflows/bump.md) - Complete version bump and STANDBY deployment
- [`release.md`](../.windsurf/workflows/release.md) - Traffic switching
- [`sync.md`](../.windsurf/workflows/sync.md) - STANDBY synchronization

**Quick Reference:**
```bash
# 1. Bump version and deploy to STANDBY
/bump

# 2. Test on STANDBY: https://green.ldctools.com

# 3. Switch traffic (after approval)
/release

# 4. Sync new STANDBY (after approval)
/sync
```

**MCP Tools Used:**
- `mcp3_get_deployment_status` - Check current LIVE/STANDBY status
- `mcp3_deploy_to_standby` - Deploy to STANDBY with health checks
- `mcp3_switch_traffic` - Switch HAProxy traffic with validation

### Method 2: Manual Deployment (Fallback Only)

**Only use if MCP server is unavailable.**

**Full manual procedures:** [`../DEPLOYMENT-ISSUES-AND-SOLUTIONS.md`](../DEPLOYMENT-ISSUES-AND-SOLUTIONS.md)

**Quick Manual Steps:**
```bash
# 1. Deploy to STANDBY (currently GREEN)
ssh root@10.92.3.25
cd /opt/ldc-construction-tools/frontend
pm2 delete ldc-frontend
git pull origin main
rm -rf .next node_modules/.cache
npm run build
pm2 start npm --name ldc-frontend -- start
pm2 save

# 2. Test on https://green.ldctools.com

# 3. Switch traffic (update HAProxy on 10.92.3.36)

# 4. Sync new STANDBY (BLUE)
ssh root@10.92.3.23
[same deployment commands]
```

### Testing Checklist

Visit STANDBY URL and verify:
- ✓ Authentication (login/logout)
- ✓ User management page
- ✓ Trade Teams page
- ✓ Volunteers page (grid and list views)
- ✓ Edit functionality
- ✓ No console errors

**Do NOT proceed with release if any tests fail!**

## Rollback Process
If issues occur after switching traffic:
1. Switch traffic back to previous LIVE container
2. Investigate issues on STANDBY container
3. Fix and re-test before attempting switch again
