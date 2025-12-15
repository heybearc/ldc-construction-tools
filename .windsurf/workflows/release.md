---
description: Switch traffic from STANDBY to PRODUCTION for LDC Tools (after bump and testing)
---

# LDC Tools Release Workflow

## CRITICAL: Release Does NOT Include Sync

**When user says "release" for LDC Tools:**
1. Check current deployment status
2. Update HAProxy configuration
3. Reload HAProxy (zero downtime)
4. **STOP - DO NOT SYNC**
5. Report completion
6. Ask if user wants to sync

**NEVER automatically sync after release!**

## Infrastructure Context

**Current Setup:**
- **BLUE (Container 133):** 10.92.3.23:3001 - Currently PRODUCTION
- **GREEN (Container 135):** 10.92.3.25:3001 - Currently STANDBY
- **HAProxy (Container 136):** Routes ldctools.com traffic
- **Config:** `/etc/haproxy/haproxy.cfg`

## Steps

### 1. Verify Current Status

Check which environment is currently PROD using MCP tool:
```bash
mcp3_get_deployment_status --app=ldc-tools
```

This shows:
- Current PROD server (BLUE or GREEN)
- Current STANDBY server
- Health status of both
- HAProxy backend status

### 2. Switch Traffic

Use MCP tool to switch traffic:
```bash
# First run with approval required (shows what will happen)
mcp3_switch_traffic --app=ldc-tools --requireApproval=true

# Then run without approval to execute
mcp3_switch_traffic --app=ldc-tools --requireApproval=false
```

This automatically:
- Checks STANDBY health
- Updates HAProxy configuration
- Reloads HAProxy (zero downtime)
- Updates deployment state tracking

### 3. Verify Traffic Switch

Test that traffic is now going to the new PROD:
```bash
# Test main domain
curl -I https://ldctools.com

# Verify with MCP tool
mcp3_get_deployment_status --app=ldc-tools
```

### 5. Report and STOP

**Report:**
```
✅ Traffic Switched Successfully!

OLD PROD (now STANDBY): [BLUE/GREEN] - Container [133/135]
NEW PROD: [GREEN/BLUE] - Container [135/133]

URLs:
- Production: https://ldctools.com → [NEW PROD]
- BLUE Direct: https://blue.ldctools.com → Container 133
- GREEN Direct: https://green.ldctools.com → Container 135

**STANDBY is now running OLD code!**

Ready to sync STANDBY when you approve.
```

**DO NOT SYNC** - Wait for explicit command!

### 6. Wait for Explicit Sync Command

**User must say "sync" to proceed with syncing STANDBY**

## What NOT To Do

❌ **NEVER** sync automatically after release
❌ **NEVER** assume user wants sync
❌ **NEVER** combine release and sync operations
❌ **NEVER** modify both BLUE and GREEN simultaneously

## Correct Behavior

✅ Release = Switch traffic ONLY
✅ Sync = Separate command, explicit approval required
✅ Always ask before syncing
✅ Always backup HAProxy config before changes
✅ Always validate config before reloading

## Example Interaction

**User:** "release"
**Assistant:** 
- Updates HAProxy config
- Validates configuration
- Reloads HAProxy
- Reports new PROD/STANDBY
- "Traffic switched. Ready to sync STANDBY when you approve."
- **STOPS and WAITS**

**User:** "sync"
**Assistant:**
- Now syncs STANDBY with PROD code
- Reports completion

## HAProxy Routing Reference

**Main Domain Routing:**
```haproxy
# LDC Tools - Main domain goes to PROD
use_backend ldc_blue if is_ldc    # BLUE is PROD
# OR
use_backend ldc_green if is_ldc   # GREEN is PROD
```

**Subdomain Routing (always direct):**
```haproxy
# These never change
use_backend ldc_blue if is_ldc_blue    # blue.ldctools.com → BLUE
use_backend ldc_green if is_ldc_green  # green.ldctools.com → GREEN
```

## Remember

**Release and Sync are TWO SEPARATE operations!**
- Release = Traffic switch
- Sync = Code deployment to STANDBY
