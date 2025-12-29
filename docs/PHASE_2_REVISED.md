# Phase 2: CG Management & Audit Logging - REVISED PLAN

**Duration**: 1 week (5-7 days)  
**Priority**: HIGH  
**Dependencies**: Phase 1 deployed to production  
**Status**: 📋 APPROVED - Ready to implement

---

## 🎯 Phase 2 Overview

Streamlined phase focused on CG management tools, user-volunteer CG synchronization, and comprehensive audit logging for multi-tenant operations.

**Key Decisions from Planning:**
- ✅ Regional roles = 1:1 with CG (no separate region selector needed)
- ✅ Zone selector is premature (moved to backlog)
- ✅ CG Management leverages existing Organization Hierarchy page
- ✅ User CG assignment auto-derives from linked volunteer
- ✅ Remove redundant zone/region fields from User model
- ✅ Audit logging is highest value feature

---

## 📦 Feature Breakdown

### **2.1 Organization Hierarchy Enhancements** (2-3 days)
**Priority**: HIGH  
**Complexity**: Medium

#### What It Does
Extend existing `/admin/organization` page with CG edit and delete capabilities.

#### Current State
- ✅ View hierarchy (Branch → Zone → Region → CG)
- ✅ Add Region functionality
- ✅ Add Construction Group functionality
- ✅ Expandable tree view
- ✅ User counts per CG

#### What's Missing
- ❌ Edit existing CG
- ❌ Delete/deactivate CG
- ❌ Enhanced CG metadata editing

#### Technical Implementation

**Backend Changes:**
```typescript
// Update /api/v1/admin/hierarchy/construction-groups/[id]/route.ts
// PATCH - Update CG details (code, name, description, regionId)
// DELETE - Soft delete CG (set isActive = false)

// Validation rules:
// - Cannot delete CG with active users
// - Cannot delete CG with active volunteers
// - Cannot change CG code if already in use
// - Must validate region exists
```

**Frontend Changes:**
```typescript
// Update /app/admin/organization/page.tsx
// Add Edit button to CG items in tree
// Add Delete/Deactivate button with confirmation
// Create EditCGModal component
// Add validation and error handling

// UI Components:
// - EditCGModal.tsx (similar to existing add modal)
// - CGActionMenu.tsx (edit, delete, view details)
// - Confirmation dialog for delete
```

**Database Schema:**
No schema changes needed - CG model already has all fields.

#### Testing Checklist
- [ ] SUPER_ADMIN can edit CG code, name, description
- [ ] Cannot edit CG if it has active users/volunteers (show warning)
- [ ] Can deactivate CG (soft delete)
- [ ] Deactivated CGs don't appear in CG selector
- [ ] Cannot delete CG with dependencies
- [ ] Edit form validates CG code format
- [ ] Changes reflect immediately in hierarchy tree

---

### **2.2 User-Volunteer CG Synchronization** (1-2 days)
**Priority**: HIGH  
**Complexity**: Low

#### What It Does
Automatically derive user's `constructionGroupId` from linked volunteer record, eliminating manual CG assignment and data inconsistency.

#### Current Problem
- User has `zoneId`, `regionId`, and `constructionGroupId` fields
- CG is set from admin's scope at user creation (incorrect)
- Zone/Region are redundant if volunteer is source of truth
- Manual CG assignment creates dual sources of truth

#### Solution
1. **Remove** `zoneId` and `regionId` from User model
2. **Auto-derive** `constructionGroupId` from linked volunteer
3. **Single source of truth**: Volunteer record determines CG

#### Technical Implementation

**Database Migration:**
```prisma
// Remove from User model:
// - zoneId
// - regionId

// Keep:
// - constructionGroupId (auto-derived from volunteer)
// - volunteerId (link to volunteer record)

// Migration steps:
// 1. Create migration to drop zoneId and regionId columns
// 2. Update all user records to sync CG from volunteer
// 3. Set constructionGroupId = null for users without volunteers
```

**Backend Changes:**
```typescript
// Update /api/v1/admin/users/[id]/route.ts
// PATCH endpoint - When volunteerId is updated:

if (volunteerId) {
  // Fetch volunteer's CG
  const volunteer = await prisma.volunteer.findUnique({
    where: { id: volunteerId },
    select: { constructionGroupId: true }
  });
  
  // Auto-set user's CG from volunteer
  updateData.constructionGroupId = volunteer?.constructionGroupId;
}

// Update /api/v1/admin/users/route.ts
// POST endpoint - Remove zoneId/regionId from creation
// Only set constructionGroupId if volunteerId provided at creation
```

**Frontend Changes:**
```typescript
// Update user management forms
// Remove zone/region dropdowns
// Add volunteer search/link interface
// Show CG as read-only (derived from volunteer)
// Display message: "CG is automatically set from linked volunteer"
```

