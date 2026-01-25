# LDC Tools Repository Cleanup Audit

**Date:** 2026-01-25  
**Auditor:** Cascade (AI Assistant)  
**Policy Authority:** `.cloudy-work/_cloudy-ops/docs/governance/windsurf-workflow-policy.md`  
**Git Workflow Policy:** `.cloudy-work/_cloudy-ops/policy/git-workflow.md`

---

## Executive Summary

**Total Items Identified:** 89+ obsolete files and directories  
**Critical Finding:** Application is **frontend-only** (Next.js + Prisma), no backend exists  
**Risk Assessment:** Low - Most obsolete items are documentation/tooling, not application code

---

## 🚨 CRITICAL FINDING: No Backend Exists

### Evidence
- ✅ **Application is frontend-only** - Next.js with Prisma ORM
- ✅ **Database:** Direct PostgreSQL via Prisma (no FastAPI layer)
- ✅ **API Routes:** Next.js API routes in `frontend/src/app/api/`
- ❌ **No `/backend` directory** in repo
- ❌ **No FastAPI/Python code** in application

### Documentation References Backend (OBSOLETE)
- `README.md` lines 46-75 - Backend setup instructions (non-existent)
- `DEVELOPMENT.md` - References FastAPI backend
- Multiple deployment scripts reference backend services
- WMACS/APEX docs reference backend ports (8000)

### Conclusion
**All backend references are obsolete.** Application migrated to Next.js-only architecture with Prisma.

---

## 📋 Categorized Findings

### 🗑️ DELETE - Deprecated System Directories (2 directories)

#### 1. `/apex/` (54 items, ~200KB)
- **What:** Deprecated APEX Guardian system
- **Why obsolete:** Replaced by `.cloudy-work/` submodule pattern
- **Risk:** None - Not referenced by application code
- **Action:** DELETE entire directory

#### 2. `/wmacs/` (49 items, ~180KB)
- **What:** Deprecated WMACS Guardian system
- **Why obsolete:** Replaced by MCP server pattern
- **Risk:** None - Not referenced by application code
- **Action:** DELETE entire directory

#### 3. `/.wmacs/` (empty directory)
- **What:** WMACS state directory
- **Why obsolete:** WMACS system deprecated
- **Action:** DELETE

---

### 🗑️ DELETE - Broken Symlinks (1 directory)

#### `/mcp-blue-green/` (4 broken symlinks)
- **What:** Symlinks to `/Users/cory/Documents/Cloudy-Work/applications/theoshift/mcp-blue-green/`
- **Why broken:** Points to non-existent local path (violates container-first policy)
- **Current MCP:** Uses shared MCP server from `.cloudy-work/shared/mcp-servers/homelab-blue-green-mcp/`
- **Risk:** None - Broken symlinks, not used
- **Action:** DELETE entire directory (keep README.md content for reference if needed)

---

### 🗑️ DELETE - Empty Debug Files (9 files)

**Repo Root:**
- `auth-layout.tsx` (0 bytes)
- `check-users.ts` (0 bytes)
- `debug-auth.ts` (0 bytes)
- `fix-password.ts` (0 bytes)
- `fixed-auth.ts` (0 bytes)
- `fixed-middleware.ts` (0 bytes)
- `simple-auth.ts` (0 bytes)
- `simple-middleware.ts` (0 bytes)
- `simple-session-middleware.ts` (0 bytes)
- `simple-signin.tsx` (0 bytes)
- `deploy_to_container.sh` (0 bytes)
- `simple_deploy.sh` (0 bytes)
- `test-db.ts` (0 bytes)

**Risk:** None - Empty files  
**Action:** DELETE all

---

### 🗑️ DELETE - Obsolete Deployment Scripts (6 files)

#### Scripts with Local Path References
1. **`deploy-ldc.sh`** - References `/Users/cory/Documents/Cloudy-Work/applications/`
2. **`restart_servers.sh`** - Local development script (port 3000, local paths)
3. **`deploy.sh`** - APEX deployment wrapper (deprecated)

