# LDC Construction Tools - Master Roadmap v2.0

**Version**: 2.0  
**Date**: December 16, 2025  
**Current Version**: v1.2.0  
**Status**: Architecture Phase

---

## 📊 Current State Summary (v1.2.0)

### ✅ Completed - Admin/Infrastructure (90%)

| Module | Status | Notes |
|--------|--------|-------|
| Authentication | ✅ Complete | NextAuth.js, JWT, password auth |
| User Management | ✅ Complete | CRUD, invites, bulk import, status workflow |
| Email Configuration | ✅ Complete | Gmail App Password, templates |
| Health Monitor | ✅ Complete | System metrics, uptime |
| API Status | ✅ Complete | Endpoint monitoring |
| Audit Logs | ✅ Complete | Full activity trail |
| System Operations | ✅ Complete | Backup, maintenance |
| Feedback System | ✅ Complete | Bug reports, feature requests |
| Help Center | ✅ Complete | 9 help pages |
| Admin Dashboard | ✅ Complete | Overview, stats, navigation |

### ⚠️ Partially Implemented - Core Features

| Feature | Status | Notes |
|---------|--------|-------|
| Trade Teams | ⚠️ Basic | Model exists, UI needs work |
| Crews | ⚠️ Basic | Model exists, UI needs work |
| Projects | ⚠️ Basic | Model exists, UI placeholder |
| Volunteers | ⚠️ Basic | UI exists, needs enhancement |
| Calendar | ⚠️ Placeholder | Basic page only |

### ❌ Not Implemented

| Feature | Priority | Notes |
|---------|----------|-------|
| Multi-Tenant (Zone/Region/CG) | 🔴 HIGH | Architecture defined |
| Real Data Import | 🔴 HIGH | Blocked by multi-tenant |
| Cross-CG Staffing | 🟡 MEDIUM | For large projects |
| Reporting/Analytics | 🟡 MEDIUM | Dashboard metrics |
| PWA/Offline | 🟢 LOW | Future enhancement |
| Document Management | 🟢 LOW | File uploads |

---

## 🗺️ Development Phases

### 🔴 Phase 1: Multi-Tenant Foundation (v1.3.0)
**Timeline**: 2-3 weeks  
**Priority**: CRITICAL - Blocks all future work

#### 1.1 Database Schema
- [ ] Add `Branch` model
- [ ] Add `Zone` model  
- [ ] Add `Region` model
- [ ] Add `ConstructionGroup` model
- [ ] Add `constructionGroupId` to User, TradeTeam, Crew, Project
- [ ] Add `ProjectStaffingRequest` model
- [ ] Run Prisma migration

#### 1.2 Seed Data
- [ ] Create US Branch record
- [ ] Create 5 Zone records (01-05)
- [ ] Create initial Region records (at minimum 01.12)
- [ ] Create default Construction Group for Region 01.12
- [ ] Migrate existing users/data to default CG

#### 1.3 API Scoping
- [ ] Implement `getCGScope()` utility
- [ ] Implement `withCGFilter()` Prisma helper
- [ ] Update `/api/v1/admin/users` with CG scoping
- [ ] Update `/api/v1/trade-teams` with CG scoping
- [ ] Update `/api/v1/projects` with CG scoping
- [ ] Update all other data APIs with scoping

#### 1.4 UI Context
- [ ] Create `CGContext` provider
- [ ] Add CG selector to admin header (SUPER_ADMIN only)
- [ ] Display current CG in UI
- [ ] Update User Management for CG assignment

#### 1.5 Admin: Zone/Region Management
- [ ] Create `/admin/zones` page
- [ ] Create `/admin/regions` page  
- [ ] Create `/admin/construction-groups` page
- [ ] Add navigation to admin sidebar

**Deliverables**: 
- Data isolation working between Construction Groups
- SUPER_ADMIN can switch between CGs
- Zone Overseers see all CGs in their zone
- Regular users see only their CG data

---

### 🟡 Phase 2: Core Feature Completion (v1.4.0)
**Timeline**: 3-4 weeks  
**Priority**: HIGH - Core app functionality

#### 2.1 Trade Teams Module
- [ ] Trade Team list with search/filter
- [ ] Trade Team create/edit forms
- [ ] Trade Team detail page
- [ ] Assign users to Trade Teams
- [ ] Trade Team status management

#### 2.2 Crews Module
- [ ] Crew list within Trade Teams
- [ ] Crew create/edit forms
- [ ] Crew member management
- [ ] Crew status (Active/Inactive/Pending)

#### 2.3 Projects Module
- [ ] Project list with filters (status, priority)
- [ ] Project create/edit wizard
- [ ] Project detail page
- [ ] Project status workflow
- [ ] Assign Trade Teams to Projects
- [ ] Project timeline/dates

