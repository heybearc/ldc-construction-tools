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
- **BLUE (10.92.3.23):** Development/STANDBY - v1.8.2
- **GREEN (10.92.3.25):** LIVE/Production - (check version)
- **Database:** Shared between both environments

## Best Practices
1. Always test on BLUE before deploying to GREEN
2. Keep both environments in sync when not actively developing
3. Use version tags for tracking deployments
4. Maintain changelog for all releases
5. Test invitation emails and critical workflows before switching traffic

## Rollback Process
If issues occur after switching traffic:
1. Switch traffic back to previous LIVE container
2. Investigate issues on STANDBY container
3. Fix and re-test before attempting switch again
