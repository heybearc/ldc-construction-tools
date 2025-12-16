# Changelog

All notable changes to LDC Tools will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2024-12-16

### Added
- **Feedback System**
  - User feedback submission page
  - Admin feedback management page
  - Feedback API routes for submission and management
  - Prisma models: Feedback, FeedbackAttachment, FeedbackComment
  - Feedback link in footer on all pages
  - Feedback Management in Admin Control Center sidebar

- **Comprehensive Help Center Documentation**
  - Trade Teams help page with crew and member management guides
  - Projects help page with status overview and team assignments
  - Volunteers help page with search, import/export instructions
  - Admin Panel help page covering all admin modules
  - Troubleshooting help page with common issues and solutions
  - FAQ sections on all help pages

- **Redesigned Admin Dashboard**
  - Overview stats cards (Users, Feedback, System Health)
  - Recent Activity section with audit log preview
  - Admin Modules navigation grid
  - Environment indicator for GREEN/BLUE/PRODUCTION
  - Removed redundant CSV import and role management (moved to proper locations)

- **User Auto-Activation**
  - Users automatically activated on first successful login
  - INVITED users can now log in (only INACTIVE users blocked)
  - emailVerified timestamp set on first login

### Changed
- Help Center now shows all topics to all users (removed role filtering)
- Added Send Feedback button to Help Center footer section
- User status now computed from emailVerified field for consistency
- Admin can change user status which properly updates emailVerified

### Fixed
- Help topics not displaying for users with non-standard roles
- User Management "Invited" filter not showing users
- Admin unable to change user status to Active
- Status display inconsistency between stats and user list

## [1.1.0] - 2025-12-15

### Added
- **Real Audit Logging System**
  - AuditLog Prisma model for database storage
  - Audit utility functions (`frontend/src/lib/audit.ts`)
  - Audit logs API endpoint (`/api/v1/admin/audit/logs`)
  - Integration with NextAuth signIn/signOut events
  - User management actions logged (update, delete)

- **Data Protection with TrueNAS Backups**
  - Backup API endpoints (`/api/v1/admin/backup` and `/api/v1/admin/backup/info`)
  - Backup script on database server (`/usr/local/bin/backup-ldc-tools.sh`)
  - Daily automated backups at 2 AM via cron
  - Backups stored at `/mnt/data/ldc-tools-backups/database/automated/`
  - Rolling 30-backup retention policy

- **API Auto-Testing**
  - API Status page auto-tests all endpoints on load
  - Client-side testing with pending status indicators

### Changed
- **System Operations Page Redesign**
  - Changed from horizontal grid to vertical list layout
  - Removed old Database Backup operation (replaced by Data Protection)
  - Professional table-like format with status, last run, and actions

- **Admin UI Cleanup**
  - Removed NextAuth v4 tag from admin header
  - Removed Security info box from admin sidebar

### Fixed
- Audit logs API route deployment (was ignored by .gitignore)
- Audit logs fetch missing credentials
- Backup API SSH host key verification
- Backup API admin authentication check

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
