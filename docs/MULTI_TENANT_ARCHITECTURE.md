# LDC Construction Tools - Multi-Tenant Architecture Specification

**Version**: 1.0  
**Date**: December 16, 2025  
**Status**: APPROVED FOR IMPLEMENTATION

---

## 📋 Executive Summary

This document defines the multi-tenant architecture for LDC Construction Tools to support data isolation across the US Branch territory organizational hierarchy: **Branch → Zone → Region → Construction Group**.

---

## 🏗️ Organizational Hierarchy

```
Branch (US Branch Territory)
├── Zone 1
│   ├── Region 01.01 → Construction Group(s)
│   ├── Region 01.02 → Construction Group(s)
│   ├── ...
│   └── Region 01.12 → Construction Group(s) ← Current deployment
├── Zone 2
│   ├── Region 02.01 → Construction Group(s)
│   └── ... (12 regions per zone)
├── Zone 3
├── Zone 4
└── Zone 5
    └── ... (12 regions per zone)

Total: 1 Branch × 5 Zones × 12 Regions = 60 Regions (minimum 60 Construction Groups)
```

---

## 🗄️ Database Schema Design

### New Models

```prisma
// Branch - Top level (future international support)
model Branch {
  id          String   @id @default(cuid())
  code        String   @unique  // "US", "CA", "MX", etc.
  name        String            // "United States Branch"
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  zones       Zone[]
  
  @@map("branches")
}

// Zone - Under Branch (5 in US)
model Zone {
  id          String   @id @default(cuid())
  code        String   @unique  // "01", "02", "03", "04", "05"
  name        String            // "Zone 1"
  branchId    String
  branch      Branch   @relation(fields: [branchId], references: [id])
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  regions     Region[]
  
  @@map("zones")
}

// Region - Under Zone (12 per zone)
model Region {
  id                  String              @id @default(cuid())
  code                String              @unique  // "01.12", "02.05", etc.
  name                String                       // "Region 01.12"
  zoneId              String
  zone                Zone                @relation(fields: [zoneId], references: [id])
  isActive            Boolean             @default(true)
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
  constructionGroups  ConstructionGroup[]
  
  @@map("regions")
}

// Construction Group - Primary data isolation unit
model ConstructionGroup {
  id          String      @id @default(cuid())
  name        String               // "Region 01.12 Construction Group"
  code        String      @unique  // "CG-01.12-001"
  regionId    String
  region      Region      @relation(fields: [regionId], references: [id])
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  // All scoped data
  users       User[]
  tradeTeams  TradeTeam[]
  crews       Crew[]
  projects    Project[]
  
  @@map("construction_groups")
}
```

### Modified Existing Models

```prisma
model User {
  id                   String             @id @default(cuid())
  // ... existing fields ...
  
  // NEW: Primary CG assignment
  constructionGroupId  String?
  constructionGroup    ConstructionGroup? @relation(fields: [constructionGroupId], references: [id])
  
  // DEPRECATED: Will be derived from CG relationship
  // regionId          String  // Remove after migration
  // zoneId            String  // Remove after migration
}

model TradeTeam {
  id                  String            @id @default(cuid())
  // ... existing fields ...
  
  // NEW: CG scope
  constructionGroupId String
  constructionGroup   ConstructionGroup @relation(fields: [constructionGroupId], references: [id])
}

model Crew {
  id                  String            @id @default(cuid())
  // ... existing fields ...
  
  // NEW: CG scope (inherited from TradeTeam but explicit for queries)
  constructionGroupId String
  constructionGroup   ConstructionGroup @relation(fields: [constructionGroupId], references: [id])
}

model Project {
  id                  String            @id @default(cuid())
  // ... existing fields ...
  
  // NEW: Primary CG ownership
  constructionGroupId String
  constructionGroup   ConstructionGroup @relation(fields: [constructionGroupId], references: [id])
  
  // NEW: Cross-CG staffing support
  staffingRequests    ProjectStaffingRequest[]
}

// NEW: Cross-CG staffing for large projects / disaster relief
model ProjectStaffingRequest {
  id                      String            @id @default(cuid())
  projectId               String
  project                 Project           @relation(fields: [projectId], references: [id])
  requestingCGId          String            // CG that owns the project
  targetCGId              String            // CG being asked for help
  requestedRoles          String[]          // Roles/trades needed
  requestedCount          Int               // Number of volunteers needed
  status                  StaffingRequestStatus @default(PENDING)
  requestedBy             String            // User who made request
  respondedBy             String?           // User who approved/declined
  responseNotes           String?
  startDate               DateTime?
  endDate                 DateTime?
  createdAt               DateTime          @default(now())
  updatedAt               DateTime          @updatedAt
  
  @@map("project_staffing_requests")
}

enum StaffingRequestStatus {
  PENDING
  APPROVED
  DECLINED
  COMPLETED
  CANCELLED
}
```