**Special Case: Super Admin Break-Glass Account**
```typescript
// For the single super admin account without volunteer:
// - constructionGroupId = null
// - volunteerId = null
// - role = SUPER_ADMIN
// - Can view all CGs via CG selector
```

#### Testing Checklist
- [ ] Linking volunteer auto-sets user's CG
- [ ] Unlinking volunteer clears user's CG
- [ ] Changing volunteer's CG updates user's CG
- [ ] Super admin account works without volunteer
- [ ] User creation without volunteer sets CG = null
- [ ] User creation with volunteer sets CG from volunteer
- [ ] Migration successfully removes zone/region fields
- [ ] No broken references after migration

---

### **2.3 Multi-Tenant Audit Logging** (3-4 days)
**Priority**: HIGH  
**Complexity**: Medium

#### What It Does
Comprehensive audit trail for all multi-tenant operations including CG filter changes, data access patterns, and CG assignments.

#### Technical Implementation

**Database Schema:**
```prisma
model MultiTenantAuditLog {
  id                      String   @id @default(cuid())
  userId                  String
  action                  String   // CG_FILTER_CHANGE, CG_ASSIGNMENT, CROSS_CG_ACCESS, etc.
  resourceType            String   // USER, VOLUNTEER, PROJECT, etc.
  resourceId              String?
  fromConstructionGroupId String?
  toConstructionGroupId   String?
  metadata                Json?    // Additional context
  ipAddress               String?
  userAgent               String?
  timestamp               DateTime @default(now())
  
  user   User               @relation("AuditUser", fields: [userId], references: [id])
  fromCG ConstructionGroup? @relation("AuditFromCG", fields: [fromConstructionGroupId], references: [id])
  toCG   ConstructionGroup? @relation("AuditToCG", fields: [toConstructionGroupId], references: [id])
  
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
await logMultiTenantAction({
  userId: session.user.id,
  action: 'CG_FILTER_CHANGE',
  fromCGId: currentCG,
  toCGId: newCG,
  request
});

// Update /api/v1/admin/users/[id]/route.ts
// Add audit logging for volunteer linking (which changes CG)
await logMultiTenantAction({
  userId: session.user.id,
  action: 'USER_CG_ASSIGNMENT',
  resourceType: 'USER',
  resourceId: userId,
  fromCGId: oldCG,
  toCGId: newCG,
  metadata: { volunteerId },
  request
});

// Create /api/v1/admin/audit/multi-tenant/route.ts
// GET - List audit logs with filtering
// - Filter by user, action, date range, CG
// - Pagination support
// - Export to CSV
```

**Frontend Changes:**
```typescript
// Create /app/admin/audit/multi-tenant/page.tsx
// - Audit log viewer interface
// - Filter controls (user, action, date range, CG)
// - Paginated table with expandable rows
// - Export to CSV button
// - Real-time updates (optional)

// UI Components:
// - MultiTenantAuditTable.tsx (paginated table)
// - AuditLogFilters.tsx (filter controls)
// - AuditLogExport.tsx (export functionality)
// - AuditLogDetail.tsx (expandable row details)
```

**Audit Actions to Log:**
- `CG_FILTER_CHANGE` - SUPER_ADMIN changes CG filter
- `USER_CG_ASSIGNMENT` - User linked to volunteer (CG changes)
- `CROSS_CG_ACCESS` - User accesses data from different CG
- `CG_CREATED` - New CG created
- `CG_UPDATED` - CG details modified
- `CG_DELETED` - CG deactivated
- `VOLUNTEER_CG_TRANSFER` - Volunteer moved between CGs

#### Testing Checklist
- [ ] CG filter changes are logged
- [ ] User-volunteer linking logs CG assignment
- [ ] Audit logs are searchable by user
- [ ] Audit logs are searchable by action
- [ ] Audit logs are searchable by date range
- [ ] Audit logs are searchable by CG
- [ ] Export to CSV works correctly
- [ ] Audit logs cannot be deleted (append-only)
- [ ] Performance: queries < 500ms
- [ ] IP address and user agent captured
- [ ] Metadata field stores additional context

---

## 🗓️ Implementation Timeline

### **Day 1-2: Organization Hierarchy Enhancements**
- Add Edit CG modal and API endpoint
- Add Delete/Deactivate CG functionality
- Validation and error handling
- Testing

### **Day 3: User-Volunteer CG Sync**
- Create database migration (remove zone/region)
- Update user creation API
- Update user update API (auto-derive CG)
- Update frontend forms
- Testing

### **Day 4-5: Audit Logging (Part 1)**
- Create MultiTenantAuditLog model
- Create audit logging utility
- Add logging to CG filter changes
- Add logging to user-volunteer linking
- Database migration

