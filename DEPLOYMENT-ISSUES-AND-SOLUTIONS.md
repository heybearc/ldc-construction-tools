# LDC Construction Tools - Deployment Issues & Solutions

## Date: December 24, 2024

## Critical Runtime Issues Encountered

### 1. **Next.js Build Cache Persistence**
**Problem:** Next.js `.next` folder caches compiled code that persists across rebuilds and PM2 restarts.

**Symptoms:**
- API endpoints return errors referencing old code
- Prisma queries show old field names that no longer exist in schema
- `rm -rf .next && npm run build` doesn't always clear the cache
- PM2 restart doesn't reload new code

**Root Cause:**
- Next.js production builds cache compiled routes in `.next/server/app/`
- Node.js module cache can persist across PM2 restarts
- Prisma client can be cached in `node_modules/.prisma/`

**Solution:**
```bash
# Full cache clear procedure
pm2 delete <app-name>
pkill -9 node  # Kill all Node processes
rm -rf .next node_modules/.cache node_modules/.prisma
npm run build
pm2 start npm --name <app-name> -- start
```

**Prevention:**
- Always use `pm2 delete` instead of `pm2 restart` when deploying code changes
- Clear `.next` folder before every build
- Consider container reboot for major schema changes

---

### 2. **Environment Variable Loading Issues**
**Problem:** `.env.local` overrides `.env` with higher priority, causing configuration mismatches.

**Symptoms:**
- NEXTAUTH_SECRET mismatch between environments
- Authentication fails with "Invalid email or password"
- Different behavior between BLUE and GREEN

**Root Cause:**
- Next.js loads env files in priority order: `.env.local` > `.env.production` > `.env`
- `.env.local` is typically used for local development but was present on production servers
- Different secrets between environments break password verification

**Solution:**
```bash
# Remove .env.local from production servers
rm .env.local

# Use only .env with environment-specific values
# BLUE: NEXTAUTH_URL=https://blue.ldctools.com
# GREEN: NEXTAUTH_URL=https://green.ldctools.com
# SHARED: NEXTAUTH_SECRET=<same-secret-for-both>
```

**Prevention:**
- Add `.env.local` to `.gitignore` (already done)
- Document that production uses `.env` only
- Ensure NEXTAUTH_SECRET is identical on BLUE and GREEN
- Only NEXTAUTH_URL should differ between environments

---

### 3. **Prisma Schema Sync Issues**
**Problem:** Prisma client generated from different schema than source code expects.

**Symptoms:**
- "Unknown field `role` for select statement on model `Volunteer`"
- Schema checksum mismatch between `prisma/schema.prisma` and `node_modules/.prisma/client/schema.prisma`

**Root Cause:**
- Prisma client wasn't regenerated after schema changes
- Build process used cached Prisma client with old schema

**Solution:**
```bash
# Always regenerate Prisma client after schema changes
npx prisma generate
rm -rf .next  # Clear Next.js cache
npm run build
```

**Prevention:**
- Add Prisma generate to build script: `"build": "prisma generate && next build"`
- Or use `postinstall` script: `"postinstall": "prisma generate"`
- Always run `npx prisma generate` after pulling schema changes

---

### 4. **Database Restore Without Schema Sync**
**Problem:** Restored database data but didn't update application code to match restored schema.

**Symptoms:**
- 500 errors on pages that query restored data
- Prisma errors about missing fields or tables
- Data exists in DB but app can't access it

**Root Cause:**
- Database was restored from backup with old schema
- Application code expected new schema structure
- Volunteer roles changed from single field to many-to-many relation

**Solution:**
```bash
# After database restore, ensure schema matches
cd /opt/ldc-tools/frontend
npx prisma db pull  # Pull schema from database
npx prisma generate  # Regenerate client
rm -rf .next
npm run build
pm2 restart <app-name>
```

**Prevention:**
- Document schema version with each backup
- Test restore procedure in staging first
- Create migration scripts for schema transitions
- Keep application code backward-compatible during migrations

---

### 5. **PM2 Process Management**
**Problem:** PM2 doesn't always pick up environment variable changes or code updates.

**Symptoms:**
- `pm2 restart` shows "Use --update-env to update environment variables"
- Code changes don't take effect after restart
- Multiple instances of same app running

**Root Cause:**
- PM2 caches environment variables and process state
- `pm2 restart` reuses cached state
- Old processes can survive `pkill` if PM2 auto-restarts them

