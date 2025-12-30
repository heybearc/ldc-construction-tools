# API Monitoring Strategy
## LDC Construction Tools

**Version**: 1.0  
**Date**: December 30, 2024

---

## Overview

The LDC Construction Tools application has **56 total API endpoints**. We currently monitor **23 critical endpoints** (41% coverage) through the Admin API Status dashboard.

---

## Why Not Monitor All 56 Endpoints?

### **Reasons for Selective Monitoring:**

1. **Redundancy** - Many endpoints are variations of the same functionality:
   - `/api/v1/volunteers` (monitored)
   - `/api/v1/volunteers/export` (not monitored - same underlying logic)
   - `/api/v1/volunteers/import` (not monitored - same underlying logic)
   - `/api/v1/volunteers/stats` (not monitored - derivative data)

2. **Dynamic Routes** - Endpoints with `[id]` parameters can't be easily tested without valid IDs:
   - `/api/v1/admin/users/[id]` - requires valid user ID
   - `/api/v1/admin/users/[id]/reset-password` - requires valid user ID
   - `/api/v1/role-assignments/[id]` - requires valid assignment ID

3. **Action Endpoints** - POST/PUT/DELETE endpoints that modify data:
   - Testing these would create/modify/delete actual data
   - Not suitable for health monitoring
   - Better tested through integration tests

4. **Admin-Only Utilities** - Rarely used maintenance endpoints:
   - `/api/v1/admin/reset` - database reset (dangerous to test)
   - `/api/v1/admin/backup` - backup operations
   - `/api/v1/admin/fix-user-link` - one-time migration utility

5. **Performance** - Testing 56 endpoints would:
   - Increase dashboard load time significantly
   - Put unnecessary load on the database
   - Make it harder to spot actual issues in the noise

---

## Current Monitoring Coverage (23 Endpoints)

### **Core User & Volunteer Management** (3)
✅ **Monitored:**
- `GET /api/v1/volunteers` - Main volunteer listing
- `GET /api/v1/admin/users` - User administration
- `GET /api/v1/user/profile` - User profile data

❌ **Not Monitored:**
- `/api/v1/volunteers/export` - Export functionality
- `/api/v1/volunteers/import` - Import functionality
- `/api/v1/volunteers/stats` - Statistics (derivative)
- `/api/v1/volunteers/available-roles` - Role lookup (derivative)
- `/api/v1/admin/users/[id]` - Individual user (dynamic route)
- `/api/v1/admin/users/import` - Bulk import
- `/api/v1/admin/users/invite` - User invitation
- `/api/v1/admin/users/personnel` - Personnel listing (derivative)
- `/api/v1/admin/users/stats` - User statistics (derivative)

**Rationale**: The main GET endpoints cover the core functionality. Export/import/stats are derivatives that use the same underlying data access patterns.

### **Role Management** (3)
✅ **Monitored:**
- `GET /api/v1/roles` - Role definitions
- `GET /api/v1/role-assignments` - Role assignments
- `GET /api/v1/user/roles` - Current user roles

❌ **Not Monitored:**
- `/api/v1/role-assignments/[id]` - Individual assignment (dynamic route)
- `/api/v1/role-assignments/stats` - Statistics (derivative)
- `/api/v1/role-assignments/health` - Health check (redundant)
- `/api/v1/volunteer-roles` - Volunteer role lookup (derivative)

**Rationale**: Core role functionality is covered. Individual assignments and stats are derivatives.

### **Trade Teams & Crews** (2)
✅ **Monitored:**
- `GET /api/v1/trade-teams` - Trade team listing
- `GET /api/v1/trade-teams/overview` - Overview and stats

❌ **Not Monitored:**
- `/api/v1/trade-teams/overview/export` - Export (derivative)

**Rationale**: Both main endpoints are monitored. Export is a derivative.

### **Projects** (1)
✅ **Monitored:**
- `GET /api/v1/projects` - Project listing

❌ **Not Monitored:**
- `/api/v1/projects/export` - Export (derivative)
- `/api/v1/projects/import` - Import (action endpoint)

**Rationale**: Main listing is monitored. Import/export are derivatives.

### **Crew Change Requests** (2)
✅ **Monitored:**
- `GET /api/v1/crew-requests` - All crew requests
- `GET /api/v1/crew-requests/my-requests` - User-specific requests

**Rationale**: Both main access patterns are covered.

### **Feedback System** (2)
✅ **Monitored:**
- `GET /api/v1/admin/feedback` - Admin feedback view
- `GET /api/v1/feedback/my-feedback` - User feedback view

❌ **Not Monitored:**
- `/api/v1/feedback/submit` - Submit feedback (action endpoint)
- `/api/v1/feedback/updates` - Feedback updates (derivative)
- `/api/v1/admin/feedback/[id]/comment` - Add comment (action endpoint)
- `/api/v1/admin/feedback/[id]/status` - Update status (action endpoint)

**Rationale**: Both read patterns are monitored. Write operations are action endpoints.

### **Announcements** (1)
✅ **Monitored:**
- `GET /api/v1/announcements` - Announcement listing

❌ **Not Monitored:**
- `/api/v1/admin/announcements` - Admin announcement management (derivative)
- `/api/v1/admin/announcements/[id]` - Individual announcement (dynamic route)

