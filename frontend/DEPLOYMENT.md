# LDC Construction Tools - Blue-Green Deployment

## Infrastructure Overview

### Containers
- **ldctools-blue** (Container 133 - 10.92.3.23) - STANDBY environment
- **ldctools-green** (Container 135 - 10.92.3.25) - LIVE environment
- **Database** (Container 131 - 10.92.3.21) - Shared PostgreSQL

### Domains
- **BLUE:** https://blue.ldctools.com (STANDBY)
- **GREEN:** https://green.ldctools.com (LIVE)
- **Main:** https://ldc.cloudigan.net (points to current LIVE)

## Blue-Green Deployment Process

### Development Workflow
1. Develop and test on **BLUE** (STANDBY)
2. Verify all features work on BLUE
3. Version bump and create changelog
4. Switch traffic to make BLUE the new LIVE
5. Previous LIVE becomes new STANDBY

### Deployment Commands

#### Deploy to BLUE (STANDBY)
```bash
ssh root@10.92.3.23
cd /opt/ldc-construction-tools/frontend
git pull
npm install
npm run build
pm2 restart ldc-frontend
```

#### Deploy to GREEN (LIVE)
```bash
ssh root@10.92.3.25
cd /opt/ldc-construction-tools/frontend
git pull
npm install
npm run build
pm2 restart ldc-frontend
```

#### Switch Traffic (Blue → Green or Green → Blue)
Update NPM proxy or load balancer to point main domain to desired container.

### Environment Variables
- `NEXTAUTH_URL` - Set to container's public URL
- `DATABASE_URL` - Shared database connection (same for both)
- `NODE_ENV` - Set to "production" on both containers

## Current Status
**Last Updated:** December 24, 2024

- **BLUE (10.92.3.23):** LIVE/Production
- **GREEN (10.92.3.25):** STANDBY/Testing
- **Database:** Shared between both environments (10.92.3.21)

**⚠️ UPDATE THIS SECTION AFTER EVERY TRAFFIC SWITCH**

## ⚠️ CRITICAL: Blue-Green Deployment Workflow

**ALWAYS follow this order:**
1. **Deploy to STANDBY ONLY** (currently GREEN)
2. **Test thoroughly** on STANDBY URL (https://green.ldctools.com)
3. **Switch traffic** to make STANDBY the new LIVE
4. **Old LIVE becomes new STANDBY**
5. **Sync new STANDBY** with LIVE code
6. **Update this document** with new LIVE/STANDBY status

**NEVER deploy to both environments simultaneously!**

---

## Deployment Procedures

**Full documentation:** [`../DEPLOYMENT-ISSUES-AND-SOLUTIONS.md`](../DEPLOYMENT-ISSUES-AND-SOLUTIONS.md)

### Step 1: Deploy to STANDBY (Currently GREEN)

```bash
# Deploy to STANDBY environment ONLY
ssh root@10.92.3.25  # GREEN (current STANDBY)
cd /opt/ldc-construction-tools/frontend

pm2 delete ldc-frontend
git pull origin main
rm -rf .next node_modules/.cache
npm run build
pm2 start npm --name ldc-frontend -- start
pm2 save

# Verify
curl http://localhost:3001/api/v1/admin/system/info
```

### Step 2: Test on STANDBY

Visit https://green.ldctools.com and test:
- ✓ Authentication (login/logout)
- ✓ User management page
- ✓ Trade Teams page
- ✓ Volunteers page (grid and list views)
- ✓ Edit functionality
- ✓ No console errors

**Do NOT proceed if any tests fail!**

### Step 3: Switch Traffic

Update load balancer/proxy to point main domain to STANDBY:
```bash
# Update your proxy/DNS configuration
# ldctools.com -> 10.92.3.25 (GREEN)
```

After switch:
- GREEN becomes LIVE
- BLUE becomes STANDBY

### Step 4: Sync New STANDBY

```bash
# Sync BLUE (now STANDBY) with LIVE code
ssh root@10.92.3.23
cd /opt/ldc-construction-tools/frontend

pm2 delete ldc-frontend
git pull origin main
rm -rf .next node_modules/.cache
npm run build
pm2 start npm --name ldc-frontend -- start
pm2 save
```

### Step 5: Update This Document

Update "Current Status" section at top of this file:
- Swap LIVE and STANDBY designations
- Update "Last Updated" date

## Rollback Process
If issues occur after switching traffic:
1. Switch traffic back to previous LIVE container
2. Investigate issues on STANDBY container
3. Fix and re-test before attempting switch again