**Solution:**
```bash
# Proper PM2 restart procedure
pm2 delete <app-name>  # Completely remove from PM2
# Make code/env changes
pm2 start npm --name <app-name> -- start
pm2 save  # Save PM2 process list
```

**Prevention:**
- Use `pm2 delete` for deployments, not `pm2 restart`
- Use `pm2 start` with explicit configuration
- Run `pm2 save` after starting to persist configuration
- Check `pm2 list` to ensure no duplicate processes

---

## Bulletproof Deployment Procedure

### ⚠️ CRITICAL: Blue-Green Deployment Workflow

**ALWAYS follow this order:**
1. Deploy to STANDBY environment ONLY
2. Test thoroughly on STANDBY
3. Switch traffic to make STANDBY the new LIVE
4. Old LIVE becomes new STANDBY
5. Sync new STANDBY with LIVE code (after traffic switch)

**NEVER deploy to both environments simultaneously!**

---

### Step 1: Deploy to STANDBY (Code Changes)

```bash
# 1. Determine which environment is STANDBY
# Check DEPLOYMENT.md or ask: which environment is currently STANDBY?
# BLUE = 10.92.3.23 | GREEN = 10.92.3.25

# 2. On development machine
cd /Users/cory/Documents/Cloudy-Work/applications/ldc-tools/frontend
git add .
git commit -m "feat: description of changes"
git push origin main

# 3. Deploy to STANDBY ONLY (example: GREEN is STANDBY)
ssh root@10.92.3.25
cd /opt/ldc-tools/frontend

# 4. Stop application completely
pm2 delete ldc-frontend

# 5. Pull latest code
git stash  # Save any local changes
git pull origin main

# 6. Clear all caches
rm -rf .next node_modules/.cache

# 7. Rebuild
npm run build

# 8. Start application
pm2 start npm --name ldc-frontend -- start
pm2 save

# 9. Verify STANDBY is working
curl http://localhost:3001/api/v1/admin/system/info
pm2 logs ldc-frontend --lines 50
```

### Step 2: Test on STANDBY

```bash
# Test all critical functionality on STANDBY URL
# Example: https://green.ldctools.com (if GREEN is STANDBY)

# Test checklist:
# - Authentication (login/logout)
# - User management page loads
# - Trade Teams page loads
# - Volunteers page loads (both grid and list views)
# - Edit functionality works
# - API endpoints respond correctly
# - No console errors in browser

# If issues found: fix on STANDBY, redeploy, test again
# Do NOT proceed to traffic switch until STANDBY is fully working
```

### Step 3: Switch Traffic

```bash
# Update load balancer/proxy to point main domain to STANDBY
# This makes STANDBY the new LIVE

# Example: Update nginx/Caddy/DNS to point:
# ldctools.com -> 10.92.3.25 (if GREEN was STANDBY)

# After switch:
# - Old LIVE (e.g., BLUE) is now STANDBY
# - Old STANDBY (e.g., GREEN) is now LIVE
```

### Step 4: Sync New STANDBY

```bash
# After traffic switch, sync the NEW STANDBY with LIVE code
# Example: If BLUE is now STANDBY after switch

ssh root@10.92.3.23
cd /opt/ldc-tools/frontend

pm2 delete ldc-frontend
git pull origin main
rm -rf .next node_modules/.cache
npm run build
pm2 start npm --name ldc-frontend -- start
pm2 save

# Verify sync
curl http://localhost:3001/api/v1/admin/system/info
```

### Step 5: Update Documentation

```bash
# Update DEPLOYMENT.md to reflect new LIVE/STANDBY status
# Update any monitoring/documentation with current state
```

### For Schema Changes

```bash
# 1. On development machine
cd /Users/cory/Documents/Cloudy-Work/applications/ldc-tools/frontend

# Update schema
vim prisma/schema.prisma

# Create migration
npx prisma migrate dev --name descriptive_name

# Test locally
npm run build
npm run start

# Commit
git add prisma/
git commit -m "feat: schema changes - descriptive_name"
git push origin main

# 2. On target server
ssh root@<server-ip>
cd /opt/ldc-tools/frontend

# Stop application
pm2 delete ldc-frontend

# Pull code
git pull origin main

# Apply migration
npx prisma migrate deploy

# Clear caches and regenerate
rm -rf .next node_modules/.cache node_modules/.prisma
npx prisma generate
npm run build

# Start application
pm2 start npm --name ldc-frontend -- start
pm2 save

# Verify
npx prisma db pull  # Should show no changes
curl http://localhost:3001/api/v1/trade-teams
```