### **Day 6-7: Audit Logging (Part 2)**
- Create audit log viewer UI
- Add filtering and search
- Add export functionality
- Integration testing
- Bug fixes and polish

---

## 🔄 Dependencies

### Phase 1 Must Be Complete
- ✅ CG filtering in all APIs
- ✅ getCGScope() utility
- ✅ withCGFilter() utility
- ✅ CG selector for SUPER_ADMIN

### Database Requirements
- ✅ Zone, Region, CG models exist
- ⚠️ Need migration to remove User.zoneId and User.regionId
- ⚠️ Need migration for MultiTenantAuditLog table

### Infrastructure Requirements
- ✅ Staging environment (10.92.3.24)
- ✅ Production environment (10.92.3.22)
- ✅ Shared database (10.92.3.21)

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] Auto-derive CG from volunteer logic
- [ ] Audit logging functions
- [ ] CG edit/delete validation

### Integration Tests
- [ ] CG edit workflow
- [ ] User-volunteer linking updates CG
- [ ] Audit log creation and retrieval
- [ ] Export functionality

### User Acceptance Tests
- [ ] SUPER_ADMIN can edit/delete CGs
- [ ] Linking volunteer auto-sets user CG
- [ ] Audit logs provide clear insights
- [ ] Export generates valid CSV

### Performance Tests
- [ ] CG edit operations < 300ms
- [ ] User-volunteer linking < 200ms
- [ ] Audit log queries < 500ms
- [ ] Export handles 1000+ logs

---

## 📊 Success Metrics

### Functionality Metrics
- 100% of CG CRUD operations working
- User CG auto-derives from volunteer
- Audit logging 100% coverage of multi-tenant operations

### Performance Metrics
- CG management operations < 300ms
- User-volunteer linking < 200ms
- Audit log queries < 500ms

### User Experience Metrics
- CG management UI intuitive
- User CG assignment automatic (no manual work)
- Audit logs provide clear compliance trail

---

## 🚨 Risks & Mitigations

### Risk 1: Migration Breaking Existing Users
**Impact**: High  
**Probability**: Low  
**Mitigation**: 
- Test migration on staging first
- Backup database before migration
- Verify all users have valid CG after migration
- Rollback plan if issues occur

### Risk 2: Audit Log Storage Growth
**Impact**: Medium  
**Probability**: High  
**Mitigation**:
- Implement log rotation policy (archive after 1 year)
- Index optimization for fast queries
- Monitor storage usage
- Set up automated cleanup jobs

### Risk 3: Performance Degradation
**Impact**: Medium  
**Probability**: Low  
**Mitigation**:
- Add database indexes on audit log fields
- Implement pagination for large result sets
- Cache frequently accessed data
- Monitor query performance

---

## 📝 Database Migrations

### Migration 1: Remove User Zone/Region Fields
```sql
-- Drop zone and region columns from users table
ALTER TABLE users DROP COLUMN zone_id;
ALTER TABLE users DROP COLUMN region_id;

-- Verify all users have valid CG or are super admin
UPDATE users 
SET construction_group_id = (
  SELECT construction_group_id 
  FROM volunteers 
  WHERE volunteers.id = users.volunteer_id
)
WHERE volunteer_id IS NOT NULL;
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

-- Create indexes for fast queries
CREATE INDEX idx_audit_user_timestamp ON multi_tenant_audit_logs(user_id, timestamp);
CREATE INDEX idx_audit_action_timestamp ON multi_tenant_audit_logs(action, timestamp);
CREATE INDEX idx_audit_resource ON multi_tenant_audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_cg ON multi_tenant_audit_logs(from_construction_group_id, to_construction_group_id);
```

---

## 🎯 Definition of Done

Phase 2 is complete when:
- [ ] All 3 features implemented and tested
- [ ] Database migrations run successfully on staging
- [ ] Unit tests pass (>80% coverage)
- [ ] Integration tests pass
- [ ] Performance metrics met
- [ ] Deployed to STANDBY and verified
- [ ] User acceptance testing complete
- [ ] Documentation updated
- [ ] Ready for production deployment

---

## 📚 Documentation Updates

- [ ] Update ROADMAP.md with Phase 2 completion
- [ ] Update API documentation with new endpoints
- [ ] Create admin guide for CG management
- [ ] Create admin guide for audit log viewer
- [ ] Update user management documentation

---

**Next Steps**: 
1. Review and approve this plan
2. Create feature branch: `feature/phase-2-cg-management-audit`
3. Begin Day 1-2 implementation (Organization Hierarchy Enhancements)
4. Deploy to STANDBY for testing after each feature
5. Production deployment after full Phase 2 testing
