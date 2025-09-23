# LDC CONSTRUCTION TOOLS - IMMUTABLE INFRASTRUCTURE SPECIFICATION

**⚠️ CRITICAL: This configuration is IMMUTABLE and must be the single source of truth**
**Any changes to container assignments MUST be updated here first to prevent credit waste**

## DEFINITIVE CONTAINER ASSIGNMENTS

### LDC Construction Tools (THIS PROJECT)
```
STAGING:  Container 135 (10.92.3.25)
PRODUCTION: Container 133 (10.92.3.23) 
DATABASE: Container 131 (10.92.3.21) - PostgreSQL Server
```

### JW Attendant Scheduler (DIFFERENT PROJECT)
```
STAGING:  Container 134 (10.92.3.24)
PRODUCTION: Container 132 (10.92.3.22)
DATABASE: Container 131 (10.92.3.21) - SHARED PostgreSQL Server
```

## DATABASE CONFIGURATION

**PostgreSQL Server**: Container 131 (10.92.3.21:5432)
- **LDC Database**: `ldc_construction_tools`
- **JW Database**: `jw_attendant_scheduler`
- **Status**: ALREADY EXISTS AND CONFIGURED

## CURRENT DEPLOYMENT STATUS

### Staging Environment (Container 135 - 10.92.3.25)
- ✅ **DEPLOYED AND FUNCTIONAL**
- ✅ **Next.js application running on port 3001**
- ✅ **Connected to PostgreSQL database**
- ✅ **All tests passing (5/5)**
- ✅ **WMACS system integrated**

### Production Environment (Container 133 - 10.92.3.23)
- ❓ **STATUS UNKNOWN - NEEDS VERIFICATION**
- ❓ **May need deployment or update**

### Database (Container 131 - 10.92.3.21)
- ✅ **PostgreSQL server running**
- ✅ **LDC database exists**
- ✅ **Staging environment connected**
- ❓ **Production connection needs verification**

## BRANCH STATUS
- **Current Branch**: `staging`
- **Last Sync**: WMACS system fully synchronized
- **Next Action**: Verify production environment status

## CRITICAL RULES TO PREVENT CONFUSION

1. **NEVER assume container numbers** - always reference this document
2. **LDC ≠ JW Scheduler** - different projects, different containers
3. **Container 131 is SHARED database** for both projects
4. **Container 134/132 are JW Scheduler** - NOT LDC Construction Tools
5. **Container 135/133 are LDC Construction Tools** - THIS project

## VERIFICATION COMMANDS

```bash
# Check staging (LDC)
curl -s http://10.92.3.25:3001/api/health || echo "Staging down"

# Check production (LDC) 
curl -s http://10.92.3.23:3001/api/health || echo "Production down"

# Check database
ssh root@10.92.3.21 "psql -U postgres -l | grep ldc_construction_tools" || echo "DB check failed"
```

---
**Last Updated**: 2025-09-23 19:56 EDT
**Verified By**: WMACS Smart Sync System
**Status**: IMMUTABLE - DO NOT MODIFY WITHOUT UPDATING ALL REFERENCES
