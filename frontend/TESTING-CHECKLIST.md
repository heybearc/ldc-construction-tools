# 📋 Pre-Deployment Testing Checklist

## ⚡ Quick Start (2 Minutes)

```bash
# Run this before EVERY deployment
./scripts/quick-test.sh smoke
```

If all tests pass ✅ → **Deploy with confidence!**  
If any tests fail ❌ → **Fix issues first, then re-test**

---

## 🎯 Testing Workflow by Scenario

### **Scenario 1: Quick Bug Fix or Minor Change**
```bash
# 1. Run smoke tests (1-2 minutes)
npm run test:smoke:quick

# 2. If passing, deploy
# 3. Run smoke tests on STANDBY
BASE_URL=http://10.92.3.25:3001 npm run test:smoke:quick

# 4. If passing, switch traffic to STANDBY
```

### **Scenario 2: New Feature or Major Change**
```bash
# 1. Run full test suite (5-10 minutes)
npm run test:e2e

# 2. Review report
npm run test:report

# 3. Fix any failures
# 4. Re-run tests
# 5. Deploy to STANDBY
# 6. Run smoke tests on STANDBY
BASE_URL=http://10.92.3.25:3001 npm run test:smoke:quick

# 7. Manual exploratory testing of new feature
# 8. Switch traffic if all good
```

### **Scenario 3: Weekly/Monthly Full Regression**
```bash
# 1. Run full suite on all environments
npm run test:e2e  # Local
BASE_URL=http://10.92.3.25:3001 npm run test:e2e  # STANDBY
BASE_URL=https://ldc.cloudigan.net npm run test:e2e  # PRODUCTION

# 2. Review all reports
# 3. Document any issues
# 4. Update tests if needed
```

---

## 📊 Manual Testing Checklist (When Needed)

### **Critical Paths (Always Test These):**
- [ ] Login with valid credentials
- [ ] Navigate to Volunteers page
- [ ] Search for a volunteer
- [ ] View volunteer details
- [ ] Logout

### **Phase 1 Features (Test After Changes):**
- [ ] Multi-field search (name, BA ID, congregation, phone, email)
- [ ] Save a search filter
- [ ] Load a saved search filter
- [ ] Delete a saved search filter
- [ ] Toggle quick filters (Active, Has Email, etc.)
- [ ] View congregation distribution card
- [ ] Select multiple volunteers
- [ ] Bulk Edit modal opens and works
- [ ] Bulk Reassignment wizard (3 steps)
- [ ] Bulk Status Update (6 actions)
- [ ] Export to CSV with filters
- [ ] Export to PDF with filters
- [ ] Phone number formatting in forms
- [ ] Email verification badges display
- [ ] Emergency contact fields in Edit modal

### **Browser Compatibility (Quarterly):**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## 🚀 Deployment Testing Flow

### **Step 1: Pre-Deployment (Local)**
```bash
# Run smoke tests locally
npm run test:smoke:quick
```
**Expected:** All tests pass ✅

### **Step 2: Deploy to STANDBY**
```bash
# Your deployment commands here
git push origin feature-branch
ssh root@10.92.3.25 "cd /opt/ldc-tools/frontend && git pull && npm run build && pm2 restart ldc-tools-green"
```

### **Step 3: Test STANDBY**
```bash
# Run smoke tests on STANDBY
BASE_URL=http://10.92.3.25:3001 npm run test:smoke:quick
```
**Expected:** All tests pass ✅

### **Step 4: Manual Spot Check (2 minutes)**
- [ ] Open http://10.92.3.25:3001 in browser
- [ ] Login
- [ ] Navigate to Volunteers
- [ ] Test the specific feature you changed
- [ ] Check for console errors (F12)

### **Step 5: Switch Traffic to STANDBY**
```bash
# Your traffic switching commands here
```

### **Step 6: Verify PRODUCTION**
```bash
# Run smoke tests on production
BASE_URL=https://ldc.cloudigan.net npm run test:smoke:quick
```
**Expected:** All tests pass ✅

---

## 🔍 Debugging Failed Tests