---

## 🔐 Access Control Matrix

### Role-Based Data Visibility

| Role Level | Branch | Zone | Region | CG | Cross-CG |
|------------|--------|------|--------|-----|----------|
| **SUPER_ADMIN** | All | All | All | All | Full access |
| **ZONE_OVERSEER** | Own | Own | All in zone | All in zone | View requests |
| **ZONE_OVERSEER_ASSISTANT** | Own | Own | All in zone | All in zone | View requests |
| **CONSTRUCTION_GROUP_OVERSEER** | Own | Own | Own | Own | Manage requests |
| **PERSONNEL_CONTACT** | Own | Own | Own | Own | Create requests |
| **TRADE_TEAM_OVERSEER** | Own | Own | Own | Own | View own team |
| **READ_ONLY** | Own | Own | Own | Own | None |

### Permission Definitions

```typescript
const PERMISSIONS = {
  // Data scope
  VIEW_ALL_BRANCHES: 'view:branches:all',
  VIEW_ALL_ZONES: 'view:zones:all',
  VIEW_ZONE_REGIONS: 'view:regions:zone',
  VIEW_OWN_CG: 'view:cg:own',
  
  // Cross-CG operations
  CREATE_STAFFING_REQUEST: 'staffing:create',
  APPROVE_STAFFING_REQUEST: 'staffing:approve',
  VIEW_STAFFING_REQUESTS: 'staffing:view',
  
  // Admin operations
  MANAGE_ZONES: 'admin:zones:manage',
  MANAGE_REGIONS: 'admin:regions:manage',
  MANAGE_CGS: 'admin:cgs:manage',
};

const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    'view:branches:all',
    'view:zones:all',
    'view:regions:zone',
    'view:cg:own',
    'staffing:create',
    'staffing:approve',
    'staffing:view',
    'admin:zones:manage',
    'admin:regions:manage',
    'admin:cgs:manage',
  ],
  ZONE_OVERSEER: [
    'view:zones:all',
    'view:regions:zone',
    'staffing:view',
  ],
  CONSTRUCTION_GROUP_OVERSEER: [
    'view:cg:own',
    'staffing:create',
    'staffing:approve',
    'staffing:view',
  ],
  PERSONNEL_CONTACT: [
    'view:cg:own',
    'staffing:create',
    'staffing:view',
  ],
  // ... etc
};
```

---

## 🛠️ API Implementation

### Middleware: CG Scope Injection

```typescript
// src/lib/cg-scope.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export interface CGScope {
  constructionGroupId: string;
  regionId: string;
  zoneId: string;
  branchId: string;
  canViewAllZones: boolean;
  canViewZoneRegions: boolean;
}

export async function getCGScope(): Promise<CGScope | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      constructionGroup: {
        include: {
          region: {
            include: {
              zone: {
                include: { branch: true }
              }
            }
          }
        }
      }
    }
  });
  
  if (!user?.constructionGroup) return null;
  
  const role = user.role;
  const cg = user.constructionGroup;
  
  return {
    constructionGroupId: cg.id,
    regionId: cg.region.id,
    zoneId: cg.region.zone.id,
    branchId: cg.region.zone.branch.id,
    canViewAllZones: ['SUPER_ADMIN'].includes(role),
    canViewZoneRegions: ['SUPER_ADMIN', 'ZONE_OVERSEER', 'ZONE_OVERSEER_ASSISTANT'].includes(role),
  };
}

// Prisma query helper
export function withCGFilter(scope: CGScope, options: { allowCrossZone?: boolean } = {}) {
  if (scope.canViewAllZones) {
    return {}; // No filter for super admin
  }
  
  if (scope.canViewZoneRegions) {
    // Zone-level users see all CGs in their zone
    return {
      constructionGroup: {
        region: {
          zoneId: scope.zoneId
        }
      }
    };
  }
  
  // Default: own CG only
  return {
    constructionGroupId: scope.constructionGroupId
  };
}
```

