# Phase 2: Enhanced Multi-Tenant Features - Implementation Plan

**Duration**: 2-3 weeks  
**Priority**: HIGH  
**Dependencies**: Phase 1 deployed to production  
**Status**: 📋 PLANNING

---

## 🎯 Phase 2 Overview

Extend the multi-tenant architecture with zone-level access, CG management tools, user assignment workflows, and comprehensive audit logging for multi-tenant operations.

---

## 📦 Feature Breakdown

### **2.1 Zone-Level Access for ZONE_OVERSEER** 
**Duration**: 3-4 days  
**Priority**: HIGH  
**Complexity**: Medium

#### What It Does
- ZONE_OVERSEER users can view data from all Construction Groups within their assigned zone
- Similar to SUPER_ADMIN's "All CGs" view, but scoped to a single zone
- Zone selector dropdown for users with multiple zone assignments

#### Technical Implementation

**Backend Changes:**
```typescript
// Update getCGScope() in src/lib/cg-scope.ts
// Already has zone-level logic, but needs enhancement:

export async function getCGScope(): Promise<CGScope | null> {
  // ... existing code ...
  
  // For ZONE_OVERSEER, if they have a zone filter cookie, use it
  if (role === 'ZONE_OVERSEER' || role === 'ZONE_OVERSEER_ASSISTANT') {
    const cookieStore = await cookies();
    const zoneFilter = cookieStore.get('zone_filter');
    
    if (zoneFilter?.value) {
      // Load zone with all its CGs
      const selectedZone = await prisma.zone.findUnique({
        where: { id: zoneFilter.value },
        include: {
          regions: {
            include: {
              constructionGroups: true
            }
          }
        }
      });
      
      // Return scope with zone context
      return {
        userId: user.id,
        constructionGroupId: null, // View all CGs in zone
        regionId: null,
        zoneId: selectedZone?.id || null,
        branchId: selectedZone?.branchId || null,
        userRole: role,
        canViewAllBranches: false,
        canViewAllZones: false,
        canViewZoneRegions: true,
        canManageCG: true,
      };
    }
  }
  
  // ... rest of existing code ...
}
```

**Frontend Changes:**
```typescript
// Create src/components/ZoneSelector.tsx (similar to CGSelector)
// - Fetch zones for ZONE_OVERSEER user
// - Display zone dropdown with "All My Zones" option
// - Set zone_filter cookie on selection
// - Trigger page reload

// Update ConditionalLayout.tsx
// - Show ZoneSelector for ZONE_OVERSEER users
// - Show CGSelector for SUPER_ADMIN users
// - Conditional rendering based on role
```

**API Changes:**
```typescript
// Create /api/v1/zones/route.ts
// GET - List zones accessible to current user

// Create /api/v1/user/set-zone-filter/route.ts
// POST - Set zone filter cookie for ZONE_OVERSEER
```

**Database Schema:**
No schema changes needed - zone relationships already exist.

#### Testing Checklist
- [ ] ZONE_OVERSEER sees all CGs in their zone
- [ ] Zone selector dropdown appears for ZONE_OVERSEER
- [ ] Zone filter persists across page navigation
- [ ] Data refreshes when zone selection changes
- [ ] Regular users don't see zone selector
- [ ] SUPER_ADMIN still sees CG selector (not zone)

---

### **2.2 Region-Level Access**
**Duration**: 2-3 days  
**Priority**: MEDIUM  
**Complexity**: Low

#### What It Does
- Users with regional roles can view data from all CGs within their assigned region
- Region selector for users with multiple region assignments
- Useful for regional coordinators and field representatives

#### Technical Implementation

**Backend Changes:**
```typescript
// Update getCGScope() to support region-level filtering
// Add REGION_LEVEL_ROLES constant
const REGION_LEVEL_ROLES = [
  'REGION_COORDINATOR',
  'FIELD_REPRESENTATIVE',
  // Add other regional roles as needed
];

// Similar logic to zone filtering but scoped to region
```

**Frontend Changes:**
```typescript
// Create src/components/RegionSelector.tsx
// Similar to ZoneSelector but for regional roles
```

**API Changes:**
```typescript
// Create /api/v1/regions/route.ts
// GET - List regions accessible to current user

// Create /api/v1/user/set-region-filter/route.ts
// POST - Set region filter cookie
```

#### Testing Checklist
- [ ] Regional role users see all CGs in their region
- [ ] Region selector appears for appropriate roles
- [ ] Region filter persists and refreshes data
- [ ] No conflicts with zone or CG selectors

---

### **2.3 Construction Group Management UI**
**Duration**: 4-5 days  
**Priority**: HIGH  
**Complexity**: High

