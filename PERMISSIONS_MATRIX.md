# LDC Tools - Permissions Matrix

## Current Issues Identified

1. **Admin menu visible to all users** - No permission check in navigation
2. **PC-Support org role cannot submit crew requests on behalf of others** - Crew request page checks old system role instead of org roles
3. **Mixed permission model** - Some checks use system roles, some use org roles, inconsistent

## System Roles (User.role field)

These are platform-level access roles:

| System Role | Description | Current Usage |
|------------|-------------|---------------|
| `SUPER_ADMIN` | Full system access, can manage everything | Admin pages, user management, system config |
| `ADMIN` | Administrative access, limited system config | Admin pages, some management features |
| `USER` | Standard user, access based on org roles | Default for all volunteers with login |

**Note:** `adminLevel` field also exists (SUPER_ADMIN, ADMIN, READ_ONLY_ADMIN) - currently checked alongside `role`

## Organizational Roles (VolunteerRole records)

These are LDC-specific functional roles:

### CG Oversight
- `CGO` - Construction Group Overseer
- `CGOA` - Construction Group Overseer Assistant
- `CG-Support` - Construction Group Support

### CG Staff
- `CGS` - Construction Group Staff
- `CGS-Support` - Construction Group Staff Support

### Region Support Services
- `PC` - Personnel Contact
- `PCA` - Personnel Contact Assistant
- `PC-Support` - Personnel Contact Support

### Trade Team
- `TTO` - Trade Team Overseer
- `TTOA` - Trade Team Overseer Assistant
- `TT-Support` - Trade Team Support

### Trade Crew
- `TCO` - Trade Crew Overseer
- `TCOA` - Trade Crew Overseer Assistant
- `TC-Support` - Trade Crew Support
- `TCV` - Trade Crew Volunteer

## Proposed Permission Model

### Principle: System Role + Organizational Role = Permissions

**System Role** controls platform access (can they log in, see admin menu)
**Organizational Role** controls functional permissions (what they can do)

## Permission Matrix

### Navigation Menu Access

| Menu Item | System Role Required | Org Role Required | Notes |
|-----------|---------------------|-------------------|-------|
| Dashboard | USER | Any | All logged-in users |
| Trade Teams | USER | Any | View only unless admin |
| Projects | USER | Any | View only unless admin |
| Calendar | USER | Any | All users |
| Volunteers | USER | Any | View only unless admin |
| Congregations | USER | Any | All users |
| Submit Crew Request | USER | Any | All users can submit for themselves |
| Manage Requests | USER | PC, PCA, PC-Support, CGO, CGOA | Personnel contacts and CG oversight |
| **Admin** | **ADMIN or SUPER_ADMIN** | **Any** | **MUST have admin system role** |
| Help | USER | Any | All users |

### Functional Permissions

#### Crew Requests

| Action | System Role | Org Role | Notes |
|--------|-------------|----------|-------|
| Submit for self | USER | Any | All users |
| Submit on behalf of others | USER | PC, PCA, PC-Support, CGO, CGOA, CG-Support | Personnel contacts and CG oversight |
| View all requests | USER | PC, PCA, PC-Support, CGO, CGOA | Personnel contacts and CG oversight |
| Assign requests | USER | PC, PCA, PC-Support | Personnel contacts only |
| Complete requests | USER | PC, PCA, PC-Support, CGO, CGOA | Personnel contacts and CG oversight |
| Delete requests | SUPER_ADMIN | Any | Super admins only |

#### Volunteer Management

| Action | System Role | Org Role | Notes |
|--------|-------------|----------|-------|
| View volunteers | USER | Any | All users |
| Create volunteer | ADMIN or SUPER_ADMIN | Any | Admin system role required |
| Edit volunteer | ADMIN or SUPER_ADMIN | Any | Admin system role required |
| Delete volunteer | SUPER_ADMIN | Any | Super admin only |
| Assign org roles | ADMIN or SUPER_ADMIN | Any | Admin system role required |
| Import volunteers | ADMIN or SUPER_ADMIN | Any | Admin system role required |
| Export volunteers | USER | PC, PCA, PC-Support, CGO, CGOA | Personnel contacts and CG oversight |

#### Trade Team/Crew Management

| Action | System Role | Org Role | Notes |
|--------|-------------|----------|-------|
| View teams/crews | USER | Any | All users |
| Create team/crew | ADMIN or SUPER_ADMIN | Any | Admin system role required |
| Edit team/crew | ADMIN or SUPER_ADMIN | Any | Admin system role required |
| Delete team/crew | SUPER_ADMIN | Any | Super admin only |
| Assign volunteers to crew | USER | TTO, TTOA, TCO, TCOA, PC, PCA, PC-Support | Team/crew overseers and personnel contacts |

#### Project Management

