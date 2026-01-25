# Promote to Control Plane

## Infrastructure: LDC Tools Container Assignment Verification
**Type:** infrastructure
**Target:** _cloudy-ops/docs/infrastructure/ldc-tools-containers.md
**Affects:** ldc-tools
**Date:** 2026-01-25

**Context:** During v1.27.2 deployment, discovered SSH alias naming doesn't match actual container hostnames, causing deployment confusion.

**Discovery:**
Verified actual container assignments for LDC Tools:
- **Container 133 (ldctools-blue):** IP 10.92.3.23 - Currently STANDBY
- **Container 135 (ldctools-green):** IP 10.92.3.25 - Currently LIVE

**SSH Alias Issue:**
- `ldc-staging` SSH alias → Container 135 (GREEN) 
- `ldc-prod` SSH alias → Container 133 (BLUE)

This is backwards from the typical convention where "staging" would map to STANDBY and "prod" would map to LIVE.

**Impact:** 
- Caused confusion during deployment workflow
- MCP tool showed incorrect/confusing container assignments
- Need to either fix SSH aliases or document this clearly

**Recommendation:**
Document the actual container assignments and SSH alias mappings in infrastructure docs. Consider renaming SSH aliases to match actual roles or use neutral names like `ldc-blue` and `ldc-green`.

**References:** 
- HAProxy config at 10.92.3.26:/etc/haproxy/haproxy.cfg
- Container hostnames verified via `hostname` command
- Related to blue-green deployment strategy (D-LDC-002)

---

## Infrastructure: SSH Alias Configuration Standard
**Type:** infrastructure
**Target:** _cloudy-ops/docs/infrastructure/ssh-configuration.md
**Affects:** all
**Date:** 2026-01-25

**Context:** SSH alias naming can cause confusion when it doesn't align with actual container roles or naming.

**Discovery:**
SSH aliases should follow a clear naming convention to avoid deployment confusion:

**Option 1 - Role-based (current for TheoShift):**
- `app-live` → Current LIVE container
- `app-standby` → Current STANDBY container
- Requires updating aliases after each traffic switch

**Option 2 - Color-based (recommended):**
- `app-blue` → Blue container (static)
- `app-green` → Green container (static)
- Never changes, matches HAProxy backend names

**Option 3 - Container ID-based:**
- `app-133` → Container 133
- `app-135` → Container 135
- Most explicit, never ambiguous

**Current LDC Tools Issue:**
- `ldc-staging` → Container 135 (GREEN)
- `ldc-prod` → Container 133 (BLUE)
- Names imply role but don't match actual LIVE/STANDBY status

**Recommendation:**
Standardize on **Option 2 (color-based)** for all apps using blue-green deployment:
- Matches HAProxy backend naming
- Static, never needs updating
- Clear and unambiguous
- Aligns with container hostnames

**Impact:**
Need to update SSH config for LDC Tools and potentially other apps to use consistent naming.

**References:**
- Blue-green deployment decision (D-002)
- LDC Tools deployment confusion during v1.27.2 release
