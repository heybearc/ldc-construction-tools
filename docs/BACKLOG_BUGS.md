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

**Total Backlog Bugs**: 5  
**Effort Distribution**: 2 Small, 3 Medium, 0 Large, 0 Extra Large