#### What It Does
- SUPER_ADMIN can create, edit, and manage Construction Groups
- View CG hierarchy (Branch → Zone → Region → CG)
- Activate/deactivate CGs
- Manage CG metadata (code, name, description)

#### Technical Implementation

**Database Schema:**
No changes needed - CG model already has all required fields.

**Backend Changes:**
```typescript
// Create /api/v1/admin/construction-groups/route.ts
// GET    - List all CGs with hierarchy
// POST   - Create new CG
// PUT    - Update CG details
// DELETE - Deactivate CG (soft delete)

// Create /api/v1/admin/construction-groups/[id]/route.ts
// GET    - Get single CG with full details
// PATCH  - Update specific CG fields
// DELETE - Deactivate CG
```

**Frontend Changes:**
```typescript
// Create src/app/admin/construction-groups/page.tsx
// - List view with hierarchy tree
// - Search and filter by zone/region
// - Create/Edit modal
// - Activation toggle

// Create src/app/admin/construction-groups/[id]/page.tsx
// - CG detail view
// - Edit form
// - User assignment list
// - Activity history
```

**UI Components:**
```typescript
// src/components/admin/CGHierarchyTree.tsx
// - Visual tree showing Branch → Zone → Region → CG
// - Expandable/collapsible nodes
// - Click to edit

// src/components/admin/CGForm.tsx
// - Create/Edit form with validation
// - Fields: code, name, description, region, isActive
// - Code format validation (e.g., "CG-01.12-001")

// src/components/admin/CGStatusBadge.tsx
// - Active/Inactive status indicator
// - User count badge
// - Quick actions menu
```

#### Testing Checklist
- [ ] SUPER_ADMIN can create new CG
- [ ] CG code validation works (unique, correct format)
- [ ] CG hierarchy displays correctly
- [ ] Edit CG updates all related data
- [ ] Deactivate CG prevents new assignments
- [ ] Search and filter work correctly
- [ ] Only SUPER_ADMIN can access CG management

---

### **2.4 User CG Assignment Interface**
**Duration**: 3-4 days  
**Priority**: HIGH  
**Complexity**: Medium

#### What It Does
- SUPER_ADMIN can assign users to Construction Groups
- Bulk user CG assignment tool
- User transfer between CGs workflow
- CG assignment history tracking

#### Technical Implementation

**Database Schema:**
```prisma
// Add to schema.prisma
model UserCGAssignmentHistory {
  id                    String   @id @default(cuid())
  userId                String
  fromConstructionGroupId String?
  toConstructionGroupId   String
  assignedBy            String
  reason                String?
  effectiveDate         DateTime @default(now())
  createdAt             DateTime @default(now())
  
  user                  User     @relation("UserCGHistory", fields: [userId], references: [id])
  fromCG                ConstructionGroup? @relation("FromCG", fields: [fromConstructionGroupId], references: [id])
  toCG                  ConstructionGroup  @relation("ToCG", fields: [toConstructionGroupId], references: [id])
  assignedByUser        User     @relation("AssignedBy", fields: [assignedBy], references: [id])
  
  @@map("user_cg_assignment_history")
}
```

**Backend Changes:**
```typescript
// Create /api/v1/admin/users/[id]/assign-cg/route.ts
// POST - Assign user to CG with history tracking

// Create /api/v1/admin/users/bulk-assign-cg/route.ts
// POST - Bulk assign multiple users to CG

// Update /api/v1/admin/users/[id]/route.ts
// PATCH - Include CG assignment in user update
```

**Frontend Changes:**
```typescript
// Create src/app/admin/users/[id]/assign-cg/page.tsx
// - User CG assignment form
// - Current CG display
// - CG selector dropdown
// - Reason for transfer field
// - Assignment history timeline

// Create src/app/admin/users/bulk-assign/page.tsx
// - Multi-select user list
// - Target CG selector
// - Bulk assignment reason
// - Preview before confirm
// - Progress indicator

// Update src/app/admin/users/page.tsx
// - Add "Assign CG" bulk action
// - Show current CG in user list
// - Filter by CG
```

**UI Components:**
```typescript
// src/components/admin/CGAssignmentForm.tsx
// - CG selector with search
// - Effective date picker
// - Reason textarea
// - Validation

// src/components/admin/CGAssignmentHistory.tsx
// - Timeline view of CG changes
// - Show who assigned, when, and why
// - Visual indicator of current CG

// src/components/admin/BulkCGAssignmentModal.tsx
// - User selection interface
// - CG selection
// - Confirmation dialog with summary
```