| Action | System Role | Org Role | Notes |
|--------|-------------|----------|-------|
| View projects | USER | Any | All users |
| Create project | ADMIN or SUPER_ADMIN | Any | Admin system role required |
| Edit project | ADMIN or SUPER_ADMIN | Any | Admin system role required |
| Delete project | SUPER_ADMIN | Any | Super admin only |
| Manage project roster | USER | CGO, CGOA, PC, PCA, PC-Support | CG oversight and personnel contacts |

#### Admin Functions

| Action | System Role | Org Role | Notes |
|--------|-------------|----------|-------|
| Access admin menu | ADMIN or SUPER_ADMIN | Any | **Admin system role required** |
| User management | SUPER_ADMIN | Any | Super admin only |
| System configuration | SUPER_ADMIN | Any | Super admin only |
| Announcements | ADMIN or SUPER_ADMIN | Any | Admin system role required |
| View feedback | ADMIN or SUPER_ADMIN | Any | Admin system role required |
| Organizational hierarchy | SUPER_ADMIN | Any | Super admin only |

## Implementation Recommendations

### Option 1: Code-Based Permissions (Recommended for Now)

**Pros:**
- Faster to implement
- No database changes needed
- Clear, auditable code
- Version controlled

**Cons:**
- Requires code changes to modify permissions
- Less flexible

**Implementation:**
1. Create `lib/permissions.ts` with permission check functions
2. Update all pages/components to use permission functions
3. Hide UI elements user doesn't have access to
4. Enforce permissions in API routes

### Option 2: Database-Driven Permissions (Future Enhancement)

**Pros:**
- Flexible - can change without code deployment
- Admin UI for permission management
- Fine-grained control
- Can add custom roles/permissions

**Cons:**
- More complex to implement
- Requires database schema changes
- Need admin UI for management
- Can be over-engineered for current needs

**Implementation:**
1. Create `Permission` and `RolePermission` tables
2. Define permission keys (e.g., "crew_requests.submit_on_behalf")
3. Create admin UI for permission management
4. Update permission checks to query database

## Recommended Approach

**Phase 1 (Immediate):** Code-based permissions
- Fix critical issues (Admin menu, PC-Support crew requests)
- Create `lib/permissions.ts` with clear permission functions
- Update all permission checks to use new functions
- Document all permissions in code comments

**Phase 2 (Future):** Database-driven permissions
- Only if permission requirements become complex
- If you need to delegate permission management
- If you need role-specific customization per construction group

## Critical Fixes Needed Now

1. **Hide Admin menu** unless user has ADMIN or SUPER_ADMIN system role
2. **Fix crew request "submit on behalf"** to check org roles (PC, PCA, PC-Support, CGO, CGOA)
3. **Fix Manage Requests visibility** to check org roles
4. **Create permission helper functions** for consistent checks

## Example Permission Helper Functions

```typescript
// lib/permissions.ts

export function canAccessAdmin(session: Session | null): boolean {
  if (!session?.user) return false;
  const role = session.user.role?.toUpperCase();
  const adminLevel = session.user.adminLevel?.toUpperCase();
  return role === 'ADMIN' || role === 'SUPER_ADMIN' || 
         adminLevel === 'ADMIN' || adminLevel === 'SUPER_ADMIN';
}

export function canSubmitCrewRequestOnBehalf(
  session: Session | null, 
  userOrgRoles: string[]
): boolean {
  if (!session?.user) return false;
  
  const allowedRoles = ['PC', 'PCA', 'PC-Support', 'CGO', 'CGOA', 'CG-Support'];
  return userOrgRoles.some(role => allowedRoles.includes(role));
}

export function canManageCrewRequests(
  session: Session | null,
  userOrgRoles: string[]
): boolean {
  if (!session?.user) return false;
  
  const allowedRoles = ['PC', 'PCA', 'PC-Support', 'CGO', 'CGOA'];
  return userOrgRoles.some(role => allowedRoles.includes(role));
}

export function canManageVolunteers(session: Session | null): boolean {
  if (!session?.user) return false;
  const role = session.user.role?.toUpperCase();
  const adminLevel = session.user.adminLevel?.toUpperCase();
  return role === 'ADMIN' || role === 'SUPER_ADMIN' || 
         adminLevel === 'ADMIN' || adminLevel === 'SUPER_ADMIN';
}
```

## Testing Scenarios

1. **USER with PC-Support org role**
   - ✅ Should see "Submit Crew Request" with "on behalf of" option
   - ✅ Should see "Manage Requests"
   - ❌ Should NOT see "Admin" menu
   - ✅ Should be able to assign and complete requests

2. **USER with TCV org role (Trade Crew Volunteer)**
   - ✅ Should see "Submit Crew Request" for self only
   - ❌ Should NOT see "Manage Requests"
   - ❌ Should NOT see "Admin" menu

3. **ADMIN system role with no org roles**
   - ✅ Should see "Admin" menu
   - ✅ Should access all admin functions
   - ❌ Should NOT see "Manage Requests" (no org role)

4. **SUPER_ADMIN system role**
   - ✅ Should see everything
   - ✅ Should be able to do everything
