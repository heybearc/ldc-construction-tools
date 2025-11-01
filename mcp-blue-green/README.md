# LDC Tools Blue-Green Deployment MCP Server

This MCP server provides automated blue-green deployment capabilities for LDC Tools.

## Overview

**Shared MCP Server:** This directory uses the shared blue-green deployment MCP server from `jw-attendant-scheduler/mcp-blue-green`. The same server handles both JW Attendant and LDC Tools deployments.

## Infrastructure

### Containers
- **BLUE (Container 133):** 10.92.3.23:3001 - Production
- **GREEN (Container 135):** 10.92.3.25:3001 - Standby
- **Database (Container 131):** 10.92.3.21 - Shared PostgreSQL
- **HAProxy (Container 136):** 10.92.3.26 - Load balancer

### Configuration
```javascript
{
  name: 'LDC Tools',
  blueIp: '10.92.3.23',
  greenIp: '10.92.3.25',
  blueContainer: 133,
  greenContainer: 135,
  haproxyBackend: 'ldc',
  sshBlue: 'ldctools-blue',
  sshGreen: 'ldctools-green',
  path: '/opt/ldc-construction-tools/frontend',
  branch: 'main',
  pmBlue: 'ldc-production',
  pmGreen: 'ldc-production',
}
```

## Available Tools

### 1. `get_deployment_status`
Get current PROD and STANDBY server status with health checks.

**Parameters:**
- `app`: `"ldc-tools"` (required)

**Example:**
```javascript
{
  "app": "ldc-tools"
}
```

**Returns:**
- Current PROD server (IP, container, health status)
- Current STANDBY server (IP, container, health status)
- HAProxy backend status
- Deployment history

### 2. `deploy_to_standby`
Deploy code to STANDBY server with automated health checks.

**Parameters:**
- `app`: `"ldc-tools"` (required)
- `pullGithub`: `true` (default) - Pull latest code from GitHub
- `runMigrations`: `false` (default) - Run database migrations
- `createBackup`: `true` (default) - Create backup before deployment

**Example:**
```javascript
{
  "app": "ldc-tools",
  "pullGithub": true,
  "runMigrations": false,
  "createBackup": true
}
```

**Process:**
1. Creates backup (if requested)
2. Pulls latest code from GitHub
3. Installs dependencies (`npm install --legacy-peer-deps`)
4. Runs migrations (if requested)
5. Builds application (`npm run build`)
6. Restarts PM2 process
7. Runs health checks
8. Reports success or failure

### 3. `switch_traffic`
Switch traffic from PROD to STANDBY (requires approval).

**Parameters:**
- `app`: `"ldc-tools"` (required)
- `requireApproval`: `true` (default) - Require manual approval before switching
- `emergency`: `false` (default) - Emergency rollback mode (skip health checks)

**Example (with approval):**
```javascript
{
  "app": "ldc-tools",
  "requireApproval": true
}
```

**Example (execute switch):**
```javascript
{
  "app": "ldc-tools",
  "requireApproval": false
}
```

**Process:**
1. Checks STANDBY health (unless emergency mode)
2. Requests approval (if requireApproval=true)
3. Updates HAProxy configuration
4. Reloads HAProxy (zero downtime)
5. Updates deployment state
6. Reports new PROD/STANDBY status

## Workflows

### Bump (Version Update)
See `.windsurf/workflows/bump.md`

1. Analyze changes
2. Update version numbers
3. Create release notes
4. Deploy to STANDBY
5. Wait for approval

### Release (Traffic Switch)
See `.windsurf/workflows/release.md`

1. Check deployment status
2. Switch traffic to STANDBY
3. Report new PROD/STANDBY
4. Wait for sync approval

### Sync (Update STANDBY)
See `.windsurf/workflows/sync.md`

1. Identify new STANDBY
2. Deploy latest code to STANDBY
3. Verify health
4. Report completion

## SSH Shortcuts

Configure in `~/.ssh/config`:

```
Host ldctools-blue
    HostName 10.92.3.23
    User root
    ProxyJump prox

Host ldctools-green
    HostName 10.92.3.25
    User root
    ProxyJump prox
```

## Health Check Endpoint

The MCP server checks: `http://<server-ip>:3001/api/health`

Ensure your application has a health endpoint that returns HTTP 200 when healthy.

## Domains

- **Production:** https://ldctools.com
- **BLUE Direct:** https://blue.ldctools.com
- **GREEN Direct:** https://green.ldctools.com

## Safety Features

- ✅ Health checks before traffic switch
- ✅ Approval gates for production changes
- ✅ Automatic backups before deployment
- ✅ Zero-downtime HAProxy reload
- ✅ Emergency rollback capability
- ✅ Deployment state tracking

## Troubleshooting

### Health Check Fails
```bash
# Check if app is running
ssh ldctools-blue "pm2 status"

# Check logs
ssh ldctools-blue "pm2 logs ldc-production --lines 50"

# Test health endpoint
curl http://10.92.3.23:3001/api/health
```

### Deployment Fails
```bash
# Check build logs
ssh ldctools-blue "cd /opt/ldc-construction-tools/frontend && npm run build"

# Check PM2 status
ssh ldctools-blue "pm2 status"

# Restart manually
ssh ldctools-blue "pm2 restart ldc-production"
```

### HAProxy Issues
```bash
# Check HAProxy status
ssh prox "pct exec 136 -- systemctl status haproxy"

# View HAProxy config
ssh prox "pct exec 136 -- cat /etc/haproxy/haproxy.cfg | grep ldc"

# Test config
ssh prox "pct exec 136 -- haproxy -c -f /etc/haproxy/haproxy.cfg"
```

## Notes

- Always deploy to STANDBY first
- Always test on STANDBY before switching traffic
- Never deploy to both environments simultaneously
- Always get approval before switching traffic
- Always sync STANDBY after release to keep environments in sync