### Example API Route with Scoping

```typescript
// src/app/api/v1/trade-teams/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCGScope, withCGFilter } from '@/lib/cg-scope';

export async function GET() {
  const scope = await getCGScope();
  if (!scope) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const tradeTeams = await prisma.tradeTeam.findMany({
    where: withCGFilter(scope),
    include: {
      constructionGroup: {
        include: {
          region: true
        }
      },
      crews: true,
    }
  });
  
  return NextResponse.json({ tradeTeams });
}
```

---

## 🖥️ UI Components

### CG Context Provider

```typescript
// src/contexts/CGContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface CGContextType {
  currentCG: ConstructionGroup | null;
  availableCGs: ConstructionGroup[];
  switchCG: (cgId: string) => void;
  canSwitchCG: boolean;
}

const CGContext = createContext<CGContextType | null>(null);

export function CGProvider({ children }: { children: React.ReactNode }) {
  // Implementation for CG switching (SUPER_ADMIN / ZONE_OVERSEER only)
}

export function useCG() {
  const context = useContext(CGContext);
  if (!context) throw new Error('useCG must be used within CGProvider');
  return context;
}
```

### CG Selector Component (Admin Only)

```typescript
// src/components/admin/CGSelector.tsx
'use client';

import { useCG } from '@/contexts/CGContext';

export function CGSelector() {
  const { currentCG, availableCGs, switchCG, canSwitchCG } = useCG();
  
  if (!canSwitchCG) return null;
  
  return (
    <select 
      value={currentCG?.id} 
      onChange={(e) => switchCG(e.target.value)}
      className="..."
    >
      {availableCGs.map(cg => (
        <option key={cg.id} value={cg.id}>
          {cg.region.zone.name} / {cg.region.name} / {cg.name}
        </option>
      ))}
    </select>
  );
}
```

---

## 📊 Migration Strategy

### Phase 1: Schema Addition (Non-Breaking)
1. Add new models: `Branch`, `Zone`, `Region`, `ConstructionGroup`
2. Add `constructionGroupId` to existing models (nullable initially)
3. Run migration

### Phase 2: Data Migration
1. Create default Branch (US)
2. Create 5 Zones
3. Create 60 Regions (or just the ones needed initially)
4. Create default CG for Region 01.12
5. Assign all existing users/data to default CG

### Phase 3: Enforce Scoping
1. Make `constructionGroupId` required on new records
2. Add API middleware for scope filtering
3. Update all API routes to use scoping
4. Remove deprecated `regionId`/`zoneId` string fields from User

### Phase 4: UI Updates
1. Add CG context provider
2. Add CG selector for admins
3. Update all data displays to show CG context
4. Add cross-CG staffing request UI

---

## 🔮 Future Considerations

### Disaster Relief / Branch-Wide Staffing
- `ProjectStaffingRequest` model supports cross-CG volunteer requests
- Can be extended to branch-wide requests for disaster relief
- Status workflow: PENDING → APPROVED → COMPLETED

### International Expansion
- `Branch` model ready for CA, MX, etc.
- Zone/Region structure may vary by branch
- Permissions can be branch-scoped

### Trade Team Sharing (Future)
- Currently CG-specific
- Could add `sharedWithCGs` relation for regional trade teams
- Or create "Regional Trade Team" concept

---

## ✅ Implementation Checklist

- [ ] Create Prisma schema updates
- [ ] Run database migration
- [ ] Create seed data (Branch, Zones, Regions)
- [ ] Migrate existing data to default CG
- [ ] Implement `getCGScope()` utility
- [ ] Implement `withCGFilter()` helper
- [ ] Update all API routes with scoping
- [ ] Create CGContext provider
- [ ] Add CG selector to admin UI
- [ ] Update User Management for CG assignment
- [ ] Add cross-CG staffing request feature
- [ ] Update Help documentation
- [ ] Test data isolation between CGs

---

**This architecture provides complete data isolation while supporting the organizational hierarchy and future scalability needs.**
