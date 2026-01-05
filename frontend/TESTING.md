# 🧪 Automated Testing Guide for LDC Construction Tools

## Quick Start - Run Tests in 30 Seconds

### **Option 1: Quick Smoke Test (Recommended for Pre-Deployment)**
```bash
npm run test:smoke:quick
```
**Time:** ~1-2 minutes  
**Purpose:** Verify critical paths are working before deployment

### **Option 2: Full Test Suite**
```bash
npm run test:e2e
```
**Time:** ~5-10 minutes  
**Purpose:** Comprehensive testing of all Phase 1 features

### **Option 3: Visual Test Runner (Interactive)**
```bash
npm run test:e2e:ui
```
**Purpose:** Run tests with visual UI, great for debugging

---

## 📋 Available Test Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run test:smoke` | Quick smoke tests | Before every deployment |
| `npm run test:smoke:quick` | Smoke tests (sequential) | Fast pre-deployment check |
| `npm run test:e2e` | Full test suite | After major changes |
| `npm run test:e2e:ui` | Interactive test UI | Debugging test failures |
| `npm run test:e2e:headed` | Run with visible browser | See what tests are doing |
| `npm run test:report` | View last test report | Review test results |
| `npm run test:debug` | Debug mode | Troubleshoot failing tests |

---

## 🎯 Testing Strategy

### **Before Every Deployment:**
1. Run smoke tests: `npm run test:smoke:quick`
2. Review the HTML report: `npm run test:report`
3. Fix any failures before deploying

### **After Major Feature Development:**
1. Run full test suite: `npm run test:e2e`
2. Review all test results
3. Update tests if needed for new features

### **When Tests Fail:**
1. Run with UI: `npm run test:e2e:ui`
2. Or run headed: `npm run test:e2e:headed`
3. Check screenshots in `test-results/`
4. Review videos in `test-results/`

---

## 🔧 Configuration

### **Environment Variables**
Create a `.env.test` file:
```bash
BASE_URL=http://localhost:3001
TEST_USER_EMAIL=admin@test.com
TEST_USER_PASSWORD=admin123
```

### **Test Against STANDBY Server**
```bash
BASE_URL=http://10.92.3.25:3001 npm run test:smoke
```

### **Test Against PRODUCTION**
```bash
BASE_URL=https://ldc.cloudigan.net npm run test:smoke
```

---

## 📊 What Gets Tested

### **Phase 1 Features (All Automated):**
- ✅ Multi-field search functionality
- ✅ Saved search filters (save/load/delete)
- ✅ Quick filter buttons
- ✅ Phone validation and formatting
- ✅ Email verification badges
- ✅ Emergency contact fields
- ✅ Congregation distribution display
- ✅ Bulk edit modal
- ✅ Bulk reassignment wizard
- ✅ Bulk status updates
- ✅ Filtered exports (CSV/PDF)
- ✅ Select all functionality
- ✅ View mode toggle (Grid/List)

### **Critical Paths (Smoke Tests):**
- ✅ Login flow
- ✅ Volunteers page loads
- ✅ Search works
- ✅ Bulk operations UI appears
- ✅ No JavaScript errors

---

## 📈 Test Reports

After running tests, view the HTML report:
```bash
npm run test:report
```

The report includes:
- ✅ Pass/fail status for each test
- 📸 Screenshots of failures
- 🎥 Videos of failed tests
- ⏱️ Execution times
- 📊 Test statistics

Reports are saved in: `test-results/html-report/`

---

## 🚀 CI/CD Integration (Optional)

### **GitHub Actions Example:**
Create `.github/workflows/test.yml`:
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:smoke
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

---

## 🔍 Debugging Failed Tests

### **Step 1: Run with UI**
```bash
npm run test:e2e:ui
```
This opens an interactive UI where you can:
- See which tests failed
- Replay tests step-by-step
- Inspect DOM at each step
- View network requests

### **Step 2: Check Screenshots**
Failed tests automatically capture screenshots:
```
test-results/
  screenshots/
    test-name-timestamp.png
```

### **Step 3: Watch Videos**
Failed tests record videos:
```
test-results/
  videos/
    test-name.webm
```

### **Step 4: Run Single Test**
```bash
npx playwright test tests/volunteers.spec.ts -g "Multi-field search"
```

---

## 📝 Adding New Tests

### **Example: Test a New Feature**
```typescript
// tests/my-feature.spec.ts
import { test, expect } from '@playwright/test';
import { login, navigateToVolunteers } from './test-helpers';

test('My new feature works', async ({ page }) => {
  await login(page);
  await navigateToVolunteers(page);
  
  // Test your feature
  await page.click('button:has-text("My Button")');
  await expect(page.locator('text=Success')).toBeVisible();
});
```

---

## ⚡ Quick Reference

### **Pre-Deployment Checklist:**
```bash
# 1. Run smoke tests
npm run test:smoke:quick

# 2. If all pass, deploy
# 3. After deployment, run smoke tests on production
BASE_URL=https://ldc.cloudigan.net npm run test:smoke:quick

# 4. View report
npm run test:report
```

### **Weekly Full Test:**
```bash
# Run full suite
npm run test:e2e

# Review report
npm run test:report

# Update tests if needed
```

---

## 🎓 Best Practices

1. **Run smoke tests before every deployment** (1-2 minutes)
2. **Run full tests weekly** or after major changes
3. **Keep tests updated** when adding new features
4. **Review test reports** to catch issues early
5. **Use test:e2e:ui** for debugging failures
6. **Test on STANDBY first**, then PRODUCTION

---

## 🆘 Troubleshooting

### **Tests won't start:**
```bash
# Install Playwright browsers
npx playwright install
```

### **Tests timeout:**
- Increase timeout in `playwright.config.ts`
- Check if server is running
- Verify BASE_URL is correct

### **Login fails:**
- Check TEST_USER_EMAIL and TEST_USER_PASSWORD
- Verify test user exists in database
- Check authentication is working

### **Tests pass locally but fail on server:**
- Run tests against server URL: `BASE_URL=http://10.92.3.25:3001 npm run test:smoke`
- Check server logs for errors
- Verify database has test data

---

## 📞 Support

If tests are failing and you can't figure out why:
1. Run with UI: `npm run test:e2e:ui`
2. Check screenshots and videos in `test-results/`
3. Review the HTML report: `npm run test:report`
4. Check console logs in the browser DevTools

---

## 🎉 Success Metrics

**Good test coverage means:**
- ✅ Smoke tests pass in under 2 minutes
- ✅ Full suite passes in under 10 minutes
- ✅ No false positives (flaky tests)
- ✅ Clear failure messages
- ✅ Screenshots/videos for debugging

**Your testing workflow should be:**
1. Make changes
2. Run smoke tests (1-2 min)
3. Deploy if passing
4. Run smoke tests on production
5. Done! 🎉