#### Testing Checklist
- [ ] Single user CG assignment works
- [ ] Bulk assignment handles 100+ users
- [ ] Assignment history is tracked
- [ ] User sees new CG data immediately after assignment
- [ ] Volunteers/crews are NOT transferred (only user account)
- [ ] Email notification sent to user (optional)
- [ ] Only SUPER_ADMIN can assign CGs

---

### **2.5 Audit Logging for Multi-Tenant Operations**
**Duration**: 3-4 days  
**Priority**: MEDIUM  
**Complexity**: Medium

#### What It Does
- Log all CG filter changes by SUPER_ADMIN
- Track cross-CG data access
- Log CG assignment changes
- Compliance reporting for data access
- Searchable audit trail

#### Technical Implementation

**Database Schema:**
```prisma
// Add to schema.prisma
model MultiTenantAuditLog {
  id                    String   @id @default(cuid())
  userId                String
  action                String   // CG_FILTER_CHANGE, CG_ASSIGNMENT, CROSS_CG_ACCESS
  resourceType          String   // USER, VOLUNTEER, PROJECT, etc.
  resourceId            String?
  fromConstructionGroupId String?
  toConstructionGroupId   String?
  metadata              Json?    // Additional context
  ipAddress             String?
  userAgent             String?
  timestamp             DateTime @default(now())
  
  user                  User     @relation("AuditUser", fields: [userId], references: [id])
  fromCG                ConstructionGroup? @relation("AuditFromCG", fields: [fromConstructionGroupId], references: [id])
  toCG                  ConstructionGroup? @relation("AuditToCG", fields: [toConstructionGroupId], references: [id])
  
  @@index([userId, timestamp])
  @@index([action, timestamp])
  @@index([resourceType, resourceId])
  @@map("multi_tenant_audit_logs")
}
```

**Backend Changes:**
```typescript
// Create src/lib/audit-logger.ts
export async function logMultiTenantAction(params: {
  userId: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  fromCGId?: string;
  toCGId?: string;
  metadata?: any;
  request?: NextRequest;
}) {
  await prisma.multiTenantAuditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      fromConstructionGroupId: params.fromCGId,
      toConstructionGroupId: params.toCGId,
      metadata: params.metadata,
      ipAddress: params.request?.headers.get('x-forwarded-for') || 
                 params.request?.headers.get('x-real-ip'),
      userAgent: params.request?.headers.get('user-agent'),
    }
  });
}

// Update /api/v1/user/set-cg-filter/route.ts
// Add audit logging when SUPER_ADMIN changes CG filter

// Update /api/v1/admin/users/[id]/assign-cg/route.ts
// Add audit logging for CG assignments

// Update getCGScope() to log when SUPER_ADMIN views different CG
```

**Frontend Changes:**
```typescript
// Create src/app/admin/audit/multi-tenant/page.tsx
// - Audit log viewer for multi-tenant operations
// - Filter by user, action, date range, CG
// - Export to CSV
// - Real-time updates

// Update src/app/admin/audit/page.tsx
// - Add "Multi-Tenant" tab
// - Link to detailed multi-tenant audit view
```

**UI Components:**
```typescript
// src/components/admin/MultiTenantAuditTable.tsx
// - Paginated table of audit logs
// - Color-coded by action type
// - Expandable rows for metadata
// - Quick filters

// src/components/admin/AuditLogExport.tsx
// - Date range selector
// - Export format options (CSV, Excel, PDF)
// - Filter options before export
```

#### Testing Checklist
- [ ] CG filter changes are logged
- [ ] CG assignments are logged with history
- [ ] Cross-CG data access is tracked
- [ ] Audit logs are searchable and filterable
- [ ] Export functionality works
- [ ] Performance is acceptable (< 500ms queries)
- [ ] Audit logs cannot be deleted (append-only)

---

## 🗓️ Implementation Timeline

### Week 1: Zone/Region Access + CG Management UI
- **Days 1-2**: Zone-level access implementation
- **Days 3-4**: Region-level access implementation
- **Day 5**: CG Management UI (Part 1 - List view)

### Week 2: CG Management + User Assignment
- **Days 1-2**: CG Management UI (Part 2 - Create/Edit)
- **Days 3-4**: User CG Assignment Interface
- **Day 5**: Bulk assignment tool

### Week 3: Audit Logging + Testing
- **Days 1-2**: Audit logging implementation
- **Days 3-4**: Integration testing all features
- **Day 5**: Bug fixes and polish

---

## 🔄 Dependencies

### Phase 1 Must Be Complete
- ✅ CG filtering in all APIs
- ✅ getCGScope() utility
- ✅ withCGFilter() utility
- ✅ CG selector for SUPER_ADMIN

