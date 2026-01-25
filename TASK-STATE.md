# LDC Tools Task State

**Last updated:** 2026-01-25 4:44pm  
**Current branch:** main  
**Working on:** Ready for normal development

---

## Current Task
**v1.27.2 Deployed to Production** - ✅ COMPLETE

### What was accomplished today (2026-01-25)

**v1.27.2 Bug Fix Deployment:**
- ✅ **Issue:** Personnel Contact Support staff couldn't submit crew requests on behalf of others
- ✅ **Root cause:** Role code mismatch (`PC_SUPPORT` vs `PC-Support`) + whitespace from copy-paste
- ✅ **Fix deployed:** Corrected role code + added `.trim()` to override fields
- ✅ **Testing:** Confirmed working with affected user (Amber Williams)
- ✅ **Deployed to production:** Both containers running v1.27.2
- ✅ **Release notes:** Created `release-notes/v1.27.2.md`

**Container Assignments Verified:**
- Container 133 (ldctools-blue): 10.92.3.23 - STANDBY
- Container 135 (ldctools-green): 10.92.3.25 - LIVE

### Recent completions
- ✅ v1.27.2 bug fix deployment (crew request submission)
- ✅ Complete repository rename (all 9 phases)
- ✅ Database name verification and documentation updates
- ✅ Comprehensive repository cleanup (100+ files removed/archived)
- ✅ Architecture history documented (`ARCHITECTURE-HISTORY.md`)

### Key findings
- **FastAPI backend was intentionally removed in v1.18.0** - Not broken, just documentation debt
- **Application is Next.js-only** - API routes + Prisma ORM, no separate backend
- **Database name:** `ldc_tools` (verified on containers)

---

## Known Issues
**Pre-existing:**
- TypeScript error in `ImportExportButtons.tsx` (lines 52, 184)
- Smoke tests failing on STANDBY (authentication/environment issues)
- SSH alias confusion: `ldc-staging` → Container 135 (GREEN), `ldc-prod` → Container 133 (BLUE)

---

## Next Steps

**Ready for:**
1. Feature development
2. Bug fixes (TypeScript errors, smoke test issues)
3. Normal operations (deploy, test, release)
4. Fix SSH alias configuration to match actual container assignments

---

## Deferred for Later
- Fix TypeScript error in `ImportExportButtons.tsx`
- Debug smoke test failures on STANDBY
- Roadmap files review (`ROADMAP.md`, `ROADMAP_CHECKLIST.md`)
