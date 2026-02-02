# LDC Construction Tools - Feature Backlog

**Purpose**: Feature requests and new functionality for future development  
**Updated**: 2025-09-24

## 💭 IDEAS & CONCEPTS

### 🎨 User Experience Enhancements

#### FEAT-009: Dark mode for admin interface
- **Module**: UI/UX Global
- **Priority**: Low
- **Description**: Add dark mode toggle for all admin interfaces with system preference detection
- **Business Value**: Better user experience for extended use, reduced eye strain, modern appearance
- **User Story**: As an admin user, I want to switch to dark mode so that I can work comfortably in low-light environments
- **Status**: 💭 IDEA
- **Effort**: L
- **Requested**: 2025-09-24

#### FEAT-010: Advanced search and filtering
- **Module**: User Management (/admin/users)
- **Priority**: Medium
- **Description**: Add advanced search with multiple filters (role, region, status, date ranges)
- **Business Value**: Faster user lookup, better data management for large user bases
- **User Story**: As an admin, I want to search users by multiple criteria so that I can quickly find specific users
- **Status**: 💭 IDEA
- **Effort**: M
- **Requested**: 2025-09-24

### 📊 Analytics & Reporting

#### FEAT-011: Admin dashboard with charts and metrics
- **Module**: Admin Dashboard (/admin)
- **Priority**: Medium
- **Description**: Add interactive charts showing user growth, activity metrics, system usage
- **Business Value**: Better insights into system usage, data-driven decision making
- **User Story**: As an admin, I want to see system metrics at a glance so that I can monitor growth and usage patterns
- **Status**: 💭 IDEA
- **Effort**: L
- **Requested**: 2025-09-24

#### FEAT-012: Automated reporting system
- **Module**: Reporting Engine (New)
- **Priority**: Low
- **Description**: Generate and email weekly/monthly reports to administrators
- **Business Value**: Automated insights, reduced manual reporting work
- **User Story**: As a system administrator, I want automated reports so that I stay informed without manual work
- **Status**: 💭 IDEA
- **Effort**: XL
- **Requested**: 2025-09-24

### 🔐 Security & Access Control

#### FEAT-013: Two-factor authentication (2FA)
- **Module**: Authentication System
- **Priority**: High
- **Description**: Add 2FA support with TOTP (Google Authenticator, Authy) for admin accounts
- **Business Value**: Enhanced security for administrative functions, compliance requirements
- **User Story**: As an admin, I want 2FA protection so that my account is secure even if password is compromised
- **Status**: 💭 IDEA
- **Effort**: L
- **Requested**: 2025-09-24

#### FEAT-014: Role-based permissions matrix
- **Module**: User Management (/admin/users)
- **Priority**: Medium
- **Description**: Granular permissions system allowing custom role creation and permission assignment
- **Business Value**: Fine-grained access control, better security, flexible role management
- **User Story**: As a super admin, I want to create custom roles with specific permissions so that I can control access precisely
- **Status**: 💭 IDEA
- **Effort**: XL
- **Requested**: 2025-09-24

### 📱 Mobile & Accessibility

#### FEAT-015: Progressive Web App (PWA) support
- **Module**: Frontend Infrastructure
- **Priority**: Low
- **Description**: Add PWA manifest, service worker, offline capability for admin functions
- **Business Value**: Mobile app-like experience, offline access, better mobile performance
- **User Story**: As a mobile admin user, I want app-like experience so that I can manage users efficiently on mobile
- **Status**: 💭 IDEA
- **Effort**: M
- **Requested**: 2025-09-24

#### FEAT-016: Accessibility compliance (WCAG 2.1)
- **Module**: UI/UX Global
- **Priority**: Medium
- **Description**: Ensure all admin interfaces meet WCAG 2.1 AA standards
- **Business Value**: Legal compliance, inclusive design, better usability for all users
- **User Story**: As a user with accessibility needs, I want compliant interfaces so that I can use all admin functions
- **Status**: 💭 IDEA
- **Effort**: L
- **Requested**: 2025-09-24

### 🔧 Workflow Automation

#### FEAT-017: Crew Request Auto-Assignment
- **Module**: Crew Request System
- **Priority**: Medium
- **Description**: Automatically perform crew/project assignments when crew requests are marked complete, instead of just tracking/notifying
- **Business Value**: Reduces manual work, ensures assignments are actually made, single source of truth for crew/project membership
- **User Story**: As a Personnel Contact, I want crew requests to automatically make the assignments so that I don't have to manually update crew membership and project rosters after submitting requests
- **Status**: 💭 IDEA
- **Effort**: XL
- **Requested**: 2025-12-23
- **Technical Details**:
  - When request marked "COMPLETED", perform actual assignment:
    - `ADD_TO_CREW` → Add volunteer to crew membership table
    - `ADD_TO_PROJECT_ROSTER` → Add volunteer to project roster
    - `ADD_TO_CREW_AND_PROJECT` → Do both
    - `REMOVE_FROM_CREW` → Remove volunteer from crew
  - Requires crew membership and project roster database tables
  - Need duplicate assignment detection/prevention
  - Consider hybrid approach: create pending assignments for review before taking effect
- **Dependencies**: 
  - Crew membership data model
  - Project roster data model
  - May need integration with Builder Assistant (ba.jw.org) if that's the source of truth

## 📋 PLANNED

*Features approved for future sprints will be moved here*

## ✅ COMPLETED

*Completed features will be moved here from active development*

---

## 📋 QUICK ADD TEMPLATE

```markdown
## FEAT-XXX: [Title]
- **Module**: 
- **Priority**: High/Medium/Low
- **Description**: 
- **Business Value**: 
- **User Story**: As a [user], I want [goal] so that [benefit]
- **Status**: 💭 IDEA
- **Effort**: S/M/L/XL
- **Requested**: 2025-09-24
```

**Total Feature Requests**: 9  
**Priority Distribution**: 1 High, 5 Medium, 3 Low  
**Effort Distribution**: 0 Small, 3 Medium, 3 Large, 3 Extra Large
