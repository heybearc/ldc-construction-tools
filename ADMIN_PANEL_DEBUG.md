# Admin Panel Debug Guide

## 🔍 Current Issues (from screenshots)

All admin pages are showing errors or empty data:

1. **Health Monitor** - "System Status: Error" - Failed to fetch
2. **User Management** - "Users (0)" - No users shown
3. **API Status** - "API Endpoints (0)" - Empty array
4. **Audit Logs** - "Audit Logs (0)" - No logs
5. **System Operations** - Missing System Information section

## 🐛 Debugging Steps

### **Step 1: Check Browser Console**

Open browser console (F12) on each admin page and look for:
- 401 Unauthorized errors
- 403 Forbidden errors
- Network errors
- CORS errors
- Any JavaScript errors

### **Step 2: Check Network Tab**

1. Open Network tab in browser dev tools
2. Navigate to each admin page
3. Look for failed requests to:
   - `/api/v1/admin/health/status`
   - `/api/v1/admin/api/status`
   - `/api/v1/admin/system/info`
   - `/api/v1/admin/audit/logs`
   - `/api/v1/volunteers` (for User Management)

### **Step 3: Test Endpoints Directly**

Try accessing endpoints directly in browser:

```
https://green.ldctools.com/api/v1/admin/health/status
https://green.ldctools.com/api/v1/admin/api/status
https://green.ldctools.com/api/v1/admin/system/info
https://green.ldctools.com/api/v1/admin/audit/logs
```

**Expected:** Should return JSON data or 401 error

### **Step 4: Check Server Logs**

```bash
# Check PM2 logs on GREEN
ssh prox "pct exec 135 -- pm2 logs ldc-production --lines 100"
```

Look for:
- Authentication errors
- Database connection errors
- API endpoint errors
- Any stack traces

### **Step 5: Verify Admin User**

```bash
# Check if admin user exists in database
ssh prox "pct exec 131 -- sudo -u postgres psql ldc_tools -c \"SELECT id, email, name, role FROM \\\"User\\\" WHERE role = 'admin';\""
```

**Expected:** Should show at least one admin user

### **Step 6: Test Authentication**

1. Log out completely
2. Clear browser cache/cookies
3. Log back in as admin
4. Try accessing admin pages again

## 🔧 Common Fixes

### **Fix 1: Session Cookie Issue**

The endpoints might not be receiving the session cookie. Check if:
- Cookies are enabled
- Session cookie exists (check Application tab in dev tools)
- Cookie domain matches

### **Fix 2: Role Check Issue**

The endpoints check for `role === 'admin'`. Verify:
- Your user has role 'admin' (not 'ADMIN' or 'Admin')
- Session includes role information

### **Fix 3: Database Connection**

If endpoints can't connect to database:
```bash
# Test database connection
ssh prox "pct exec 135 -- bash -c 'cd /opt/ldc-construction-tools/frontend && npx prisma db pull'"
```

### **Fix 4: Prisma Client**

Prisma client might not be generated:
```bash
# Regenerate Prisma client
ssh prox "pct exec 135 -- bash -c 'cd /opt/ldc-construction-tools/frontend && npx prisma generate'"
```

## 📊 Expected Responses

### **Health Status Endpoint:**
```json
{
  "health": {
    "overall": "healthy",
    "uptime": "2 days, 14 hours",
    "metrics": [...]
  }
}
```

### **API Status Endpoint:**
```json
{
  "endpoints": [
    {
      "name": "User Management",
      "path": "/api/v1/volunteers",
      "status": "healthy",
      ...
    }
  ],
  "stats": {...}
}
```

### **System Info Endpoint:**
```json
{
  "systemInfo": {
    "version": "1.0.0",
    "environment": "GREEN",
    "uptime": "2 days",
    ...
  }
}
```

## 🚨 Most Likely Issue

**Authentication/Session Problem:**

The endpoints are probably returning 401 Unauthorized because:
1. Session cookie not being sent with fetch requests
2. Session not including role information
3. Admin user role not set correctly in database

**Quick Test:**
Open browser console and run:
```javascript
fetch('/api/v1/admin/health/status')
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error(e));
```

If you see 401 error, it's an auth issue.
If you see data, the endpoints work but the pages have a bug.

## 📝 Information Needed

Please provide:
1. **Browser console errors** (screenshot or copy/paste)
2. **Network tab** showing failed requests
3. **Response from direct endpoint access**
4. **PM2 logs** showing any errors
5. **Admin user verification** from database

This will help me identify the exact issue and fix it quickly!