**Rationale**: Main listing is monitored. Admin view is derivative.

### **Organization Hierarchy - Phase 2** (3)
✅ **Monitored:**
- `GET /api/v1/admin/hierarchy` - Full hierarchy data
- `GET /api/v1/admin/hierarchy/construction-groups` - CG listing
- `POST /api/v1/user/set-cg-filter` - CG filter control

❌ **Not Monitored:**
- `/api/v1/admin/hierarchy/regions` - Region management (derivative)
- `/api/v1/admin/hierarchy/construction-groups/[id]` - Individual CG (dynamic route)
- `/api/v1/admin/construction-group` - CG lookup (derivative)
- `/api/v1/construction-groups` - Public CG listing (derivative)

**Rationale**: Main hierarchy and CG endpoints are monitored. Individual CGs require dynamic IDs.

### **Audit Logging - Phase 2.3** (1)
✅ **Monitored:**
- `GET /api/v1/admin/audit/multi-tenant` - Audit log viewer

❌ **Not Monitored:**
- `/api/v1/admin/audit/multi-tenant/export` - Export (derivative)
- `/api/v1/admin/audit/logs` - Legacy audit logs (deprecated)

**Rationale**: Main audit log viewer is monitored. Export is derivative.

### **Admin & System** (3)
✅ **Monitored:**
- `GET /api/v1/admin/email/config` - Email configuration
- `GET /api/v1/admin/system/info` - System information
- `GET /api/v1/admin/health/status` - Health check

❌ **Not Monitored:**
- `/api/v1/admin/email/test` - Test email (action endpoint)
- `/api/v1/admin/system/deployment-state` - Deployment info (rarely used)
- `/api/v1/admin/backup` - Backup operations (dangerous to test)
- `/api/v1/admin/backup/info` - Backup info (rarely used)
- `/api/v1/admin/reset` - Database reset (dangerous to test)
- `/api/v1/admin/fix-user-link` - Migration utility (one-time use)
- `/api/v1/admin/api/status` - API status (self-referential)
- `/api/v1/admin` - Admin dashboard (derivative)

**Rationale**: Core admin endpoints are monitored. Dangerous/rarely-used endpoints excluded.

### **Congregations** (1)
✅ **Monitored:**
- `GET /api/v1/congregations` - Congregation listing

**Rationale**: Main congregation data access is covered.

### **Authentication** (0)
❌ **Not Monitored:**
- `/api/v1/auth/verify-invite` - Invitation verification (public endpoint)
- `/api/v1/auth/accept-invite` - Accept invitation (action endpoint)

**Rationale**: Authentication endpoints are public and don't require session. Better tested through integration tests.

### **User Utilities** (0)
❌ **Not Monitored:**
- `/api/v1/user/debug` - Debug endpoint (development only)
- `/api/v1/user/dismiss-release-banner` - UI preference (trivial)

**Rationale**: Utility endpoints with minimal business logic.

### **Export/Import** (0)
❌ **Not Monitored:**
- `/api/v1/export` - Generic export (deprecated/unused)

**Rationale**: Deprecated or unused endpoint.

---

## Monitoring Strategy Summary

### **What We Monitor:**
- **Main GET endpoints** for each feature area
- **Critical user-facing APIs** that are frequently accessed
- **Phase 2 features** (hierarchy, audit logs)
- **System health** endpoints

### **What We Don't Monitor:**
- **Dynamic routes** requiring specific IDs
- **Action endpoints** (POST/PUT/DELETE) that modify data
- **Derivative endpoints** (export, stats, etc.)
- **Dangerous endpoints** (reset, backup)
- **Rarely used utilities**
- **Deprecated endpoints**

### **Coverage Metrics:**
- **Total Endpoints**: 56
- **Monitored**: 23 (41%)
- **Not Monitored**: 33 (59%)

---

## Recommendation

**Current monitoring coverage (23 endpoints) is optimal** because:

1. ✅ **Covers all major features** - Every feature area has at least one monitored endpoint
2. ✅ **Focuses on user-facing APIs** - Monitors what users actually interact with
3. ✅ **Avoids false positives** - Doesn't test action endpoints that would create data
4. ✅ **Reasonable performance** - 23 endpoints can be tested quickly
5. ✅ **Easy to diagnose** - Small enough list to quickly identify issues

**Expanding to all 56 endpoints would:**
- ❌ Add significant overhead with minimal benefit
- ❌ Include many endpoints that can't be safely tested
- ❌ Make the dashboard cluttered and harder to use
- ❌ Slow down the health check process
- ❌ Create false positives from dynamic routes

---

## Alternative Monitoring Approaches

For the 33 unmonitored endpoints, consider:

1. **Integration Tests** - Automated tests that run on deployment
2. **Error Tracking** - Monitor production errors via logging
3. **Usage Analytics** - Track which endpoints are actually used
4. **Periodic Manual Testing** - Test export/import features manually before releases

---

## Conclusion

**The current 23-endpoint monitoring strategy provides excellent coverage** of critical application functionality while maintaining a clean, performant, and actionable health dashboard. Expanding monitoring to all 56 endpoints would provide diminishing returns and introduce unnecessary complexity.

**Recommendation**: Keep current monitoring strategy with 23 endpoints.
