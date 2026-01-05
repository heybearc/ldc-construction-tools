---
description: Automated testing workflow for pre-deployment validation
---

# /test-release - Automated Testing Workflow

Run automated tests before deploying to verify all functionality works correctly.

## Quick Usage

```bash
# Run smoke tests (1-2 minutes)
npm run test:smoke:quick

# Or use the quick test script
./scripts/quick-test.sh smoke
```

## Full Workflow

### Step 1: Setup (First Time Only)
```bash
# Copy environment template
cp .env.test.example .env.test

# Edit .env.test with your test credentials
# TEST_USER_EMAIL=admin@test.com
# TEST_USER_PASSWORD=admin123
```

### Step 2: Run Tests Before Deployment
```bash
# Quick smoke tests (recommended before every deployment)
npm run test:smoke:quick
```

**Expected:** All tests pass ✅ in 1-2 minutes

### Step 3: Deploy to STANDBY
```bash
# Your deployment commands
git push origin feature-branch
ssh root@10.92.3.25 "cd /opt/ldc-construction-tools/frontend && git pull && npm run build && pm2 restart ldc-tools-green"
```

### Step 4: Test STANDBY Environment
```bash
# Test against STANDBY server
BASE_URL=http://10.92.3.25:3001 npm run test:smoke:quick
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
