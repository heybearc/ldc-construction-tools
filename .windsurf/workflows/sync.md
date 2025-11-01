---
description: Sync STANDBY with PRODUCTION code after release for LDC Tools
---

# LDC Tools Sync Workflow

## Purpose

Sync STANDBY environment with PRODUCTION code after a release.

**This is a SEPARATE operation from release!**

## When To Use

- After a successful release
- User explicitly says "sync"
- NEVER automatically after release

## Steps

### 1. Get Deployment Status

Check which server is currently STANDBY:
```javascript
// Use MCP tool
{
  "app": "ldc-tools"
}
```

This will show:
- Current PROD server
- Current STANDBY server
- Health status of both

### 2. Deploy to STANDBY

Use the MCP tool to deploy latest code to STANDBY:
```javascript
{
  "app": "ldc-tools",
  "pullGithub": true,
  "runMigrations": false,
  "createBackup": true
}
```

**What this does:**
1. Creates backup
2. Pulls latest code from `main` branch
3. Installs dependencies (`npm install --legacy-peer-deps`)
4. Builds application (`npm run build`)
5. Restarts PM2 process
6. Runs health checks
7. Reports success

### 3. Verify STANDBY Health

After deployment, verify STANDBY is healthy:
- Check health status in deployment status
- Test direct URL: `https://blue.ldctools.com` or `https://green.ldctools.com`
- Verify version matches PROD

### 4. Report Completion

Report to user:
```
✅ STANDBY Synced Successfully!

PROD: [SERVER] - Running v[VERSION]
STANDBY: [SERVER] - Running v[VERSION]

Both environments now running same code.
Ready for next development cycle.
```

## Critical Rules

❌ **NEVER** sync automatically after release
✅ **ALWAYS** wait for explicit "sync" command
✅ **ALWAYS** confirm which server is STANDBY before syncing
✅ **ALWAYS** use MCP tool for deployment (don't use manual SSH)
✅ **ALWAYS** verify health after sync

## Example Interaction

**User:** "sync"

**Assistant:**
1. Calls `get_deployment_status` for ldc-tools
2. Identifies STANDBY server
3. Calls `deploy_to_standby` for ldc-tools
4. Waits for deployment to complete
5. Verifies health checks passed
6. Reports completion
7. **DOES NOT** switch traffic or do anything else

## Manual Sync (Fallback)

If MCP tool fails, manual sync process:

```bash
# 1. Identify STANDBY (check deployment status first)
# Assume GREEN is STANDBY for this example

# 2. SSH to STANDBY
ssh ldctools-green

# 3. Pull latest code
cd /opt/ldc-construction-tools
git pull origin main

# 4. Install dependencies
cd frontend
npm install --legacy-peer-deps

# 5. Build
npm run build

# 6. Restart
pm2 restart ldc-production

# 7. Verify
pm2 status
curl http://localhost:3001/api/health
```

## Troubleshooting

### Deployment Fails

**Check build errors:**
```bash
ssh ldctools-[standby] "cd /opt/ldc-construction-tools/frontend && npm run build"
```

**Check PM2 status:**
```bash
ssh ldctools-[standby] "pm2 status"
ssh ldctools-[standby] "pm2 logs ldc-production --lines 50"
```

**Restart manually:**
```bash
ssh ldctools-[standby] "pm2 restart ldc-production"
```

### Health Check Fails

**Test health endpoint:**
```bash
curl http://10.92.3.23:3001/api/health  # BLUE
curl http://10.92.3.25:3001/api/health  # GREEN
```

**Check application logs:**
```bash
ssh ldctools-[standby] "pm2 logs ldc-production --lines 100"
```

**Check database connectivity:**
```bash
ssh ldctools-[standby] "cd /opt/ldc-construction-tools/frontend && npx prisma db pull"
```

## Notes

- Sync keeps both environments running same code
- After sync, both PROD and STANDBY are identical
- This prepares STANDBY for next deployment cycle
- Always verify health after sync
- Use MCP tool for consistency and safety
