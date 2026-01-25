# Phase 2 Implementation Guide
## Multi-Tenant Architecture Enhancements

**Version**: 1.0  
**Date**: December 30, 2024  
**Status**: ✅ Complete - Deployed to STANDBY  
**Branch**: `feature/phase-2-cg-management-audit`

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Phase 2.1: Organization Hierarchy Enhancements](#phase-21-organization-hierarchy-enhancements)
3. [Phase 2.2: User-Volunteer CG Synchronization](#phase-22-user-volunteer-cg-synchronization)
4. [Phase 2.3: Multi-Tenant Audit Logging](#phase-23-multi-tenant-audit-logging)
5. [Database Migrations](#database-migrations)
6. [API Reference](#api-reference)
7. [Testing Guide](#testing-guide)
8. [Deployment Instructions](#deployment-instructions)
9. [Troubleshooting](#troubleshooting)

---

## Overview

Phase 2 enhances the LDC Construction Tools multi-tenant architecture with three major improvements:

1. **Organization Hierarchy Management** - Full CRUD operations for Construction Groups
2. **User-Volunteer Synchronization** - Automatic CG derivation from volunteer records
3. **Multi-Tenant Audit Logging** - Comprehensive tracking of all multi-tenant operations

### Key Benefits

- ✅ **Simplified User Management** - CG automatically derived from volunteer records
- ✅ **Data Integrity** - Single source of truth for organizational context
- ✅ **Compliance** - Complete audit trail for all multi-tenant operations
- ✅ **Flexibility** - Edit/delete/reactivate Construction Groups as needed
- ✅ **Security** - SUPER_ADMIN only access with IP tracking

---

## Phase 2.1: Organization Hierarchy Enhancements

### Features Implemented

#### 1. Edit Construction Group Modal

**Location**: `/admin/organization`  
**Access**: SUPER_ADMIN only

**Functionality**:
- Edit CG code, name, description, region assignment
- Real-time validation of code uniqueness
- Region dropdown with zone/branch context
- Success/error feedback

**Implementation Files**:
- `src/components/EditCGModal.tsx` - Modal component
- `src/app/api/v1/admin/hierarchy/construction-groups/[id]/route.ts` - PATCH endpoint

**Usage**:
```typescript
// Open edit modal
const handleEditCG = (cg: ConstructionGroup) => {
  setSelectedCG(cg);
  setModalType('edit');
  setModalMode('cg');
};
```

#### 2. Delete Construction Group Modal

**Location**: `/admin/organization`  
**Access**: SUPER_ADMIN only

**Functionality**:
- Soft delete (sets `isActive = false`)
- Dependency checking (users, volunteers, trade teams, projects)
- Prevents deletion if active dependencies exist
- Shows dependency counts in modal

**Implementation Files**:
- `src/components/DeleteCGModal.tsx` - Modal component
- `src/app/api/v1/admin/hierarchy/construction-groups/[id]/route.ts` - DELETE endpoint

**Dependency Validation**:
```typescript
const hasActiveDependencies = 
  existingCG._count.users > 0 ||
  existingCG._count.volunteers > 0 ||
  existingCG._count.tradeTeams > 0 ||
  existingCG._count.projects > 0;
```

#### 3. Construction Group Reactivation

**Functionality**:
- Automatically reactivates soft-deleted CGs when recreating with same code
- Restores all associated trade teams and crews
- Adds any missing standard trade teams
- Maintains data integrity

**Implementation**:
```typescript
// Check if CG exists but is inactive
if (existing && !existing.isActive) {
  // Reactivate CG
  constructionGroup = await prisma.constructionGroup.update({
    where: { id: existing.id },
    data: { isActive: true }
  });
  
  // Reactivate trade teams and crews
  await prisma.tradeTeam.updateMany({
    where: { constructionGroupId: existing.id },
    data: { isActive: true }
  });
}
```

### UI Changes

**Organization Page** (`/admin/organization`):
- Added Edit and Delete buttons next to each CG
- Buttons only visible to SUPER_ADMIN users
- Replaced CG links with container div for button placement
- Added modal state management

**Before**:
```tsx
<Link href={`/construction-groups/${cg.id}`}>
  {cg.code} - {cg.name}
</Link>
```

**After**:
```tsx
<div className="flex items-center justify-between">
  <span>{cg.code} - {cg.name}</span>
  {canManageCG && (
    <div className="flex gap-2">
      <button onClick={() => handleEditCG(cg)}>Edit</button>
      <button onClick={() => handleDeleteCG(cg)}>Delete</button>
    </div>
  )}
</div>
```

---

## Phase 2.2: User-Volunteer CG Synchronization

### Problem Statement

Previously, users had redundant `regionId` and `zoneId` fields that could become out of sync with their linked volunteer's Construction Group. This created data integrity issues and maintenance overhead.

### Solution

Make the volunteer record the **single source of truth** for a user's organizational context.

### Schema Changes

**User Model** (`prisma/schema.prisma`):
```prisma
model User {
  id                    String    @id @default(cuid())
  email                 String    @unique
  name                  String?
  role                  String?
  volunteerId           String?   @unique
  constructionGroupId   String?   // Fallback for break-glass accounts
  // REMOVED: regionId, zoneId
  
  volunteer             Volunteer? @relation(fields: [volunteerId], references: [id])
  constructionGroup     ConstructionGroup? @relation(fields: [constructionGroupId], references: [id])
}
```

**UserInvitation Model**:
```prisma
model UserInvitation {
  id                    String    @id @default(cuid())
  email                 String
  firstName             String
  lastName              String
  role                  String
  // REMOVED: regionId, zoneId
}
```

### Database Migration

**Migration**: `20241230_phase2_2_remove_user_region_zone`

```sql
-- Sync constructionGroupId from volunteer to user
UPDATE "users" u
SET "constructionGroupId" = v."constructionGroupId"
FROM "volunteers" v
WHERE u."volunteerId" = v.id
  AND u."volunteerId" IS NOT NULL
  AND v."constructionGroupId" IS NOT NULL;

-- Drop redundant columns
ALTER TABLE "users" DROP COLUMN IF EXISTS "regionId";
ALTER TABLE "users" DROP COLUMN IF EXISTS "zoneId";
ALTER TABLE "user_invitations" DROP COLUMN IF EXISTS "regionId";
ALTER TABLE "user_invitations" DROP COLUMN IF EXISTS "zoneId";
```

### getCGScope() Update

**Location**: `src/lib/cg-scope.ts`

**Before**:
```typescript
const user = await prisma.user.findUnique({
  where: { id: session.user.id },
  include: { constructionGroup: { include: { region: { include: { zone: true } } } } }
});
```

**After**:
```typescript
const user = await prisma.user.findUnique({
  where: { id: session.user.id },
  include: {
    volunteer: {
      include: {
        constructionGroup: {
          include: { region: { include: { zone: true } } }
        }
      }
    },
    constructionGroup: {
      include: { region: { include: { zone: true } } }
    }
  }
});

// Derive CG from volunteer (preferred) or direct assignment (fallback)
const effectiveCG = user.volunteer?.constructionGroup || user.constructionGroup;
```

### API Updates

#### User Creation API

**Endpoint**: `POST /api/v1/admin/users`

**Changes**:
- Accepts `volunteerId` in request body
- Derives `constructionGroupId` from volunteer
- Falls back to admin's CG for break-glass accounts

```typescript
let constructionGroupId = null;
if (volunteerId) {
  const volunteer = await prisma.volunteer.findUnique({
    where: { id: volunteerId },
    select: { constructionGroupId: true }
  });
  constructionGroupId = volunteer.constructionGroupId;
} else {
  const cgScope = await getCGScope();
  constructionGroupId = cgScope?.constructionGroupId || null;
}
```

#### User List API

**Endpoint**: `GET /api/v1/admin/users`

**Changes**:
- Removed `regionId` and `zoneId` from select clause
- Added `volunteer.constructionGroup` to query
- Derives `regionId` and `zoneId` from effective CG for backward compatibility

```typescript
const transformedUsers = users.map(user => {
  const effectiveCG = user.volunteer?.constructionGroup || user.constructionGroup;
  
  return {
    ...user,
    regionId: effectiveCG?.region?.code || '',
    zoneId: effectiveCG?.region?.zone?.code || '',
    constructionGroupId: effectiveCG?.id || null
  };
});
```

### Backward Compatibility

**API Responses**: Still include `regionId` and `zoneId` derived from the effective CG to maintain compatibility with existing frontend code.

**Break-Glass Accounts**: SUPER_ADMIN users without a volunteer link can still have a direct `constructionGroupId` assignment.

---

## Phase 2.3: Multi-Tenant Audit Logging

### Overview

Comprehensive audit logging system that tracks all multi-tenant operations and Construction Group management actions for compliance and security.

### Schema Enhancements

**AuditLog Model** (`prisma/schema.prisma`):
```prisma
model AuditLog {
  id                        String              @id @default(cuid())
  userId                    String?
  action                    String
  resource                  String
  resourceId                String?
  oldValues                 Json?
  newValues                 Json?
  ipAddress                 String?
  userAgent                 String?
  timestamp                 DateTime            @default(now())
  
  // Multi-tenant fields (NEW)
  fromConstructionGroupId   String?
  toConstructionGroupId     String?
  metadata                  Json?
  
  // Relations
  user                      User?               @relation(fields: [userId], references: [id])
  fromConstructionGroup     ConstructionGroup?  @relation("AuditLogFromCG", fields: [fromConstructionGroupId], references: [id])
  toConstructionGroup       ConstructionGroup?  @relation("AuditLogToCG", fields: [toConstructionGroupId], references: [id])

  // Performance indexes
  @@index([userId, timestamp])
  @@index([action, timestamp])
  @@index([resource, resourceId])
  @@index([fromConstructionGroupId, toConstructionGroupId])
  @@map("audit_logs")
}
```

### Database Migration

**Migration**: `20241230_phase2_3_multi_tenant_audit_logs`

```sql
-- Add multi-tenant fields
ALTER TABLE "audit_logs" ADD COLUMN "fromConstructionGroupId" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN "toConstructionGroupId" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN "metadata" JSONB;

-- Add foreign key constraints
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_fromConstructionGroupId_fkey" 
  FOREIGN KEY ("fromConstructionGroupId") REFERENCES "construction_groups"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_toConstructionGroupId_fkey" 
  FOREIGN KEY ("toConstructionGroupId") REFERENCES "construction_groups"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Create performance indexes
CREATE INDEX "audit_logs_userId_timestamp_idx" ON "audit_logs"("userId", "timestamp");
CREATE INDEX "audit_logs_action_timestamp_idx" ON "audit_logs"("action", "timestamp");
CREATE INDEX "audit_logs_resource_resourceId_idx" ON "audit_logs"("resource", "resourceId");
CREATE INDEX "audit_logs_fromConstructionGroupId_toConstructionGroupId_idx" 
  ON "audit_logs"("fromConstructionGroupId", "toConstructionGroupId");
```

### Audit Logger Utility

**Location**: `src/lib/audit-logger.ts`

**Core Function**:
```typescript
export async function logAuditEvent(params: AuditLogParams): Promise<void> {
  try {
    const { userId, action, resource, resourceId, fromCGId, toCGId, 
            oldValues, newValues, metadata, request } = params;

    // Extract IP and user agent from request
    const ipAddress = request?.headers.get('x-forwarded-for')?.split(',')[0].trim() 
                   || request?.headers.get('x-real-ip') || null;
    const userAgent = request?.headers.get('user-agent') || null;

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId, action, resource, resourceId,
        fromConstructionGroupId: fromCGId || null,
        toConstructionGroupId: toCGId || null,
        oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : null,
        newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : null,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
        ipAddress, userAgent
      }
    });
  } catch (error) {
    // Log error but don't throw - audit logging should not break operations
    console.error('[AUDIT ERROR] Failed to log audit event:', error);
  }
}
```

### Audit Actions

**Tracked Actions**:
```typescript
export type AuditAction = 
  | 'CG_FILTER_CHANGE'        // SUPER_ADMIN changes CG filter
  | 'USER_CG_ASSIGNMENT'      // User's CG changed via volunteer link
  | 'CROSS_CG_ACCESS'         // User accesses different CG data
  | 'CG_CREATED'              // New Construction Group created
  | 'CG_UPDATED'              // CG details modified
  | 'CG_DELETED'              // CG deactivated (soft delete)
  | 'CG_REACTIVATED'          // Previously deleted CG reactivated
  | 'VOLUNTEER_CG_TRANSFER'   // Volunteer moved between CGs
  | 'USER_CREATED'            // New user created
  | 'USER_UPDATED'            // User details modified
  | 'USER_DELETED'            // User deleted
  | 'VOLUNTEER_CREATED'       // New volunteer created
  | 'VOLUNTEER_UPDATED'       // Volunteer details modified
  | 'VOLUNTEER_DELETED';      // Volunteer deleted
```

### Specialized Logging Functions

**CG Filter Change**:
```typescript
await logCGFilterChange(
  userId: string,
  fromCGId: string | null,
  toCGId: string | null,
  request?: NextRequest
);
```

**CG Created**:
```typescript
await logCGCreated(
  userId: string,
  cgId: string,
  cgCode: string,
  cgName: string,
  regionId: string,
  request?: NextRequest
);
```

**CG Updated**:
```typescript
await logCGUpdated(
  userId: string,
  cgId: string,
  oldValues: any,
  newValues: any,
  request?: NextRequest
);
```

**CG Deleted**:
```typescript
await logCGDeleted(
  userId: string,
  cgId: string,
  cgCode: string,
  cgName: string,
  request?: NextRequest
);
```

### API Integration

**APIs with Audit Logging**:

1. **CG Filter API** (`/api/v1/user/set-cg-filter`)
   - Logs when SUPER_ADMIN changes CG filter
   - Captures from/to CG IDs

2. **CG Creation API** (`/api/v1/admin/hierarchy/construction-groups`)
   - Logs new CG creation
   - Logs CG reactivation

3. **CG Update API** (`/api/v1/admin/hierarchy/construction-groups/[id]`)
   - Logs CG modifications
   - Captures old and new values

4. **CG Delete API** (`/api/v1/admin/hierarchy/construction-groups/[id]`)
   - Logs CG deactivation
   - Records soft delete action

### Audit Log Viewer UI

**Location**: `/admin/audit/multi-tenant`  
**Access**: SUPER_ADMIN only

**Features**:
- Paginated table (50 logs per page)
- Advanced filtering:
  - Filter by action type
  - Filter by resource type
  - Filter by date range (start/end)
  - Filter by Construction Group
- Expandable rows for detailed view
- Shows timestamp, user, action, resource, CG changes
- Displays IP address and user agent
- Shows metadata, old values, new values in JSON format
- Real-time refresh capability
- CSV export with current filters

**UI Components**:
```tsx
// Filter controls
<select value={filters.action} onChange={...}>
  <option value="">All Actions</option>
  <option value="CG_FILTER_CHANGE">CG Filter Change</option>
  <option value="CG_CREATED">CG Created</option>
  ...
</select>

// Date range filters
<input type="date" value={filters.startDate} onChange={...} />
<input type="date" value={filters.endDate} onChange={...} />

// Apply/Reset buttons
<button onClick={handleApplyFilters}>Apply Filters</button>
<button onClick={handleResetFilters}>Reset</button>

// Export button
<button onClick={handleExport}>Export CSV</button>
```

### CSV Export

**Endpoint**: `GET /api/v1/admin/audit/multi-tenant/export`

**Features**:
- Exports all logs matching current filters
- No pagination limit
- Generates timestamped CSV files
- Includes all audit log fields

**CSV Columns**:
- Timestamp
- User Name
- User Email
- User Role
- Action
- Resource
- Resource ID
- From CG Code
- From CG Name
- To CG Code
- To CG Name
- IP Address
- User Agent
- Metadata (JSON)

**Implementation**:
```typescript
const headers = [
  'Timestamp', 'User Name', 'User Email', 'User Role',
  'Action', 'Resource', 'Resource ID',
  'From CG Code', 'From CG Name', 'To CG Code', 'To CG Name',
  'IP Address', 'User Agent', 'Metadata'
];

const csvRows = [headers.join(',')];
for (const log of logs) {
  const row = [
    log.timestamp.toISOString(),
    `"${log.user?.name || 'Unknown'}"`,
    `"${log.user?.email || 'Unknown'}"`,
    log.user?.role || 'Unknown',
    log.action,
    log.resource,
    log.resourceId || '',
    log.fromConstructionGroup?.code || '',
    `"${log.fromConstructionGroup?.name || ''}"`,
    log.toConstructionGroup?.code || '',
    `"${log.toConstructionGroup?.name || ''}"`,
    log.ipAddress || '',
    `"${log.userAgent || ''}"`,
    log.metadata ? `"${JSON.stringify(log.metadata).replace(/"/g, '""')}"` : ''
  ];
  csvRows.push(row.join(','));
}

const csv = csvRows.join('\n');
const filename = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
```

---

## Database Migrations

### Migration Order

1. **Phase 2.2**: `20241230_phase2_2_remove_user_region_zone`
   - Sync user CGs from volunteers
   - Remove redundant regionId/zoneId columns

2. **Phase 2.3**: `20241230_phase2_3_multi_tenant_audit_logs`
   - Add multi-tenant fields to audit_logs
   - Create foreign key constraints
   - Create performance indexes

### Running Migrations

**Development**:
```bash
cd frontend
npx prisma migrate dev --name <migration_name>
npx prisma generate
```

**Production**:
```bash
cd frontend
npx prisma migrate deploy
npx prisma generate
npm run build
pm2 restart ldc-tools-blue
```

### Rollback Strategy

**Phase 2.2 Rollback**:
```sql
-- Add back columns
ALTER TABLE "users" ADD COLUMN "regionId" TEXT;
ALTER TABLE "users" ADD COLUMN "zoneId" TEXT;
ALTER TABLE "user_invitations" ADD COLUMN "regionId" TEXT;
ALTER TABLE "user_invitations" ADD COLUMN "zoneId" TEXT;

-- Restore data from constructionGroup
UPDATE "users" u
SET "regionId" = cg."regionId"
FROM "construction_groups" cg
WHERE u."constructionGroupId" = cg.id;
```

**Phase 2.3 Rollback**:
```sql
-- Drop indexes
DROP INDEX IF EXISTS "audit_logs_userId_timestamp_idx";
DROP INDEX IF EXISTS "audit_logs_action_timestamp_idx";
DROP INDEX IF EXISTS "audit_logs_resource_resourceId_idx";
DROP INDEX IF EXISTS "audit_logs_fromConstructionGroupId_toConstructionGroupId_idx";

-- Drop constraints
ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "audit_logs_fromConstructionGroupId_fkey";
ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "audit_logs_toConstructionGroupId_fkey";

-- Drop columns
ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "fromConstructionGroupId";
ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "toConstructionGroupId";
ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "metadata";
```

---

## API Reference

### Construction Group Management

#### List Construction Groups
```
GET /api/v1/admin/hierarchy/construction-groups
```

**Response**:
```json
{
  "constructionGroups": [
    {
      "id": "cuid",
      "code": "01.12",
      "name": "Construction Group Name",
      "regionId": "region_id",
      "isActive": true
    }
  ]
}
```

#### Create Construction Group
```
POST /api/v1/admin/hierarchy/construction-groups
```

**Request Body**:
```json
{
  "code": "01.12",
  "name": "Construction Group Name",
  "regionId": "region_id",
  "description": "Optional description"
}
```

**Response**:
```json
{
  "constructionGroup": { ... },
  "message": "Created with 8 trade teams and 16 crews"
}
```

#### Update Construction Group
```
PATCH /api/v1/admin/hierarchy/construction-groups/[id]
```

**Request Body**:
```json
{
  "code": "01.12",
  "name": "Updated Name",
  "regionId": "region_id",
  "description": "Updated description"
}
```

#### Delete Construction Group
```
DELETE /api/v1/admin/hierarchy/construction-groups/[id]
```

**Response** (Success):
```json
{
  "message": "Construction Group deactivated successfully",
  "constructionGroup": { ... }
}
```

**Response** (Has Dependencies):
```json
{
  "error": "Cannot delete Construction Group with active dependencies",
  "details": {
    "users": 5,
    "volunteers": 12,
    "tradeTeams": 8,
    "projects": 3
  },
  "message": "Please reassign or remove all users, volunteers, trade teams, and projects before deleting this Construction Group."
}
```

### Audit Log Management

#### List Audit Logs
```
GET /api/v1/admin/audit/multi-tenant
```

**Query Parameters**:
- `userId` (optional) - Filter by user ID
- `action` (optional) - Filter by action type
- `resource` (optional) - Filter by resource type
- `constructionGroupId` (optional) - Filter by CG (from or to)
- `startDate` (optional) - Filter by start date (ISO 8601)
- `endDate` (optional) - Filter by end date (ISO 8601)
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 50) - Logs per page

**Response**:
```json
{
  "logs": [
    {
      "id": "cuid",
      "userId": "user_id",
      "action": "CG_CREATED",
      "resource": "CONSTRUCTION_GROUP",
      "resourceId": "cg_id",
      "fromConstructionGroupId": null,
      "toConstructionGroupId": "cg_id",
      "oldValues": null,
      "newValues": { "code": "01.12", "name": "CG Name" },
      "metadata": { "description": "Created Construction Group: 01.12 - CG Name" },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2024-12-30T22:00:00.000Z",
      "user": {
        "id": "user_id",
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "SUPER_ADMIN"
      },
      "fromConstructionGroup": null,
      "toConstructionGroup": {
        "id": "cg_id",
        "code": "01.12",
        "name": "CG Name"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

#### Export Audit Logs
```
GET /api/v1/admin/audit/multi-tenant/export
```

**Query Parameters**: Same as list endpoint (except page/limit)

**Response**: CSV file download with filename `audit-logs-YYYY-MM-DD.csv`

### User Management

#### Create User
```
POST /api/v1/admin/users
```

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password",
  "role": "PERSONNEL_CONTACT",
  "volunteerId": "volunteer_id"  // Optional - derives CG from volunteer
}
```

**Response**:
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "PERSONNEL_CONTACT",
    "status": "ACTIVE",
    "volunteerId": "volunteer_id",
    "constructionGroupId": "cg_id",  // Auto-derived from volunteer
    "createdAt": "2024-12-30T22:00:00.000Z"
  }
}
```

---

## Testing Guide

### Test Environment

**STANDBY Server**:
- URL: http://10.92.3.23:3001
- Database: PostgreSQL (shared with production)
- Branch: `feature/phase-2-cg-management-audit`

### Test Scenarios

#### 1. Construction Group Management

**Test CG Edit**:
1. Login as SUPER_ADMIN
2. Navigate to Admin → Organization
3. Find a Construction Group
4. Click "Edit" button
5. Modify code, name, or description
6. Click "Save Changes"
7. Verify changes appear in the list
8. Check audit log for `CG_UPDATED` action

**Test CG Delete (with dependencies)**:
1. Navigate to Admin → Organization
2. Find a CG with active volunteers/users
3. Click "Delete" button
4. Verify error message shows dependency counts
5. Confirm deletion is prevented

**Test CG Delete (without dependencies)**:
1. Create a new test CG
2. Immediately delete it (no dependencies)
3. Verify soft delete succeeds
4. Check audit log for `CG_DELETED` action
5. Verify CG no longer appears in active list

**Test CG Reactivation**:
1. Delete a CG (soft delete)
2. Create a new CG with the same code
3. Verify system reactivates the existing CG
4. Verify trade teams and crews are restored
5. Check audit log for `CG_REACTIVATED` action

#### 2. User-Volunteer CG Synchronization

**Test User Creation with Volunteer**:
1. Navigate to Admin → Users
2. Click "Add User"
3. Select a volunteer from dropdown
4. Fill in user details
5. Submit form
6. Verify user's CG matches volunteer's CG
7. Check user details page shows correct CG

**Test User Creation without Volunteer**:
1. Create a user without selecting a volunteer
2. Verify user's CG matches admin's CG (fallback)
3. Confirm user can still access the system

**Test CG Scope Derivation**:
1. Login as a user with a volunteer link
2. Navigate to various pages
3. Verify data is scoped to volunteer's CG
4. Check that `getCGScope()` returns correct CG

#### 3. Multi-Tenant Audit Logging

**Test Audit Log Viewer**:
1. Login as SUPER_ADMIN
2. Navigate to Admin → Audit → Multi-Tenant
3. Verify audit logs are displayed
4. Check pagination works (50 per page)
5. Expand a log row to see details
6. Verify IP address and user agent are captured

**Test Audit Log Filtering**:
1. Open audit log viewer
2. Filter by action type (e.g., "CG Created")
3. Click "Apply Filters"
4. Verify only matching logs are shown
5. Filter by date range
6. Verify date filtering works
7. Click "Reset" to clear filters

**Test Audit Log Export**:
1. Apply some filters
2. Click "Export CSV"
3. Verify CSV file downloads
4. Open CSV in Excel/Numbers
5. Verify all columns are present
6. Verify data matches filtered view

**Test CG Filter Change Logging**:
1. Login as SUPER_ADMIN
2. Change CG filter in header
3. Navigate to audit log viewer
4. Verify `CG_FILTER_CHANGE` action is logged
5. Check from/to CG IDs are correct

#### 4. Integration Tests

**Test Complete User Workflow**:
1. Create a volunteer in a specific CG
2. Create a user linked to that volunteer
3. Login as the new user
4. Verify data scoping works correctly
5. Check audit log for user creation

**Test CG Lifecycle**:
1. Create a new CG
2. Edit the CG details
3. Delete the CG
4. Recreate with same code (reactivation)
5. Verify all actions are logged
6. Export audit logs for the CG

### Performance Testing

**Audit Log Query Performance**:
```sql
-- Test index usage
EXPLAIN ANALYZE
SELECT * FROM audit_logs
WHERE "userId" = 'user_id'
  AND "timestamp" >= '2024-01-01'
ORDER BY "timestamp" DESC
LIMIT 50;

-- Should use: audit_logs_userId_timestamp_idx
```

**CG Scope Query Performance**:
```sql
-- Test volunteer CG derivation
EXPLAIN ANALYZE
SELECT u.*, v."constructionGroupId"
FROM users u
LEFT JOIN volunteers v ON u."volunteerId" = v.id
WHERE u.id = 'user_id';
```

### Security Testing

**Test SUPER_ADMIN Access**:
1. Login as non-SUPER_ADMIN user
2. Try to access `/admin/audit/multi-tenant`
3. Verify redirect to dashboard
4. Try to access CG edit/delete buttons
5. Verify buttons are not visible

**Test Audit Log Immutability**:
1. Verify no DELETE endpoint exists for audit logs
2. Verify no UPDATE endpoint exists for audit logs
3. Confirm logs are append-only

---

## Deployment Instructions

### Pre-Deployment Checklist

- [ ] All Phase 2 features tested on STANDBY
- [ ] Database migrations reviewed
- [ ] Backup of production database created
- [ ] Rollback plan documented
- [ ] Team notified of deployment window
- [ ] Monitoring alerts configured

### Deployment Steps

#### 1. Backup Production Database

```bash
# SSH to database server
ssh root@10.92.3.21

# Create backup
pg_dump -U postgres ldc_tools > /backups/ldc_tools_pre_phase2_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
ls -lh /backups/
```

#### 2. Deploy to STANDBY (Already Complete)

```bash
# SSH to STANDBY server
ssh root@10.92.3.23

# Pull latest code
cd /opt/ldc-tools
git pull origin feature/phase-2-cg-management-audit

# Run migrations and build
cd frontend
npx prisma generate
npx prisma migrate deploy
npm run build

# Restart application
pm2 restart ldc-tools-blue
```

#### 3. Verify STANDBY Deployment

- [ ] Application starts without errors
- [ ] Database migrations applied successfully
- [ ] All Phase 2 features accessible
- [ ] Audit logging working
- [ ] No console errors

#### 4. Deploy to Production

```bash
# SSH to production server
ssh root@10.92.3.22

# Pull latest code
cd /opt/ldc-tools
git checkout main
git pull origin main

# Merge feature branch (if not already merged)
git merge feature/phase-2-cg-management-audit

# Run migrations and build
cd frontend
npx prisma generate
npx prisma migrate deploy
npm run build

# Restart application
pm2 restart ldc-tools-green
```

#### 5. Verify Production Deployment

- [ ] Application starts without errors
- [ ] Database migrations applied successfully
- [ ] Login and test basic functionality
- [ ] Test CG management features
- [ ] Verify audit logging is working
- [ ] Check for any errors in logs

#### 6. Monitor Production

```bash
# Watch application logs
pm2 logs ldc-tools-green

# Check for errors
pm2 logs ldc-tools-green --err

# Monitor database connections
psql -U postgres -d ldc_tools -c "SELECT count(*) FROM pg_stat_activity;"
```

### Post-Deployment Tasks

- [ ] Announce deployment to team
- [ ] Update documentation
- [ ] Monitor error rates for 24 hours
- [ ] Collect user feedback
- [ ] Schedule follow-up review

### Rollback Procedure

If issues are detected:

```bash
# SSH to production server
ssh root@10.92.3.22

# Revert to previous version
cd /opt/ldc-tools
git checkout <previous_commit_hash>

# Rollback database migrations
cd frontend
npx prisma migrate resolve --rolled-back 20241230_phase2_3_multi_tenant_audit_logs
npx prisma migrate resolve --rolled-back 20241230_phase2_2_remove_user_region_zone

# Restore database from backup (if needed)
psql -U postgres ldc_tools < /backups/ldc_tools_pre_phase2_YYYYMMDD_HHMMSS.sql

# Rebuild and restart
npm run build
pm2 restart ldc-tools-green
```

---

## Troubleshooting

### Common Issues

#### Issue: Prisma Client Out of Sync

**Symptoms**:
- TypeScript errors about missing fields
- Runtime errors about unknown columns

**Solution**:
```bash
cd frontend
npx prisma generate
npm run build
pm2 restart ldc-tools-blue
```

#### Issue: Migration Fails

**Symptoms**:
- `prisma migrate deploy` fails
- Database schema out of sync

**Solution**:
```bash
# Check migration status
npx prisma migrate status

# Resolve failed migration
npx prisma migrate resolve --rolled-back <migration_name>

# Re-run migration
npx prisma migrate deploy
```

#### Issue: Audit Logs Not Appearing

**Symptoms**:
- Actions performed but no logs in viewer
- Empty audit log table

**Diagnostics**:
```bash
# Check if audit logs are being created
psql -U postgres -d ldc_tools -c "SELECT count(*) FROM audit_logs;"

# Check for errors in application logs
pm2 logs ldc-tools-blue --err | grep AUDIT
```

**Solution**:
- Verify Prisma client is regenerated
- Check that audit logger functions are being called
- Verify database constraints are not blocking inserts

#### Issue: CG Filter Not Working

**Symptoms**:
- SUPER_ADMIN changes filter but data doesn't update
- Cookie not being set

**Diagnostics**:
```bash
# Check cookie in browser DevTools
# Application → Cookies → cg_filter

# Check API response
curl -X POST http://10.92.3.23:3001/api/v1/user/set-cg-filter \
  -H "Content-Type: application/json" \
  -d '{"constructionGroupId": "cg_id"}'
```

**Solution**:
- Clear browser cookies and cache
- Verify session is valid
- Check that user role is SUPER_ADMIN

#### Issue: User CG Not Derived from Volunteer

**Symptoms**:
- User created with volunteer but CG is null
- User's CG doesn't match volunteer's CG

**Diagnostics**:
```sql
-- Check user and volunteer CGs
SELECT 
  u.id, u.email, u."volunteerId", u."constructionGroupId" as user_cg,
  v.id as volunteer_id, v."constructionGroupId" as volunteer_cg
FROM users u
LEFT JOIN volunteers v ON u."volunteerId" = v.id
WHERE u.email = 'user@example.com';
```

**Solution**:
- Verify volunteer has a valid `constructionGroupId`
- Re-run Phase 2.2 migration to sync CGs
- Update user creation API to properly derive CG

### Error Messages

#### "Cannot delete Construction Group with active dependencies"

**Cause**: CG has users, volunteers, trade teams, or projects

**Solution**: 
1. Reassign or remove all dependencies
2. Or accept that CG cannot be deleted
3. Soft delete will still work (sets isActive = false)

#### "Construction Group code already in use"

**Cause**: Trying to create/update CG with duplicate code

**Solution**:
1. Choose a different code
2. Or delete/deactivate the existing CG first
3. System will auto-reactivate if code matches inactive CG

#### "Insufficient permissions - SUPER_ADMIN required"

**Cause**: Non-SUPER_ADMIN trying to access restricted feature

**Solution**:
1. Login as SUPER_ADMIN
2. Or request SUPER_ADMIN role from administrator
3. Verify session is valid and role is set correctly

### Performance Issues

#### Slow Audit Log Queries

**Symptoms**:
- Audit log viewer takes >5 seconds to load
- Export times out

**Diagnostics**:
```sql
-- Check index usage
EXPLAIN ANALYZE
SELECT * FROM audit_logs
WHERE "action" = 'CG_CREATED'
  AND "timestamp" >= '2024-01-01'
ORDER BY "timestamp" DESC
LIMIT 50;
```

**Solution**:
- Verify indexes are created
- Add more specific filters to queries
- Consider archiving old audit logs (>1 year)

#### Slow CG Scope Queries

**Symptoms**:
- Page loads slowly after login
- `getCGScope()` takes >2 seconds

**Diagnostics**:
```sql
-- Check query plan
EXPLAIN ANALYZE
SELECT u.*, v."constructionGroupId", cg.*
FROM users u
LEFT JOIN volunteers v ON u."volunteerId" = v.id
LEFT JOIN construction_groups cg ON v."constructionGroupId" = cg.id
WHERE u.id = 'user_id';
```

**Solution**:
- Add index on `volunteers.constructionGroupId`
- Consider caching CG scope in session
- Optimize includes in Prisma query

---

## Appendix

### File Structure

```
frontend/
├── prisma/
│   ├── schema.prisma                           # Enhanced with Phase 2 changes
│   └── migrations/
│       ├── 20241230_phase2_2_remove_user_region_zone/
│       │   └── migration.sql
│       └── 20241230_phase2_3_multi_tenant_audit_logs/
│           └── migration.sql
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── audit/
│   │   │   │   └── multi-tenant/
│   │   │   │       └── page.tsx                # Audit log viewer UI
│   │   │   └── organization/
│   │   │       └── page.tsx                    # Updated with Edit/Delete
│   │   └── api/
│   │       └── v1/
│   │           ├── admin/
│   │           │   ├── audit/
│   │           │   │   └── multi-tenant/
│   │           │   │       ├── route.ts        # List audit logs
│   │           │   │       └── export/
│   │           │   │           └── route.ts    # Export to CSV
│   │           │   ├── hierarchy/
│   │           │   │   └── construction-groups/
│   │           │   │       ├── route.ts        # Create CG (with reactivation)
│   │           │   │       └── [id]/
│   │           │   │           └── route.ts    # Update/Delete CG
│   │           │   └── users/
│   │           │       ├── route.ts            # Updated user creation
│   │           │       └── import/
│   │           │           └── route.ts        # Updated bulk import
│   │           └── user/
│   │               └── set-cg-filter/
│   │                   └── route.ts            # Updated with audit logging
│   ├── components/
│   │   ├── EditCGModal.tsx                     # New component
│   │   └── DeleteCGModal.tsx                   # New component
│   └── lib/
│       ├── audit-logger.ts                     # New utility
│       └── cg-scope.ts                         # Updated for volunteer CG
└── docs/
    ├── PHASE_2_REVISED.md                      # Original spec
    └── PHASE_2_IMPLEMENTATION.md               # This document
```

### Database Schema Diagram

```
User
├── id (PK)
├── email
├── name
├── role
├── volunteerId (FK → Volunteer.id)
└── constructionGroupId (FK → ConstructionGroup.id)  // Fallback only

Volunteer
├── id (PK)
├── firstName
├── lastName
├── constructionGroupId (FK → ConstructionGroup.id)  // Source of truth
└── user (Relation → User)

ConstructionGroup
├── id (PK)
├── code (UNIQUE)
├── name
├── regionId (FK → Region.id)
├── isActive
├── users (Relation → User[])
├── volunteers (Relation → Volunteer[])
├── auditLogsFrom (Relation → AuditLog[])
└── auditLogsTo (Relation → AuditLog[])

AuditLog
├── id (PK)
├── userId (FK → User.id)
├── action
├── resource
├── resourceId
├── fromConstructionGroupId (FK → ConstructionGroup.id)
├── toConstructionGroupId (FK → ConstructionGroup.id)
├── oldValues (JSON)
├── newValues (JSON)
├── metadata (JSON)
├── ipAddress
├── userAgent
├── timestamp
├── user (Relation → User)
├── fromConstructionGroup (Relation → ConstructionGroup)
└── toConstructionGroup (Relation → ConstructionGroup)
```

### Glossary

- **CG**: Construction Group - The primary organizational unit for multi-tenancy
- **SUPER_ADMIN**: Highest privilege role with access to all CGs and admin features
- **Soft Delete**: Setting `isActive = false` instead of physically deleting records
- **Break-Glass Account**: SUPER_ADMIN account without volunteer link for emergency access
- **Effective CG**: The Construction Group derived from volunteer or direct assignment
- **Audit Trail**: Complete history of all multi-tenant operations
- **CG Scope**: The set of data a user can access based on their CG assignment

### Related Documentation

- [PHASE_2_REVISED.md](./PHASE_2_REVISED.md) - Original Phase 2 specification
- [ADMIN_MODULE_ROADMAP.md](./ADMIN_MODULE_ROADMAP.md) - Overall admin module plan
- [ROADMAP.md](./ROADMAP.md) - Complete application roadmap

---

**Document Version**: 1.0  
**Last Updated**: December 30, 2024  
**Author**: LDC Construction Tools Development Team  
**Status**: ✅ Complete