### For Major Changes (Schema + Data Migration)

```bash
# 1. Backup database first
ssh root@10.92.3.21
pg_dump -U ldc_user -d ldc_tools -F c -f /mnt/data/ldc-tools-backups/database/manual/backup_$(date +%Y%m%d_%H%M%S).dump

# 2. Deploy to STANDBY first
# Follow schema change procedure on STANDBY

# 3. Test thoroughly on STANDBY
# - All API endpoints
# - All pages load
# - Data displays correctly

# 4. If successful, deploy to LIVE
# Follow schema change procedure on LIVE

# 5. If issues occur, restore from backup
psql -U ldc_user -d ldc_tools < /mnt/data/ldc-tools-backups/database/manual/backup_YYYYMMDD_HHMMSS.dump
```

### Nuclear Option: Container Reboot

When all else fails (persistent caching issues):

```bash
# Reboot the container
ssh root@<server-ip>
reboot

# Wait 30 seconds for reboot
sleep 30

# SSH back in and deploy
ssh root@<server-ip>
cd /opt/ldc-tools/frontend
git pull origin main
rm -rf .next node_modules/.cache
npm run build
pm2 start npm --name ldc-frontend -- start
pm2 save
```

---

## Configuration Standards

### Environment Files

**Production Servers (BLUE/GREEN):**
- Use `.env` only
- No `.env.local` or `.env.development`
- NEXTAUTH_SECRET must be identical on both
- Only NEXTAUTH_URL differs

**BLUE (.env):**
```env
DATABASE_URL="postgresql://ldc_user:ldc_password@10.92.3.21:5432/ldc_tools"
NEXTAUTH_URL=https://blue.ldctools.com
NEXTAUTH_SECRET=ldc-staging-secret-2024-secure-green
NODE_ENV=production
```

**GREEN (.env):**
```env
DATABASE_URL="postgresql://ldc_user:ldc_password@10.92.3.21:5432/ldc_tools"
NEXTAUTH_URL=https://green.ldctools.com
NEXTAUTH_SECRET=ldc-staging-secret-2024-secure-green
NODE_ENV=production
```

### PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'ldc-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/opt/ldc-tools/frontend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
```

Then use: `pm2 start ecosystem.config.js`

---

## Monitoring & Verification

### Health Checks

```bash
# Check PM2 status
pm2 list
pm2 logs ldc-frontend --lines 50

# Check application health
curl http://localhost:3001/api/v1/admin/system/info

# Check database connection
npx prisma db pull

# Check for errors
tail -f /var/log/ldc-tools-live.log  # or ldc-tools-standby.log
```

### Common Issues

**"Module not found: Can't resolve '@prisma/client'"**
```bash
npm install --legacy-peer-deps @prisma/client prisma
npx prisma generate
```

**"EADDRINUSE: address already in use :::3001"**
```bash
pm2 delete ldc-frontend
pkill -9 node
pm2 start npm --name ldc-frontend -- start
```

**"Invalid `prisma.model.findMany()` invocation"**
```bash
rm -rf node_modules/.prisma
npx prisma generate
rm -rf .next
npm run build
pm2 restart ldc-frontend
```

---

## Lessons Learned

1. **Always use `pm2 delete` for deployments**, not `pm2 restart`
2. **Clear `.next` folder** before every build
3. **Regenerate Prisma client** after schema changes
4. **Use same NEXTAUTH_SECRET** on BLUE and GREEN
5. **Remove `.env.local`** from production servers
6. **Test on STANDBY first** before deploying to LIVE
7. **Backup database** before major changes
8. **Container reboot** clears all caches when nothing else works
9. **Document schema versions** with backups
10. **Create data migration scripts** for schema transitions

---

## Future Improvements

1. **Automate deployment** with CI/CD pipeline
2. **Add health check endpoints** for monitoring
3. **Implement blue-green deployment** automation
4. **Create database migration testing** framework
5. **Add Prisma client version** to build output
6. **Implement rolling deployments** to avoid downtime
7. **Add deployment verification** tests
8. **Create rollback procedures** documentation
9. **Implement canary deployments** for risky changes
10. **Add deployment notifications** (Slack/email)
