# Changelog

All notable changes to LDC Construction Tools will be documented in this file.

## [1.8.3] - 2025-12-19

### Added
- **Announcements System** - Site-wide and CG-specific announcement management
  - Announcement model with Prisma schema (INFO, WARNING, URGENT types)
  - AnnouncementBanner component with dismissible, type-based styling
  - Admin announcements management page with full CRUD operations
  - API endpoints for announcements (GET, POST, PATCH, DELETE)
  - Date range filtering (optional startDate/endDate)
  - Construction Group scoping (global or CG-specific)
  - Role targeting (show announcements to specific user roles)
  - Active/inactive toggle for announcements
  - Integration into main layout (displays on all pages)
  - Admin navigation menu updated with Announcements link

### Technical Details
- Database: Added Announcement model with relations to User and ConstructionGroup
- API: `/api/v1/announcements` (user-facing), `/api/v1/admin/announcements` (admin CRUD)
- Components: `AnnouncementBanner.tsx` with session-based dismissal
- UI: Modal-based admin interface with form validation
- Styling: Type-based color coding (blue/yellow/red)

## [1.8.2] - 2025-12-19

### Added
- User invitation system with email notifications
- Name field in user invitation form for personalized invitations
- Accept invitation page with password setup
- Email password encryption using AES-256 for secure SMTP authentication
- API endpoints for invitation verification and acceptance
- Construction Group project URL configuration in Organization settings

### Fixed
- Email configuration API now supports PUT method for saving settings
- Email password storage using reversible encryption instead of bcrypt
- Invitation email domain configuration (NEXTAUTH_URL)
- Construction Group detail page GET endpoint
- Missing AlertCircle import in Construction Group page
- Prisma role validation error in crew requests page

### Changed
- Moved "Submit Crew Request" link from footer to main navigation
- Updated email invitation template with professional design
- Invitation tokens now expire after 7 days

### Security
- Implemented proper email password encryption/decryption
- Added invitation token expiration validation
- Secure password hashing for new user accounts

## [1.8.1] - Previous Release
- Trade team and crew management
- Volunteer management system
- Email configuration interface
- Construction Group organizational structure
