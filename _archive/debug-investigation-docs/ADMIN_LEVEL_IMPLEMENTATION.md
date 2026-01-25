# Admin Level Implementation Plan

## Overview
Add an optional "Admin Level" field to users, allowing someone to have both a functional role (e.g., Personnel Contact) AND administrative access (e.g., Super Admin).

## Database Changes

### 1. Update Prisma Schema
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  role          String?   // Primary job function
  adminLevel    String?   // Optional: SUPER_ADMIN, ADMIN, etc.
  zoneId        String?   // Zone assignment
  regionId      String?   // Region assignment
  // ... existing fields
}
```

### 2. Admin Levels (Hierarchy)
- **SUPER_ADMIN** - Full system access
- **ADMIN** - Standard admin access
- **READ_ONLY_ADMIN** - View-only admin access
- **null** - No admin access (regular user)

## Frontend Changes

### 1. User Management Forms
Update all three modals:
- Invite User Modal
- Create User Modal  
- Edit User Modal

Add Admin Level dropdown:
```tsx
<select>
  <option value="">No Admin Access</option>
  <option value="SUPER_ADMIN">Super Admin</option>
  <option value="ADMIN">Admin</option>
  <option value="READ_ONLY_ADMIN">Read-Only Admin</option>
</select>
```

### 2. Authentication Helpers
Update `/lib/auth-helpers.ts`:
```typescript
export function isAdmin(session: Session | null): boolean {
  if (!session || !session.user) return false;
  
  const role = session.user.role?.toUpperCase();
  const adminLevel = (session.user as any).adminLevel?.toUpperCase();
  
  // Check both role and adminLevel
  return role === 'ADMIN' || 
         role === 'SUPER_ADMIN' || 
         adminLevel === 'ADMIN' || 
         adminLevel === 'SUPER_ADMIN';
}

export function isSuperAdmin(session: Session | null): boolean {
  if (!session || !session.user) return false;
  
  const role = session.user.role?.toUpperCase();
  const adminLevel = (session.user as any).adminLevel?.toUpperCase();
  
  return role === 'SUPER_ADMIN' || adminLevel === 'SUPER_ADMIN';
}
```

### 3. Session/NextAuth
Update NextAuth callbacks to include adminLevel in session.

### 4. User Display
Show both role and admin level in user tables:
```
Personnel Contact • Super Admin
Zone Overseer • (no admin access)
```

## Benefits
1. ✅ Clear separation of duties vs permissions
2. ✅ Simple to understand and manage
3. ✅ Easy permission checks
4. ✅ Flexible - most users won't have admin level
5. ✅ Scalable - can add more admin levels later

## Migration Steps
1. Add adminLevel column to database (nullable)
2. Update Prisma schema and generate client
3. Update all user forms
4. Update authentication helpers
5. Update session configuration
6. Test thoroughly on STANDBY
7. Deploy to production

## Example Use Cases
- **Personnel Contact + Super Admin**: Can do their job AND manage the system
- **Trade Team Overseer + Admin**: Can oversee teams AND access admin features
- **Field Rep**: Just their role, no admin access
