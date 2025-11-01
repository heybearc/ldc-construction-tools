# Apex Guardian System - LDC Tools

**Professional Blue-Green Deployment with GitHub Actions CI/CD**

## 🎯 Overview

The Apex Guardian System provides automated, safe, and repeatable deployments for LDC Tools using:
- **GitHub Actions CI/CD** - Automated builds and deployments
- **Blue-Green Deployment** - Zero-downtime releases
- **MCP Orchestration** - Intelligent deployment management
- **Immutable Artifacts** - SHA-based releases with locked dependencies
- **Approval Gates** - Manual approval required for production

---

## 🏗️ Infrastructure

### Containers
- **BLUE (Container 133):** 10.92.3.23:3001 - Currently PRODUCTION
- **GREEN (Container 135):** 10.92.3.25:3001 - Currently STANDBY
- **Database (Container 131):** 10.92.3.21 - Shared PostgreSQL
- **HAProxy (Container 136):** 10.92.3.26 - Load balancer

### URLs
- **Production:** https://ldctools.com
- **BLUE Direct:** https://blue.ldctools.com
- **GREEN Direct:** https://green.ldctools.com

### Repository Structure
```
/opt/ldc-construction-tools/
├── current/              # Symlink to active release
├── releases/
│   ├── abc123/          # Release by commit SHA
│   ├── def456/
│   └── ...
└── .env.local           # Environment variables
```

---

## 🔄 Complete Workflow

### **Phase 1: Development**

**Start a new feature:**
```bash
# Create feature branch
git checkout main
git pull origin main
git checkout -b feature/email-notifications
git push -u origin feature/email-notifications
```

**GitHub Actions automatically:**
1. ✅ Builds immutable artifact
2. ✅ Deploys to STANDBY
3. ✅ Runs health checks
4. ✅ Reports deployment status

**Test your feature:**
- Visit https://green.ldctools.com (or blue, whichever is STANDBY)
- Test all functionality
- Make changes, push, auto-deploys to STANDBY
- Repeat until feature is complete

---

### **Phase 2: Merge to Main**

**When feature is ready:**
```bash
# Create Pull Request
gh pr create --title "feat: Email notifications" --body "Description"

# After review, merge to main
gh pr merge --squash

# Or via GitHub UI
```

**GitHub Actions automatically:**
1. ✅ Builds immutable artifact from main
2. ✅ Deploys to STANDBY
3. ✅ Runs health checks
4. ✅ STOPS - waits for manual release approval

**Test main on STANDBY:**
- Visit https://green.ldctools.com (STANDBY)
- Verify everything works
- Check version in footer
- Test all features

---

### **Phase 3: Release to Production**

**When ready to release:**

1. Go to GitHub Actions
2. Select "Apex Guardian CI/CD - LDC Tools"
3. Click "Run workflow"
4. Choose:
   - **Action:** `release-to-prod`
   - **Branch:** `main`
5. Click "Run workflow"
6. **Approve in GitHub Environments** (production approval required)

**GitHub Actions:**
1. ✅ Backs up HAProxy config
2. ✅ Switches traffic to STANDBY
3. ✅ Validates HAProxy config
4. ✅ Reloads HAProxy (zero downtime)
5. ✅ Runs production health checks
6. ✅ Reports new PROD/STANDBY status

**Result:**
- Users now on new version
- Old PROD is now STANDBY (running old version)
- Zero downtime

---

### **Phase 4: Sync STANDBY**

**After monitoring production:**

1. Go to GitHub Actions
2. Select "Apex Guardian CI/CD - LDC Tools"
3. Click "Run workflow"
4. Choose:
   - **Action:** `sync-standby`
   - **Branch:** `main`
5. Click "Run workflow"

**GitHub Actions:**
1. ✅ Deploys main to new STANDBY
2. ✅ Builds and restarts
3. ✅ Runs health checks
4. ✅ Both environments now in sync

**Result:**
- Both BLUE and GREEN running same version
- Ready for next development cycle

---

## 📋 Workflow Commands

### **Automatic Deployments**
```bash
# Push to feature branch → Auto-deploys to STANDBY
git push origin feature/my-feature

# Push to main → Auto-deploys to STANDBY
git push origin main
```

### **Manual Workflows**

**Deploy to STANDBY:**
```
GitHub Actions → Run workflow
Action: deploy-to-standby
Branch: main (or feature/*)
```

**Release to Production:**
```
GitHub Actions → Run workflow
Action: release-to-prod
Branch: main
⚠️ Requires approval in GitHub Environments
```

**Sync STANDBY:**
```
GitHub Actions → Run workflow
Action: sync-standby
Branch: main
```

---

## 🎯 Development Patterns

### **Pattern 1: Quick Fix**
```bash
1. git checkout -b fix/bug-name
2. Make changes, push
3. Test on STANDBY
4. Create PR, merge to main
5. Test main on STANDBY
6. Release to prod
7. Sync STANDBY
```

### **Pattern 2: Feature Development**
```bash
1. git checkout -b feature/new-feature
2. Develop over several days
   - Make changes
   - Push to GitHub
   - Auto-deploys to STANDBY
   - Test
   - Repeat
3. When complete, create PR
4. Merge to main
5. Test main on STANDBY
6. Release to prod
7. Sync STANDBY
```