#### 2.4 Volunteers/Personnel Module
- [ ] Enhanced volunteer list
- [ ] Volunteer profile pages
- [ ] Skills/certifications tracking
- [ ] Availability management
- [ ] Contact information

#### 2.5 Real Data Import
- [ ] CSV import for volunteers
- [ ] CSV import for Trade Teams/Crews
- [ ] Data validation and error handling
- [ ] Import history/audit

**Deliverables**:
- Full CRUD for Trade Teams, Crews, Projects
- Personnel management working
- Real CG data imported and usable

---

### 🟢 Phase 3: Advanced Features (v1.5.0)
**Timeline**: 2-3 weeks  
**Priority**: MEDIUM - Enhanced functionality

#### 3.1 Cross-CG Staffing
- [ ] Staffing request creation UI
- [ ] Staffing request approval workflow
- [ ] Notifications for requests
- [ ] Request history and tracking

#### 3.2 Reporting Dashboard
- [ ] Personnel metrics by Trade/Crew
- [ ] Project status overview
- [ ] Volunteer availability reports
- [ ] Export reports to CSV/PDF

#### 3.3 Calendar Integration
- [ ] Project timeline calendar view
- [ ] Assignment scheduling
- [ ] Availability calendar

#### 3.4 Notifications
- [ ] Email notifications for assignments
- [ ] Email notifications for staffing requests
- [ ] In-app notification center

**Deliverables**:
- Cross-CG collaboration working
- Management reporting available
- Calendar-based scheduling

---

### 🔵 Phase 4: Polish & Scale (v2.0.0)
**Timeline**: 2-3 weeks  
**Priority**: LOW - Production hardening

#### 4.1 Performance
- [ ] Database indexing optimization
- [ ] API response caching
- [ ] Query optimization for large datasets

#### 4.2 PWA/Offline
- [ ] Service worker implementation
- [ ] Offline data caching
- [ ] Push notifications

#### 4.3 Document Management
- [ ] File upload system
- [ ] Document categories
- [ ] Document sharing

#### 4.4 Advanced Admin
- [ ] Bulk operations across CGs
- [ ] Advanced audit reporting
- [ ] System configuration management

**Deliverables**:
- Production-ready for 60+ Construction Groups
- Offline capability for field use
- Document storage and sharing

---

## 📅 Timeline Overview

```
Dec 2025     Jan 2026     Feb 2026     Mar 2026
|------------|------------|------------|
  Phase 1      Phase 2      Phase 3      Phase 4
  Multi-      Core         Advanced     Polish
  Tenant      Features     Features     & Scale
  
  v1.3.0      v1.4.0       v1.5.0       v2.0.0
```

---

## 🎯 Success Metrics

### Phase 1 Success Criteria
- [ ] Data isolation verified between CGs
- [ ] SUPER_ADMIN can view/switch all CGs
- [ ] Zone Overseer sees correct zone data
- [ ] Regular users see only their CG
- [ ] No data leakage between CGs

### Phase 2 Success Criteria
- [ ] Trade Teams fully manageable
- [ ] Projects can be created and tracked
- [ ] Real personnel data imported
- [ ] Users can be assigned to teams/projects

### Phase 3 Success Criteria
- [ ] Cross-CG staffing requests working
- [ ] Reports exportable
- [ ] Calendar shows project timelines
- [ ] Email notifications sending

### Phase 4 Success Criteria
- [ ] System handles 60+ CGs performantly
- [ ] Offline mode functional
- [ ] Documents uploadable and shareable

---

## 🚨 Blockers & Dependencies

| Blocker | Blocks | Resolution |
|---------|--------|------------|
| Multi-tenant schema | All Phase 2+ work | Complete Phase 1 first |
| Real data format | Data import | Get sample CSV from CG |
| Cross-CG permissions | Staffing requests | Define approval workflow |

---

## 📝 Notes

### Why Multi-Tenant First?
Without proper data isolation, we cannot:
- Import real data (would be visible to wrong users)
- Test with multiple CGs
- Scale beyond single CG deployment

### Trade Team Flexibility
Currently CG-specific. Future enhancement could add:
- Regional Trade Teams (shared across CGs in region)
- Zone Trade Teams (shared across zone)
- Branch Trade Teams (disaster relief)

### Disaster Relief Scaling
`ProjectStaffingRequest` model supports:
- CG-to-CG requests (normal projects)
- Zone-wide requests (large projects)
- Branch-wide requests (disaster relief)

---

**Next Action**: Begin Phase 1.1 - Database Schema Updates