### **If Smoke Tests Fail:**
```bash
# 1. View the HTML report
npm run test:report

# 2. Run with visible browser to see what's happening
npm run test:e2e:headed

# 3. Check screenshots
ls -la test-results/screenshots/

# 4. Run specific failing test
npx playwright test tests/smoke-test.spec.ts -g "Login"
```

### **Common Issues:**

**Issue:** Tests timeout  
**Fix:** Check if server is running, increase timeout in config

**Issue:** Login fails  
**Fix:** Verify test user exists, check credentials in .env.test

**Issue:** Elements not found  
**Fix:** Check if UI changed, update selectors in tests

**Issue:** Tests pass locally but fail on server  
**Fix:** Test against server URL, check server logs, verify data exists

---

## 📈 Test Coverage Summary

### **Automated Tests:**
- ✅ 15+ E2E tests covering all Phase 1 features
- ✅ 4 critical path smoke tests
- ✅ Automatic screenshots on failure
- ✅ Automatic video recording on failure
- ✅ HTML reports with detailed results

### **What's NOT Automated (Manual Testing Required):**
- ⚠️ Visual regression (UI appearance)
- ⚠️ Performance testing (load times)
- ⚠️ Cross-browser compatibility
- ⚠️ Mobile responsive design
- ⚠️ Accessibility (WCAG compliance)
- ⚠️ Security testing

---

## 🎯 Success Criteria

### **Before Deployment:**
- ✅ All smoke tests pass
- ✅ No console errors
- ✅ Manual spot check of changed features

### **After Deployment to STANDBY:**
- ✅ Smoke tests pass on STANDBY
- ✅ Manual verification of critical paths
- ✅ No errors in server logs

### **After Traffic Switch:**
- ✅ Smoke tests pass on PRODUCTION
- ✅ No user-reported issues in first hour
- ✅ Monitoring shows normal metrics

---

## 📞 Escalation

### **If Tests Keep Failing:**
1. Run with UI: `npm run test:e2e:ui`
2. Check test-results/ for screenshots and videos
3. Review server logs
4. Rollback if critical functionality is broken
5. Fix issues in development
6. Re-test and re-deploy

### **If Production Issues Occur:**
1. Check monitoring/logs
2. Run smoke tests: `BASE_URL=https://ldc.cloudigan.net npm run test:smoke:quick`
3. If tests fail, consider rollback
4. Document the issue
5. Create hotfix branch
6. Test hotfix thoroughly
7. Deploy hotfix

---

## 🔄 Continuous Improvement

### **Weekly:**
- [ ] Run full test suite on all environments
- [ ] Review test results
- [ ] Update tests for new features
- [ ] Check for flaky tests

### **Monthly:**
- [ ] Review test coverage
- [ ] Add tests for common bugs
- [ ] Update test documentation
- [ ] Test on all browsers

### **Quarterly:**
- [ ] Full manual regression test
- [ ] Performance testing
- [ ] Security audit
- [ ] Accessibility review

---

## 💡 Pro Tips

1. **Always run smoke tests before deploying** - saves time catching issues early
2. **Test on STANDBY first** - never deploy directly to production
3. **Keep tests updated** - when you add features, add tests
4. **Use test:e2e:ui for debugging** - visual feedback is invaluable
5. **Don't skip manual testing** - automated tests don't catch everything
6. **Document test failures** - helps identify patterns
7. **Run tests against production weekly** - catch issues before users do

---

## 📚 Additional Resources

- **Full Testing Guide:** See TESTING.md
- **Test Scripts:** See package.json scripts section
- **Test Files:** See tests/ directory
- **Quick Test Script:** ./scripts/quick-test.sh

---

## ✅ Quick Reference Card

```
┌─────────────────────────────────────────────────────┐
│  BEFORE EVERY DEPLOYMENT - RUN THIS:                │
│                                                      │
│  npm run test:smoke:quick                           │
│                                                      │
│  ✅ All Pass? → Deploy!                             │
│  ❌ Any Fail? → Fix first!                          │
└─────────────────────────────────────────────────────┘
```

**Time Investment:**
- Smoke tests: 1-2 minutes
- Full tests: 5-10 minutes
- Manual spot check: 2-3 minutes

**Total:** ~5 minutes to deploy with confidence! 🚀