### **Pattern 3: Emergency Hotfix**
```bash
1. git checkout -b hotfix/critical-fix
2. Make fix, push
3. Test on STANDBY
4. Create PR, merge immediately
5. Release to prod (skip extended testing)
6. Sync STANDBY
```

---

## 🛡️ Safety Features

### **Approval Gates**
- ✅ Feature branches auto-deploy to STANDBY only
- ✅ Main branch auto-deploys to STANDBY only
- ❌ Production requires manual workflow + GitHub approval
- ✅ Sync requires manual workflow

### **Immutable Artifacts**
- ✅ SHA-based releases
- ✅ Locked dependencies (package-lock.json)
- ✅ Build metadata included
- ✅ Atomic symlink switching

### **Health Checks**
- ✅ Post-deployment health checks
- ✅ Production verification
- ✅ Automatic rollback on failure

### **Rollback Capability**
```bash
# Quick rollback (switch symlink to previous release)
ssh prox "pct exec 133 -- bash -c '
  cd /opt/ldc-construction-tools
  PREV_RELEASE=\$(ls -t releases | sed -n 2p)
  ln -sfn releases/\$PREV_RELEASE current
  cd current && pm2 restart ldc-production
'"

# Or use HAProxy to switch back to other environment
```

---

## 📊 Monitoring

### **Check Deployment Status**
```bash
# Check which server is PROD
curl -I https://ldctools.com

# Check BLUE
curl https://blue.ldctools.com/api/health

# Check GREEN
curl https://green.ldctools.com/api/health

# Check HAProxy
ssh prox "pct exec 136 -- systemctl status haproxy"
```

### **View Logs**
```bash
# Application logs
ssh prox "pct exec 133 -- pm2 logs ldc-production --lines 50"
ssh prox "pct exec 135 -- pm2 logs ldc-production --lines 50"

# HAProxy logs
ssh prox "pct exec 136 -- tail -50 /var/log/haproxy.log | grep ldc"
```

### **Check Current Release**
```bash
# Check what's deployed
ssh prox "pct exec 133 -- cat /opt/ldc-construction-tools/current/.build-info"
ssh prox "pct exec 135 -- cat /opt/ldc-construction-tools/current/.build-info"
```

---

## 🔧 Troubleshooting

### **Deployment Failed**
```bash
# Check GitHub Actions logs
# View error in workflow run

# Check server logs
ssh prox "pct exec 135 -- pm2 logs ldc-production --lines 100"

# Manual deployment (if needed)
ssh prox "pct exec 135 -- bash -c '
  cd /opt/ldc-construction-tools/current
  npm ci --legacy-peer-deps
  npm run build
  pm2 restart ldc-production
'"
```

### **Health Check Failed**
```bash
# Check if app is running
ssh prox "pct exec 135 -- pm2 status"

# Check database connection
ssh prox "pct exec 135 -- bash -c '
  cd /opt/ldc-construction-tools/current
  npx prisma db pull
'"

# Restart app
ssh prox "pct exec 135 -- pm2 restart ldc-production"
```

### **HAProxy Issues**
```bash
# Check HAProxy config
ssh prox "pct exec 136 -- cat /etc/haproxy/haproxy.cfg | grep ldc"

# Validate config
ssh prox "pct exec 136 -- haproxy -c -f /etc/haproxy/haproxy.cfg"

# Reload HAProxy
ssh prox "pct exec 136 -- systemctl reload haproxy"

# Restore backup
ssh prox "pct exec 136 -- bash -c '
  cp /etc/haproxy/haproxy.cfg.backup-YYYYMMDD-HHMMSS /etc/haproxy/haproxy.cfg
  systemctl reload haproxy
'"
```

---

## 🎓 Best Practices

### **DO:**
- ✅ Always test on STANDBY before releasing
- ✅ Use feature branches for development
- ✅ Create descriptive commit messages
- ✅ Monitor production after release
- ✅ Sync STANDBY after successful release
- ✅ Keep main branch always deployable

### **DON'T:**
- ❌ Deploy directly to production
- ❌ Skip STANDBY testing
- ❌ Commit directly to main
- ❌ Deploy to both environments simultaneously
- ❌ Modify deployed releases manually
- ❌ Skip the sync step

---

## 📚 Related Documentation

- **MCP Blue-Green Server:** `mcp-blue-green/README.md`
- **Workflows:** `.windsurf/workflows/`
  - `bump.md` - Version management
  - `release.md` - Traffic switching
  - `sync.md` - STANDBY synchronization
- **GitHub Actions:** `.github/workflows/apex-guardian.yml`

---

## 🆘 Support

**Common Issues:**
1. Deployment fails → Check GitHub Actions logs
2. Health check fails → Check PM2 logs
3. HAProxy issues → Check HAProxy config and logs
4. Database issues → Check Prisma connection

**Emergency Contacts:**
- Check logs first
- Review recent changes
- Rollback if necessary
- Document issues for future prevention

---

## 🎉 Success Metrics

**Deployment Speed:**
- Build: ~2-3 minutes
- Deploy to STANDBY: ~2-3 minutes
- Traffic switch: <10 seconds
- Sync STANDBY: ~2-3 minutes
- **Total cycle: ~10 minutes**

**Safety:**
- Zero downtime deployments
- Instant rollback capability
- Approval gates for production
- Immutable artifacts
- Health checks at every step

**Developer Experience:**
- Push to deploy
- Automatic builds
- Clear feedback
- Easy testing
- Professional workflow
