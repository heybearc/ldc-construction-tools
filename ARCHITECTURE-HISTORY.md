# LDC Tools Architecture History

**Date:** 2026-01-25  
**Purpose:** Document the FastAPI → Next.js migration and technical debt cleanup

---

## 🎯 Executive Summary

**LDC Tools successfully migrated from a FastAPI backend to a Next.js-only architecture in v1.18.0 (released ~Sept 2025).**

- ✅ **Migration Complete:** FastAPI backend removed (4,669 lines deleted)
- ✅ **Current Architecture:** Next.js 14 + Prisma ORM + PostgreSQL
- ✅ **No Technical Debt:** Migration was intentional and successful
- ⚠️ **Documentation Debt:** Extensive obsolete references remain

---

## 📊 Architecture Evolution

### Phase 1: Original Architecture (Pre-v1.18.0)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js       │────▶│   FastAPI       │────▶│   PostgreSQL    │
│   Frontend      │     │   Backend       │     │   Database      │
│   (Port 3001)   │     │   (Port 8000)   │     │   (Port 5432)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Components:**
- **Frontend:** Next.js 14 with TypeScript, Tailwind CSS
- **Backend:** FastAPI (Python) with SQLAlchemy ORM
- **Database:** PostgreSQL (shared, container 131)
- **Deployment:** Separate frontend/backend processes

**Issues:**
- Dual maintenance burden (TypeScript + Python)
- Complex deployment (2 services to manage)
- Resource overhead (2 processes, 2 ports)
- API proxy configuration complexity
- CORS configuration required

### Phase 2: Migration to Next.js-Only (v1.18.0, Sept 2025)

```
┌─────────────────────────────────────┐     ┌─────────────────┐
│   Next.js 14 (Full Stack)           │────▶│   PostgreSQL    │
│   - Frontend (React)                │     │   Database      │
│   - API Routes (/api/v1/*)          │     │   (Port 5432)   │
│   - Prisma ORM                      │     │                 │
│   (Port 3001)                       │     │                 │
└─────────────────────────────────────┘     └─────────────────┘
```

**Migration Actions:**
1. **Converted FastAPI endpoints → Next.js API routes**
   - Example: `/api/v1/volunteers` → `frontend/src/app/api/v1/volunteers/route.ts`
2. **Replaced SQLAlchemy → Prisma ORM**
   - Schema: `frontend/prisma/schema.prisma`
   - Direct PostgreSQL access via Prisma Client
3. **Removed FastAPI backend** (4,669 lines deleted)
4. **Consolidated environment files** (3 .env files → 1 .env.local)
5. **Simplified deployment** (1 process instead of 2)

**Benefits:**
- ✅ Single language (TypeScript)
- ✅ Simplified deployment (1 service)
- ✅ Reduced resource usage (50% CPU, 25% RAM)
- ✅ No CORS complexity
- ✅ Better type safety (Prisma types)
- ✅ Improved build performance

---

## 📝 Evidence from Release Notes

### v1.18.0 Release Notes (RELEASE_NOTES.md:101)
```
**Code Cleanup**
- Removed 4,669 lines of unused FastAPI backend code
- Consolidated 3 .env files into single .env.local
- Simplified configuration management
- Improved build performance
```

### Migration Strategy Document (docs/REVISED_DEPLOYMENT_STRATEGY.md:109-121)
```javascript
### Convert FastAPI Backend to Next.js API Routes
Your current FastAPI endpoints can be converted to Next.js API routes:

// pages/api/volunteers/index.js
export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get volunteers logic
  } else if (req.method === 'POST') {
    // Create volunteer logic
  }
}
```

### APEX FastAPI Cleanup Tool (apex/wmacs-fastapi-cleanup.js)
- Tool created to systematically convert FastAPI calls to Prisma
- Scanned for `BACKEND_URL` and `:8000` references
- Generated conversion templates for all endpoints

---

## 🗂️ Current Architecture (v1.27.1)

