---
description: Automated testing workflow for pre-deployment validation with feature-specific tests
---

# /test-release - Automated Testing Workflow

**Two-tier testing strategy:** Quick smoke tests + comprehensive feature validation before production release.

## 🚀 Quick Usage

```bash
# Tier 1: Smoke tests (1-2 min) - Run before every deployment
npm run test:smoke:quick

# Tier 2: Feature tests (5-10 min) - Run before PRODUCTION release
npx playwright test tests/volunteers.spec.ts
```

---

## 📋 Full Workflow

### **Step 1: Deploy to STANDBY**
```bash
# Deploy your code to STANDBY first
git push origin feature-branch
ssh root@10.92.3.25 "cd /opt/ldc-construction-tools/frontend && git pull && npm install --legacy-peer-deps && npm run build && pm2 restart ldc-tools-green"
```

### **Step 2: Tier 1 - Smoke Tests (Quick Validation)**
```bash
# Test STANDBY - catches major breakage (1-2 min)
BASE_URL=http://10.92.3.25:3001 TEST_USER_EMAIL=admin@ldctools.local TEST_USER_PASSWORD='AdminPass123!' npm run test:smoke:quick
```

**What this tests:**
- ✅ Login works
- ✅ Pages load without crashing
- ✅ No critical JavaScript errors

**If smoke tests FAIL:** Fix issues before proceeding

### **Step 3: Tier 2 - Feature Tests (Comprehensive Validation)**
```bash
# Test all Phase 1 features on STANDBY (5-10 min)
BASE_URL=http://10.92.3.25:3001 TEST_USER_EMAIL=admin@ldctools.local TEST_USER_PASSWORD='AdminPass123!' npx playwright test tests/volunteers.spec.ts
```

**What this tests:**
- ✅ Multi-field search functionality
- ✅ Saved search filters
- ✅ Quick filters (Active/Inactive/Has Email/Has Phone)
- ✅ Phone number validation and formatting
- ✅ Email verification badges
- ✅ Congregation distribution card
- ✅ Bulk edit modal
- ✅ Bulk reassignment wizard
- ✅ Bulk status updates
- ✅ Filtered CSV/PDF exports
- ✅ Select All functionality
- ✅ View mode toggle (Grid/List)

**If feature tests FAIL:** Review failures, fix issues, redeploy to STANDBY, and re-test

### **Step 4: Deploy to PRODUCTION**
```bash
# Only after ALL tests pass on STANDBY
ssh root@10.92.3.23 "cd /opt/ldc-construction-tools/frontend && git pull && npm install --legacy-peer-deps && npm run build && pm2 restart ldc-tools-blue"
```

### **Step 5: Verify PRODUCTION**
```bash
# Quick smoke test on PRODUCTION (1-2 min)
BASE_URL=http://10.92.3.23:3001 TEST_USER_EMAIL=admin@ldctools.local TEST_USER_PASSWORD='AdminPass123!' npm run test:smoke:quick
```

**Expected:** All tests pass ✅

### Step 5: Switch Traffic (if tests pass)
```bash
# Switch traffic to STANDBY
# Your traffic switching commands
```

### Step 6: Verify Production
```bash
# Test production after traffic switch
BASE_URL=https://ldc.cloudigan.net npm run test:smoke:quick
```

## Available Test Commands

| Command | Time | Purpose |
|---------|------|---------|
| `npm run test:smoke:quick` | 1-2 min | Quick pre-deployment check |
| `npm run test:smoke` | 2-3 min | Smoke tests (parallel) |
| `npm run test:e2e` | 5-10 min | Full test suite |
| `npm run test:e2e:ui` | Interactive | Visual test debugger |
| `npm run test:e2e:headed` | Variable | Watch tests run |
| `npm run test:report` | Instant | View HTML report |
| `npm run test:debug` | Interactive | Debug failing tests |

## If Tests Fail

### View the Report
```bash
npm run test:report
```

### Debug Visually
```bash
# Run with visible browser
npm run test:e2e:headed

# Or use interactive UI
npm run test:e2e:ui
```

### Check Screenshots/Videos
```bash
# Screenshots of failures
ls test-results/screenshots/

# Videos of failures
ls test-results/videos/
```

### Run Specific Test
```bash
npx playwright test tests/smoke-test.spec.ts -g "Login"
```

## Test Against Different Environments

### Local Development
```bash
npm run test:smoke:quick
```

### STANDBY Server
```bash
BASE_URL=http://10.92.3.25:3001 npm run test:smoke:quick
```

### Production
```bash
BASE_URL=https://ldc.cloudigan.net npm run test:smoke:quick
```

## What Gets Tested

### Critical Paths (Smoke Tests)
- ✅ Login flow
- ✅ Volunteers page loads
- ✅ Search functionality
- ✅ Bulk operations UI
- ✅ No JavaScript errors

### Full Test Suite (E2E Tests)
- ✅ Multi-field search
- ✅ Saved search filters
- ✅ Quick filters
- ✅ Phone validation
- ✅ Email verification
- ✅ Emergency contacts
- ✅ Congregation tracking
- ✅ Bulk edit modal
- ✅ Bulk reassignment wizard
- ✅ Bulk status updates
- ✅ Filtered exports

## Success Criteria

**Before Deployment:**
- ✅ All smoke tests pass locally
- ✅ No console errors

**After Deployment to STANDBY:**
- ✅ All smoke tests pass on STANDBY
- ✅ Manual spot check of changed features

**After Traffic Switch:**
- ✅ All smoke tests pass on production
- ✅ No user-reported issues

## Troubleshooting

### Tests Won't Start
```bash
# Install Playwright browsers
npx playwright install
```

### Tests Timeout
- Check if server is running
- Verify BASE_URL is correct
- Increase timeout in playwright.config.ts

### Login Fails
- Verify test user exists in database
- Check credentials in .env.test
- Ensure authentication is working

## Documentation

- **Full Guide:** See TESTING.md
- **Checklist:** See TESTING-CHECKLIST.md
- **Test Files:** See tests/ directory

## Quick Reference

```
┌─────────────────────────────────────────────────────┐
│  BEFORE EVERY DEPLOYMENT:                           │
│                                                      │
│  npm run test:smoke:quick                           │
│                                                      │
│  ✅ Pass? → Deploy!                                 │
│  ❌ Fail? → Fix first!                              │
└─────────────────────────────────────────────────────┘
```

**Time Investment:** 1-2 minutes to deploy with confidence! 🚀