### Database Requirements
- ✅ Zone, Region, CG models exist
- ⚠️ Need migration for UserCGAssignmentHistory
- ⚠️ Need migration for MultiTenantAuditLog

### Infrastructure Requirements
- ✅ Staging environment (10.92.3.24)
- ✅ Production environment (10.92.3.22)
- ✅ Shared database (10.92.3.21)

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] getCGScope() with zone/region filtering
- [ ] withCGFilter() for zone/region scopes
- [ ] Audit logging functions
- [ ] CG assignment logic

### Integration Tests
- [ ] Zone selector with data filtering
- [ ] CG management CRUD operations
- [ ] User CG assignment workflow
- [ ] Audit log creation and retrieval

### User Acceptance Tests
- [ ] ZONE_OVERSEER can view all CGs in zone
- [ ] SUPER_ADMIN can manage CGs
- [ ] Bulk user assignment works smoothly
- [ ] Audit logs are accurate and complete

### Performance Tests
- [ ] Zone filtering query time < 200ms
- [ ] CG list loads in < 300ms
- [ ] Bulk assignment of 100 users < 5 seconds
- [ ] Audit log queries < 500ms

---

## 📊 Success Metrics

### Functionality Metrics
- 100% of zone/region filtering working
- CG CRUD operations functional
- User assignment workflow complete
- Audit logging 100% coverage

### Performance Metrics
- Zone-level queries < 200ms
- CG management operations < 300ms
- Bulk assignments handle 100+ users
- Audit log queries < 500ms

### User Experience Metrics
- Zone/Region selector intuitive
- CG management UI easy to use
- Bulk assignment saves time
- Audit logs provide clear insights

---

## 🚨 Risks & Mitigations

### Risk 1: Zone/Region Filtering Performance
**Impact**: High  
**Probability**: Medium  
**Mitigation**: 
- Add database indexes on zoneId, regionId
- Implement query result caching
- Use pagination for large result sets

### Risk 2: Bulk Assignment Timeout
**Impact**: Medium  
**Probability**: Low  
**Mitigation**:
- Implement background job processing
- Show progress indicator
- Allow cancellation of in-progress operations

### Risk 3: Audit Log Storage Growth
**Impact**: Medium  
**Probability**: High  
**Mitigation**:
- Implement log rotation policy
- Archive old logs to separate table
- Set up automated cleanup jobs

### Risk 4: Complex Permission Logic
**Impact**: High  
**Probability**: Medium  
**Mitigation**:
- Comprehensive unit tests
- Clear documentation of permission rules
- Staged rollout with monitoring

---

## 📝 Migration Scripts

### Migration 1: UserCGAssignmentHistory Table
```sql
-- Create user CG assignment history table
CREATE TABLE user_cg_assignment_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  from_construction_group_id TEXT,
  to_construction_group_id TEXT NOT NULL,
  assigned_by TEXT NOT NULL,
  reason TEXT,
  effective_date TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (from_construction_group_id) REFERENCES construction_groups(id),
  FOREIGN KEY (to_construction_group_id) REFERENCES construction_groups(id),
  FOREIGN KEY (assigned_by) REFERENCES users(id)
);

CREATE INDEX idx_user_cg_history_user ON user_cg_assignment_history(user_id);
CREATE INDEX idx_user_cg_history_date ON user_cg_assignment_history(effective_date);
```

### Migration 2: MultiTenantAuditLog Table
```sql
-- Create multi-tenant audit log table
CREATE TABLE multi_tenant_audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  from_construction_group_id TEXT,
  to_construction_group_id TEXT,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (from_construction_group_id) REFERENCES construction_groups(id),
  FOREIGN KEY (to_construction_group_id) REFERENCES construction_groups(id)
);

CREATE INDEX idx_audit_user_timestamp ON multi_tenant_audit_logs(user_id, timestamp);
CREATE INDEX idx_audit_action_timestamp ON multi_tenant_audit_logs(action, timestamp);
CREATE INDEX idx_audit_resource ON multi_tenant_audit_logs(resource_type, resource_id);
```

---

## 🎯 Definition of Done

Phase 2 is complete when:
- [ ] All 5 features implemented and tested
- [ ] Database migrations run successfully
- [ ] Unit tests pass (>80% coverage)
- [ ] Integration tests pass
- [ ] Performance metrics met
- [ ] Deployed to STANDBY and verified
- [ ] User acceptance testing complete
- [ ] Documentation updated
- [ ] Ready for production deployment

---

**Next Steps**: Review this plan, confirm priorities, and begin Week 1 implementation.