### Application Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── api/v1/          # Next.js API routes (replaces FastAPI)
│   │   │   ├── volunteers/
│   │   │   ├── trade-teams/
│   │   │   ├── projects/
│   │   │   ├── admin/
│   │   │   └── ...
│   │   ├── volunteers/      # Frontend pages
│   │   ├── trade-teams/
│   │   └── ...
│   ├── components/          # React components
│   └── lib/                 # Utilities
├── prisma/
│   ├── schema.prisma        # Database schema (38 models)
│   └── seed.ts              # Seed data
└── package.json             # Dependencies
```

### Database Access Pattern
```typescript
// Direct Prisma access in API routes
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const volunteers = await prisma.volunteer.findMany({
    include: { user: true, roles: true }
  });
  return NextResponse.json(volunteers);
}
```

### Deployment (Blue-Green)
- **BLUE (Container 133):** 10.92.3.23:3001 - STANDBY
- **GREEN (Container 135):** 10.92.3.25:3001 - LIVE
- **Database (Container 131):** 10.92.3.21:5432 - Shared PostgreSQL
- **HAProxy (Container 136):** 10.92.3.26 - Load balancer

**Single Process Deployment:**
```bash
cd /opt/ldc-construction-tools/frontend
npm install --legacy-peer-deps
npm run build
pm2 restart ldc-tools-green
```

---

## 🧹 Technical Debt Assessment

### ✅ No Application Technical Debt
- Migration was **intentional and complete**
- Application works correctly with Next.js-only architecture
- No broken functionality
- No performance issues
- No security concerns

### ⚠️ Documentation Technical Debt (HIGH)

**Obsolete References to FastAPI Backend:**

1. **README.md (lines 46-75)**
   - Backend setup instructions (non-existent backend)
   - References `cd backend`, `pip install`, `uvicorn`

2. **DEVELOPMENT.md (entire file)**
   - "Backend (FastAPI)" section
   - Backend API endpoints documentation
   - Backend testing instructions
   - Backend deployment instructions

3. **Deployment Scripts (6 files)**
   - `deploy-ldc.sh` - References backend deployment
   - `restart_servers.sh` - Restarts backend service
   - `scripts/deploy-staging.sh` - Installs backend deps, starts uvicorn
   - `scripts/deploy-production.sh` - Backend health checks, uvicorn restart

4. **WMACS/APEX Documentation (100+ files)**
   - References FastAPI backend architecture
   - Backend port 8000 references
   - Backend health check endpoints

5. **MCP Server (mcp-server-ops-ldc/)**
   - References backend port 8000
   - Backend restart operations

---

## 🎯 Cleanup Recommendations

### Priority 1: Update Core Documentation
1. **README.md** - Remove backend setup, update architecture section
2. **DEVELOPMENT.md** - Rewrite for Next.js-only architecture
3. **frontend/README.md** - Update deployment instructions

### Priority 2: Delete Obsolete Scripts
1. Delete deployment scripts referencing backend
2. Delete backend-specific health check scripts
3. Update or delete MCP server if it references backend

### Priority 3: Archive Historical Documentation
1. Archive WMACS/APEX documentation (contains backend references)
2. Archive phase audit documents
3. Archive deployment strategy documents

### Priority 4: Update Deployment Workflows
1. Verify `/bump`, `/release`, `/sync` workflows don't reference backend
2. Update any workflow documentation referencing backend

---

## 📚 Migration Lessons Learned

### What Worked Well
- ✅ Incremental conversion of endpoints
- ✅ Prisma ORM provided excellent type safety
- ✅ Next.js API routes simplified deployment
- ✅ Single codebase reduced maintenance burden

### What Could Be Improved
- ⚠️ Documentation updates lagged behind code changes
- ⚠️ Obsolete scripts and tools not removed during migration
- ⚠️ WMACS/APEX systems referenced obsolete architecture

### Recommendations for Future Migrations
1. **Update documentation immediately** when architecture changes
2. **Delete obsolete code/scripts** as part of migration
3. **Create architecture history document** during migration
4. **Update all deployment tooling** before declaring migration complete

---

## 🔍 Verification

### Confirm No Backend Exists
```bash
# No backend directory
ls -la /Users/cory/Projects/ldc-construction-tools/backend
# Result: No such file or directory ✅

# No Python backend code
find . -name "*.py" -path "*/app/*" -o -name "requirements.txt"
# Result: Only Prisma seed scripts ✅

# No FastAPI imports in application
grep -r "fastapi" frontend/src/
# Result: No matches ✅
```

### Confirm Prisma Architecture
```bash
# Prisma schema exists
ls -la frontend/prisma/schema.prisma
# Result: 979 lines, 38 models ✅

# API routes use Prisma
grep -r "PrismaClient" frontend/src/app/api/
# Result: Multiple matches in all API routes ✅
```

---

## ✅ Conclusion

**The FastAPI backend was intentionally removed in v1.18.0 as part of a successful architecture migration to Next.js-only.**

- **No technical debt** - Application works correctly
- **Documentation debt** - Extensive obsolete references need cleanup
- **Action required** - Update/delete obsolete documentation and scripts

This is a **documentation cleanup task**, not a broken application issue.