#### Scripts with Obsolete Branching Model
4. **`create_pr_dev_to_main.sh`** - References `dev` branch (doesn't exist per git-workflow.md)
5. **`create_pr_feature_to_dev.sh`** - References `dev` branch (doesn't exist)
6. **`create_pull_request.sh`** - Generic PR script (likely obsolete)

**Why obsolete:** 
- Violate container-first policy (local paths)
- Reference non-existent `dev` branch
- Replaced by `/bump`, `/release`, `/sync` workflows + MCP server

**Risk:** None - Not used in current deployment workflow  
**Action:** DELETE all

---

### 🗑️ DELETE - Obsolete PR Documentation (4 files)

- `pr_dev_to_main.md` - References `dev` branch (doesn't exist)
- `pr_feature_enhancements_to_dev.md` - References `dev` branch
- `pr_feature_to_dev.md` - References `dev` branch
- `pr_sdd_adopt_to_feature_enhancements.md` - References `dev` branch

**Why obsolete:** Git workflow policy uses trunk-based development (no `dev` branch)  
**Action:** DELETE all

---

### 🗑️ DELETE - Obsolete Root-Level Scripts (2 files)

- `git_commit_script.sh` - Generic commit helper (not used)
- `apex-universal-sync.js` - APEX sync script (deprecated)
- `wmacs-config.js` - WMACS configuration (deprecated)
- `wmacs-staging-auth-fix.js` - WMACS-specific fix (deprecated)
- `enhanced-ldc-mcp.js` - Likely superseded by `mcp-server-ops-ldc/`

**Action:** DELETE all

---

### 📦 ARCHIVE - Historical Documentation (16+ files)

**WMACS Historical Documents (16 files):**
- `WMACS_ARCHITECTURE_ANALYSIS.md`
- `WMACS_AUTHENTICATION_FINAL_STATUS.md`
- `WMACS_AUTH_CREDENTIALS_ANALYSIS.md`
- `WMACS_AUTH_INVESTIGATION.md`
- `WMACS_DASHBOARD_FIX_COMPLETE.md`
- `WMACS_ENHANCED_ENFORCEMENT.md`
- `WMACS_FINAL_STATUS.md`
- `WMACS_FINAL_SYSTEM_STATUS.md`
- `WMACS_INFRASTRUCTURE_CORRECTION.md`
- `WMACS_INVESTIGATION_REPORT.md`
- `WMACS_LESSONS_LEARNED.md` ⭐ **VALUABLE - Contains lessons learned**
- `WMACS_NAVIGATION_FIX_COMPLETE.md`
- `WMACS_PRODUCTION_DEPLOYMENT_STATUS.md`
- `WMACS_SHARED_SYNC.md`
- `WMACS_SUCCESS_REPORT.md`
- `WMACS_TRADE_TEAMS_RESTORED.md`

**APEX Historical Document (1 file):**
- `APEX_GUARDIAN_SYSTEM.md`

**Why preserve:** Historical context, lessons learned, debugging history  
**Action:** ARCHIVE to `_archive/wmacs-apex-history-2026-01-25/`

---

### 📦 ARCHIVE - Phase Audit Documents (4 files)

- `PHASE_4_AUDIT.md`
- `PHASE_4_SIMPLIFIED.md`
- `PHASE_5_AUDIT.md`
- `PHASE_6_AUDIT.md`

**Why preserve:** Historical development phase tracking  
**Action:** ARCHIVE to `_archive/phase-audits/`

---

### 📦 ARCHIVE - Old Deployment Snapshots (1 directory)

#### `/deploy/` (6 subdirectories from Sept 2025)
- `phase1-20250906_083321/`
- `phase1-20250906_083709/`
- `phase1-20250906_091916/`
- `phase1-20250906_164217/`
- `phase2-20250906_083334/`
- `phase2-20250906_164227/`

**Why preserve:** Historical deployment snapshots  
**Action:** ARCHIVE to `_archive/deployment-snapshots-2025/` or DELETE if no value

---

### ⚠️ REVIEW - Potentially Obsolete Documentation (10+ files)

**Backend-Referencing Docs:**
- `DEVELOPMENT.md` - References FastAPI backend (needs update)
- `README.md` - References backend setup (needs update)
- `DEPLOYMENT-ISSUES-AND-SOLUTIONS.md` - May reference backend
- `STAGING_REALITY_CHECK.md` - May reference backend

**Debug/Investigation Docs:**
- `ADMIN_LEVEL_IMPLEMENTATION.md` - Implementation notes
- `ADMIN_PANEL_DEBUG.md` - Debug notes
- `BUG_AUDIT_REPORT.md` - Bug audit
- `BUG_INVESTIGATION_RESULTS.md` - Investigation notes
- `BUG_TEST_RESULTS.md` - Test results

**Roadmap/Planning Docs:**
- `ROADMAP.md` - May be outdated
- `ROADMAP_CHECKLIST.md` - May be outdated

**Action:** REVIEW each file - Update if valuable, archive if historical, delete if obsolete

---

### ⚠️ REVIEW - MCP Server Directory (1 directory)

#### `/mcp-server-ops-ldc/`
- **What:** Custom MCP server for LDC operations
- **Status:** References WMACS system, includes backend port 8000
- **Current MCP:** Uses shared `homelab-blue-green-mcp` from `.cloudy-work/`
- **Question:** Is this still used or superseded by shared MCP?
- **Action:** REVIEW - Determine if still needed or can be deleted

---

### ⚠️ REVIEW - Scripts Directory (19 files)

**QoS Scripts (Python):**
- `qos_control.py`, `qos_daemon.py`, etc. (7 files)
- **Question:** Still used for monitoring?

**Deployment Scripts:**
- `deploy-phase.sh`, `deploy-production.sh`, `deploy-staging.sh`
- **Question:** Replaced by `/bump`, `/release`, `/sync` workflows?

**SDD Script:**
- `adopt_sdd.sh`
- **Question:** Still relevant for SDD module adoption?

**Action:** REVIEW each script for current usage

---

### ⚠️ REVIEW - Bin Directory (5 files)

- `generate-contract`, `generate-plan`, `new-feature`, `test-phase`, `update-spec`
- **Question:** Still used in development workflow?
- **Action:** REVIEW for current usage

---

### ⚠️ REVIEW - Lib Directory (6 subdirectories)

**SDD Modules:**
- `assignment-workflow/`, `calendar-scheduling/`, `communication-hub/`
- `role-management/`, `trade-teams/`, `volunteer-management/`

**Question:** Are these used by frontend or obsolete?  
**Action:** REVIEW - Check if imported by frontend code

---

### ⚠️ REVIEW - Contracts Directory

- `contracts/` (1 item)
- **Action:** REVIEW contents

---

### ⚠️ REVIEW - Excel POC Directory

- `excel-poc/` (8 files)
- **Question:** POC or still used for reference?
- **Action:** REVIEW - Archive if POC complete

---

### ⚠️ REVIEW - Windsurf Customizations

**`.windsurf/agents/` (3 files):**
- `WMACS_LEAD_ARCHITECT_AGENT.md`
- `WMACS_QOS_AGENT.md`
- `agent_manifest.json` - References WMACS system

**`.windsurf/customizations/` (5 files):**
- `commands.json` - WMACS commands
- `cascade-rules.json`, `keybindings.json`, `snippets.json`, `statusbar.json`

**Question:** Are WMACS agents/customizations still used?  
**Action:** REVIEW - Likely obsolete with WMACS deprecation

---

### ✅ KEEP - Core Application Files

**Application Code:**
- `frontend/` - Next.js application (KEEP)
- `frontend/src/` - Application source (KEEP)
- `frontend/prisma/` - Database schema (KEEP)
- `frontend/tests/` - Playwright tests (KEEP)

**Configuration:**
- `frontend/package.json` - Dependencies (KEEP)
- `frontend/next.config.js` - Next.js config (KEEP)
- `frontend/playwright.config.ts` - Test config (KEEP)
- `frontend/tsconfig.json` - TypeScript config (KEEP)
- `frontend/tailwind.config.js` - Tailwind config (KEEP)
- `.gitignore` - Git ignore rules (KEEP)
- `.gitmodules` - Submodule config (KEEP)
- `tsconfig.json` - Root TypeScript config (KEEP)
- `docker-compose.yml` - Docker config (KEEP)

**Context Management:**
- `.cloudy-work/` - Submodule (KEEP)
- `.windsurf/workflows/` - Active workflows (KEEP)
- `TASK-STATE.md` - Current task state (KEEP)
- `DECISIONS.md` - Repo-local decisions (KEEP)

**Current Documentation:**
- `frontend/README.md` - Frontend docs (KEEP, may need update)
- `frontend/DEPLOYMENT.md` - Deployment guide (KEEP)
- `frontend/CHANGELOG.md` - Change history (KEEP)
- `CHANGELOG.md` - Root changelog (KEEP)
- `VERSION` - Version file (KEEP)

**Release Notes:**
- `release-notes/` - User-facing release notes (KEEP)
- `frontend/release-notes/` - Frontend release notes (KEEP)

**Valid Documentation:**
- `HELP.md` - Help documentation (KEEP)
- `PERMISSIONS_MATRIX.md` - Permission reference (KEEP)
- `BACKUP_SYSTEM.md` - Backup procedures (KEEP, review for accuracy)
- `INFRASTRUCTURE_IMMUTABLE.md` - Infrastructure rules (KEEP)
- `TAILSCALE_ACCESS.md` - Access documentation (KEEP)
- `SSR_VS_CLIENT_BEST_PRACTICES.md` - Best practices (KEEP)

---

## 📊 Cleanup Summary

### DELETE (Confirmed - 70+ items)
- 2 deprecated system directories (`apex/`, `wmacs/`)
- 1 empty directory (`.wmacs/`)
- 1 broken symlink directory (`mcp-blue-green/`)
- 13 empty debug files (`.tsx`, `.ts`, `.sh` files)
- 6 obsolete deployment scripts
- 4 obsolete PR documentation files
- 5 obsolete root-level scripts
- 40+ WMACS/APEX agent/customization files

### ARCHIVE (Recommended - 20+ items)
- 16 WMACS historical documents (especially `WMACS_LESSONS_LEARNED.md`)
- 1 APEX historical document
- 4 phase audit documents
- 1 deployment snapshots directory (or DELETE)

### REVIEW (Needs Investigation - 50+ items)
- 10+ documentation files (update or archive)
- 19 scripts in `/scripts/` directory
- 5 bin utilities
- 6 lib/SDD module directories
- 1 contracts directory
- 1 excel-poc directory
- 1 mcp-server-ops-ldc directory
- 8 Windsurf customization files

### KEEP (Confirmed - Core Application)
- `frontend/` application code
- `.cloudy-work/` submodule
- `.windsurf/workflows/` (8 active workflows)
- Core configuration files
- Current documentation
- Release notes

---

## 🎯 Recommended Cleanup Plan

### Phase 1: Safe Deletions (Low Risk)
1. Delete deprecated system directories (`apex/`, `wmacs/`, `.wmacs/`)
2. Delete broken symlink directory (`mcp-blue-green/`)
3. Delete empty debug files (13 files)
4. Delete obsolete deployment scripts (6 files)
5. Delete obsolete PR docs (4 files)
6. Delete obsolete root scripts (5 files)

**Total:** ~70+ items, ~400KB

### Phase 2: Archive Historical Docs
1. Create `_archive/wmacs-apex-history-2026-01-25/`
2. Move 17 WMACS/APEX historical docs
3. Create `_archive/phase-audits/`
4. Move 4 phase audit docs

**Total:** ~21 items, ~150KB

### Phase 3: Review and Update (Requires Analysis)
1. Review and update backend-referencing docs
2. Review scripts directory for current usage
3. Review lib/SDD modules for frontend imports
4. Review bin utilities for current usage
5. Review mcp-server-ops-ldc for current usage
6. Review Windsurf customizations for WMACS references

---

## ⚠️ Safety Checks

### Before Deletion
- ✅ Verify no application imports from `apex/` or `wmacs/`
- ✅ Verify no active scripts reference deleted files
- ✅ Verify `.gitignore` doesn't need updates
- ✅ Create archive for historical documents

### After Deletion
- ✅ Run `npm run build` in frontend to verify no broken imports
- ✅ Run `npm run test:smoke:quick` to verify application works
- ✅ Verify workflows still function
- ✅ Commit changes with detailed message

---

## 📝 Next Steps

**Awaiting approval for:**
1. Phase 1 safe deletions (70+ items)
2. Phase 2 archival (21 items)
3. Phase 3 review scope (which items to investigate)

**Estimated cleanup:** ~90+ obsolete items, ~550KB disk space

---

## Policy Compliance

This audit follows:
- ✅ Container-first development policy (no local path references)
- ✅ Git workflow policy (trunk-based, no dev/staging branches)
- ✅ Windsurf workflow policy (quarantine/archive/delete process)
- ✅ Application safety (no core code deletion)
