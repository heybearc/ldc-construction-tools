# LDC Construction Tools - Bug Backlog

**Purpose**: Non-critical bugs for future resolution  
**Updated**: 2025-09-24

## 📝 ACTIVE BACKLOG

### 📱 Mobile & Responsive Issues

#### BUG-008: User table sorting not responsive on mobile
- **Module**: User Management (/admin/users)
- **Severity**: Low
- **Description**: Table column sorting doesn't work properly on mobile devices
- **Impact**: Mobile users can't sort user lists efficiently
- **Workaround**: Use desktop browser or search/filter instead
- **Status**: 📝 BACKLOG
- **Effort**: M
- **Found**: 2025-09-24

#### BUG-009: Admin navigation menu overlaps on small screens
- **Module**: Admin Layout (/admin/*)
- **Severity**: Low
- **Description**: Navigation menu overlaps content on screens smaller than 768px
- **Impact**: Poor mobile user experience for admin functions
- **Workaround**: Use landscape mode or desktop
- **Status**: 📝 BACKLOG
- **Effort**: S
- **Found**: 2025-09-24

### 🎨 UI/UX Issues

#### BUG-010: Loading states inconsistent across modules
- **Module**: Multiple Admin Modules
- **Severity**: Low
- **Description**: Some modules show spinners, others show skeleton loaders, some show nothing
- **Impact**: Inconsistent user experience, looks unprofessional
- **Workaround**: None needed, cosmetic issue
- **Status**: 📝 BACKLOG
- **Effort**: M
- **Found**: 2025-09-24

#### BUG-011: Form validation messages not styled consistently
- **Module**: User Management, Email Configuration
- **Severity**: Low
- **Description**: Error messages use different colors, fonts, and positioning
- **Impact**: Inconsistent user experience
- **Workaround**: None needed, functional but inconsistent
- **Status**: 📝 BACKLOG
- **Effort**: S
- **Found**: 2025-09-24

### 📊 Data & Performance Issues

#### BUG-012: Health monitor auto-refresh causes UI flicker
- **Module**: Health Monitor (/admin/health)
- **Severity**: Medium
- **Description**: 30-second auto-refresh causes visible UI flicker and scroll position reset
- **Impact**: Annoying user experience when monitoring system health
- **Workaround**: Disable auto-refresh manually
- **Status**: 📝 BACKLOG
- **Effort**: M
- **Found**: 2025-09-24

#### BUG-013: Email service monitor shows false healthy status
- **Module**: Health Monitor (/admin/health)
- **Severity**: Medium
- **Description**: Email service monitor always shows "healthy and connected" even when email configuration is not set up or invalid
- **Impact**: Misleading health information, admins can't trust email service status
- **Workaround**: Manually verify email configuration in Email Config module
- **Status**: 📝 BACKLOG
- **Effort**: S
- **Found**: 2025-09-24

### 🔌 API & Integration Issues

#### BUG-014: User Management API shows warning status incorrectly
- **Module**: API Status Monitor (/admin/api)
- **Severity**: Low
- **Description**: User Management API endpoint shows warning status when it should be healthy or error
- **Impact**: Confusing API status information, unclear if there are actual issues
- **Workaround**: Check actual API functionality directly
- **Status**: 📝 BACKLOG
- **Effort**: S
- **Found**: 2025-09-24

#### BUG-015: Email Test API shows error status with mock data
- **Module**: API Status Monitor (/admin/api)
- **Severity**: Low
- **Description**: Email Test API endpoint shows error status even though it's using mock data and should show as "mock" or "development"
- **Impact**: Misleading error status for development environment
- **Workaround**: Ignore error status for development, check actual email test functionality
- **Status**: 📝 BACKLOG
- **Effort**: S
- **Found**: 2025-09-24

## 🔍 INVESTIGATING

*No items currently under investigation*

## ✅ RESOLVED

*Resolved bugs will be moved here from active backlog*

---

## 📋 QUICK ADD TEMPLATE

```markdown
## BUG-XXX: [Title]
- **Module**: 
- **Severity**: Medium/Low
- **Description**: 
- **Impact**: 
- **Workaround**: 
- **Status**: 📝 BACKLOG
- **Effort**: S/M/L/XL
- **Found**: 2025-09-24
```

**Total Backlog Bugs**: 8  
**Effort Distribution**: 5 Small, 3 Medium, 0 Large, 0 Extra Large
