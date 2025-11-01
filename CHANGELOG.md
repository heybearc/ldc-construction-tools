# Changelog

All notable changes to LDC Tools will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-01

### 🎉 Major Release: NextAuth v4 Migration

This is the first stable release of LDC Tools with production-ready authentication.

### Added
- **NextAuth v4 Authentication System**
  - Database-backed authentication with Prisma
  - JWT session tokens (24-hour expiry)
  - Secure password hashing with bcrypt
  - Proper session management
  - Login tracking (lastLogin, loginCount)
  
- **Infrastructure Improvements**
  - Blue-Green deployment setup
  - Container naming: `ldctools-blue` (Container 133) and `ldctools-green` (Container 135)
  - MCP server integration for deployment automation
  - Updated SSH shortcuts for new hostnames

### Changed
- **Application Renamed**: "LDC Construction Tools" → "LDC Tools"
  - Updated all UI references
  - Updated package.json and documentation
  - Simplified branding across the application

- **Authentication Overhaul**
  - Replaced custom WMACS authentication with NextAuth v4
  - Removed hardcoded credentials
  - Migrated from custom session cookies to JWT tokens
  - Updated middleware to use NextAuth session tokens

### Removed
- **WMACS Authentication System** (deprecated)
  - Removed `frontend/src/lib/auth.ts` (hardcoded credentials)
  - Removed `frontend/src/app/api/auth/signin/route.ts` (custom signin API)
  - Removed old session cookie management
  - Cleaned up WMACS references in UI

### Security
- ✅ No more hardcoded passwords in source code
- ✅ Database-backed user authentication
- ✅ Bcrypt password hashing (10 rounds)
- ✅ JWT session tokens with secure httpOnly cookies
- ✅ Proper session expiration handling

### Database
- PostgreSQL database: `ldc_tools` on Container 131 (10.92.3.21)
- NextAuth tables: Account, Session, User, VerificationToken
- User table includes role, regionId, zoneId for RBAC

### Deployment
- **BLUE Environment**: https://blue.ldctools.cloudigan.net (Container 133)
- **GREEN Environment**: https://green.ldctools.cloudigan.net (Container 135)
- Feature branch: `feature/app-rename-and-nextauth-v4`

### Migration Notes
- Existing users must use database credentials (no more hardcoded auth)
- Default admin user: `admin@ldctools.local`
- Sessions from old WMACS auth will be invalidated
- Users need to log in again after upgrade

---

## [0.1.0] - 2025-10-27

### Initial Development Release
- Basic application structure
- WMACS authentication (deprecated)
- Trade teams management
- Role management system
- Admin control panel
- Volunteer management
- Project management

---

## Version History

- **v1.0.0** (2025-11-01) - NextAuth v4 Migration & Production Ready
- **v0.1.0** (2025-10-27) - Initial Development Release
