# LDC Tools Repo-Local Decisions

This file tracks decisions specific to working on the LDC Tools repo.

For shared architectural decisions that apply to all apps, see `.cloudy-work/_cloudy-ops/context/DECISIONS.md`.

---

## D-LDC-001: Container-first development
- **Decision:** All LDC Tools development occurs on containers (ldc-staging, ldc-prod)
- **Why:** Consistent environment, no local dependency conflicts
- **When:** Established as standard practice
- **Pattern:** Local Mac for Windsurf/git, containers for builds/tests/execution
- **Canonical path:** `/opt/ldc-construction-tools/frontend`

## D-LDC-002: Blue-green deployment model
- **Decision:** Use blue-green containers for zero-downtime deployments
- **Why:** Allows testing on STANDBY before switching traffic
- **When:** Infrastructure established
- **Containers:** ldc-staging (135), ldc-prod (133)
- **Verify LIVE/STANDBY:** `.cloudy-work/_cloudy-ops/scripts/verify-live-standby.sh ldctools`

## D-LDC-003: FastAPI backend was intentionally removed
- **Date:** 2026-01-25 (documented)
- **Context:** LDC Tools migrated from FastAPI backend to Next.js-only architecture in v1.18.0 (Sept 2025)
- **Decision:** Application is Next.js full-stack (API routes + Prisma ORM), no separate backend
- **Consequences:** All backend references in docs/scripts are obsolete technical debt, not broken functionality
- **Reference:** See `ARCHITECTURE-HISTORY.md` for complete migration details

## D-LDC-004: Comprehensive cleanup completed
- **Date:** 2026-01-25
- **Context:** 100+ obsolete files remained from FastAPI migration and deprecated APEX/WMACS systems
- **Decision:** Removed all obsolete code, scripts, and documentation; archived historical items
- **Consequences:** Repository is clean, well-documented, and ready for continued development
- **Details:** See `CLEANUP-COMPLETE-REPORT.md` for full cleanup summary
