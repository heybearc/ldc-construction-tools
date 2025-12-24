# LDC Construction Tools v1.14.0 Release Notes

**Release Date:** December 24, 2025  
**Type:** Major Feature Release

## 🎉 Major Features

### Organizational Role Management System
Complete implementation of multi-role organizational structure with trade team and crew integration.

## ✨ New Features

### 1. **Phone Number Formatting**
- Real-time phone number formatting as user types
- Standard US format: (XXX) XXX-XXXX
- Applied to all volunteer phone input fields

### 2. **Multi-Role Assignment System**
- Volunteers can now have multiple organizational roles
- Primary role designation with visual indicators (★)
- Real-time role updates in volunteer modal
- "Make Primary" button to change primary role without re-assignment

### 3. **Trade Team/Crew Role Integration**
- Automatic team/crew selection when assigning Trade Team or Trade Crew roles
- Cascading dropdowns (Trade Team → Trade Crew)
- Automatic volunteer assignment to selected team/crew
- Role cards display actual team/crew names (e.g., "Exterior doors" instead of "CREW")

### 4. **Enhanced Volunteers List**
- New "Trade Team/Crew" column showing assignments
- Displays team name for trade team roles
- Displays team + crew name for crew roles
- Improved visual organization

### 5. **Dashboard Integration**
- Crew detail pages now display volunteers with organizational roles
- Trade team dashboard uses organizational roles for counting
- Accurate member counts and TCO (Trade Crew Overseer) requirements
- Proper filtering by role codes (TCO, TCOA, TTO, TTOA, etc.)

## 🔧 Technical Improvements

### Database Schema
- Added `tradeTeamId` and `crewId` fields to `VolunteerRole` table
- Proper foreign key relations to TradeTeam and Crew tables
- Bidirectional relations for efficient querying

### API Enhancements
- Volunteers API includes roles with team/crew IDs
- Trade teams API uses organizational roles for counting
- All endpoints properly return role data with relations

### UI/UX Improvements
- Real-time updates when roles assigned/removed
- Modal remains open after role operations
- Immediate visual feedback for all role changes
- Form data synchronization prevents data loss

## 🐛 Bug Fixes

- Fixed issue where clicking "Save Changes" would overwrite team/crew assignments
- Fixed crew detail pages not displaying volunteers with organizational roles
- Fixed trade team dashboard showing incorrect member counts
- Fixed "crews needing TCO" count using legacy flags instead of organizational roles
- Fixed role cards reverting to generic labels instead of specific team/crew names
- Fixed database column naming mismatch (camelCase vs snake_case)

## 📊 System Integration

### Complete Workflow
1. ✅ Assign organizational role with team/crew selection
2. ✅ Role card displays actual team/crew name
3. ✅ Volunteers list shows team/crew assignment
4. ✅ Crew detail page displays volunteer in oversight section
5. ✅ Trade team dashboard shows accurate counts
6. ✅ Primary role management without re-assignment

## 🔄 Migration Notes

**Database Changes:**
- New columns added to `volunteer_roles` table: `tradeTeamId`, `crewId`
- Foreign key constraints added for data integrity
- Indexes added for performance optimization

**Breaking Changes:**
- Dashboard now uses organizational roles instead of legacy `isOverseer`/`isAssistant` flags
- Crew detail pages filter by role codes instead of legacy `role` field

## 📝 Notes

This release completes the transition from single-role to multi-role organizational structure. The system now supports:
- 192 distinct role positions across all organizational levels
- Multiple simultaneous role assignments per volunteer
- Hierarchical role structure (CG → Trade Team → Trade Crew)
- Flexible role management with primary designation

## 🚀 Deployment

Tested and deployed to STANDBY environment (https://green.ldctools.com).
Ready for production deployment.

---

**Full Changelog:** See commit history for detailed changes.
