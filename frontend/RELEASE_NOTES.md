# LDC Construction Tools - Release Notes

## Version 1.10.2 - December 22, 2025

### 🐛 Critical Bug Fixes

#### Admin Console Stability
Fixed multiple critical issues affecting the admin console that were causing errors and infinite render loops:

**Infinite Render Loop Fixes:**
- Fixed infinite re-renders on admin layout by memoizing `adminModules` array
- Fixed infinite re-renders on crew requests page by correcting `useEffect` dependencies
- Fixed infinite re-renders on admin dashboard by wrapping `loadDashboardData` in `useCallback`

**Missing API Endpoints:**
- Created `/api/v1/construction-groups` endpoint for announcements page
- Fixes 404 errors when creating or editing announcements

**Database Schema:**
- Implemented missing `CrewChangeRequest` model with full relations
- Added support for crew request functionality mentioned in previous release notes

**Navigation:**
- Restored "Submit Crew Request" and "Manage Requests" links to main navigation menu

### 🔧 Infrastructure Improvements

**Backup System:**
- Configured SSH keys between frontend containers and database server
- Backup functionality now operational with NFS share access
- System Operations page backup features fully functional
- Added graceful error handling for SSH connection failures

**Benefits:**
- Admin console now stable and error-free
- All admin pages load without infinite loops
- Crew request functionality fully operational
- Backup and restore features working properly
- Improved system reliability and performance

---

## Version 1.8.3 - December 19, 2025

### 🎉 What's New

#### Announcements System
Stay informed with our new announcements feature! Administrators can now post important updates, warnings, and urgent notices that appear at the top of every page.

**How it works:**
- **Color-coded alerts:** Info (blue), Warning (yellow), Urgent (red)
- **Dismissible banners:** Click the X to hide announcements you've seen
- **Smart targeting:** Announcements can be shown to everyone, specific Construction Groups, or specific user roles
- **Scheduled display:** Set start and end dates for time-sensitive announcements

**For Administrators:**
1. Go to **Admin → Announcements**
2. Click "New Announcement"
3. Choose the type (Info, Warning, or Urgent)
4. Write your message
5. Optionally target specific Construction Groups or roles
6. Set display dates if needed
7. Click "Create Announcement"

**Benefits:**
- Keep everyone informed about important updates
- Highlight urgent matters with red alerts
- Schedule announcements in advance
- Target specific groups or roles
- Easy to manage and update

### 🔧 Improvements
- Enhanced admin panel with announcements management
- Improved navigation with announcements link
- Better user communication system

---

## Version 1.8.2 - December 19, 2025

### What's New

#### 🎉 User Invitations
You can now invite new users to LDC Tools directly from the Admin panel! 

**How it works:**
1. Go to Admin → Users
2. Click "Invite User"
3. Enter their name, email, and role
4. They'll receive a personalized invitation email
5. They click the link and set their password
6. They're ready to use LDC Tools!

**Benefits:**
- No more manual account setup
- Personalized welcome emails
- Secure password creation by the user
- Invitation links expire after 7 days for security

#### �� Improvements
- **Easier Navigation:** The "Submit Crew Request" link has moved to the main menu for quicker access
- **Better Organization Settings:** You can now configure your Construction Group's Builder Assistant project link directly in the Organization settings

### Bug Fixes
- Fixed an issue where the Construction Group detail page wouldn't load
- Resolved email configuration saving problems
- Fixed crew request page errors when filtering personnel

### Security Enhancements
- Improved email password security
- Invitation links now expire automatically
- Secure password requirements for new users

---

## Need Help?

Visit the **Help Center** in the application menu or contact your system administrator.

## Technical Notes

For developers and system administrators, detailed technical changes are documented in CHANGELOG.md.
