# LDC Tools Backup & Restore System

**Complete backup and disaster recovery system for LDC Tools**

## 🎯 Overview

The LDC Tools backup system provides comprehensive database and filesystem backups with:
- **Automated backups** before critical operations
- **Multiple backup types** (full, database-only, files-only)
- **Backup reasons** (manual, pre-migration, pre-deployment, pre-release)
- **Git safety tags** for code rollback
- **Metadata tracking** for each backup
- **Automatic cleanup** (keeps last 10 backups)
- **Tailscale support** for external access

---

## 📁 Backup Structure

### **Backup Location (Container 131 - Database Server)**
```
/mnt/data/ldc-tools-backups/
├── database/
│   ├── manual/
│   ├── pre-migration/
│   ├── pre-deployment/
│   ├── pre-release/
│   └── pre-restore/
└── files/
    ├── manual/
    ├── pre-migration/
    ├── pre-deployment/
    └── pre-release/
```

### **Backup Files**
- **Database**: `ldc-tools_YYYYMMDD_HHMMSS.sql.gz`
- **Files (BLUE)**: `ldc-tools_blue_YYYYMMDD_HHMMSS.tar.gz`
- **Files (GREEN)**: `ldc-tools_green_YYYYMMDD_HHMMSS.tar.gz`
- **Metadata**: `*.meta` files with backup details

---

## 🚀 Quick Start

### **Create a Full Backup**
```bash
cd /Users/cory/Documents/Cloudy-Work/applications/ldc-tools
./scripts/create-backup.sh full manual
```

### **Create Database-Only Backup**
```bash
./scripts/create-backup.sh db-only pre-migration
```

### **Create Files-Only Backup**
```bash
./scripts/create-backup.sh files-only pre-deployment
```

---

## 📋 Backup Types

### **1. Full Backup**
```bash
./scripts/create-backup.sh full [reason]
```
**Includes:**
- ✅ Database dump (PostgreSQL)
- ✅ BLUE container files
- ✅ GREEN container files
- ✅ Git safety tag

**Use for:**
- Major releases
- System upgrades
- Before significant changes

---

### **2. Database-Only Backup**
```bash
./scripts/create-backup.sh db-only [reason]
```
**Includes:**
- ✅ Database dump only
- ✅ Git safety tag

**Use for:**
- Database migrations
- Schema changes
- Data imports

---

### **3. Files-Only Backup**
```bash
./scripts/create-backup.sh files-only [reason]
```
**Includes:**
- ✅ BLUE container files
- ✅ GREEN container files
- ✅ Git safety tag

**Use for:**
- Code deployments
- Configuration changes
- Application updates

---

## 🏷️ Backup Reasons

### **Manual**
```bash
./scripts/create-backup.sh full manual
```
User-initiated backups for safety

### **Pre-Migration**
```bash
./scripts/create-backup.sh db-only pre-migration
```
Before database schema changes

### **Pre-Deployment**
```bash
./scripts/create-backup.sh full pre-deployment
```
Before deploying new code

### **Pre-Release**
```bash
./scripts/create-backup.sh full pre-release
```
Before switching traffic (release)

---

## 🔄 Restore Operations

### **List Available Backups**
```bash
./scripts/restore-backup.sh
```

### **Restore Database**
```bash
./scripts/restore-backup.sh db 20251102_083000
```

### **Restore Files**
```bash
./scripts/restore-backup.sh files 20251102_083000
```

### **Full Restore**
```bash
./scripts/restore-backup.sh full 20251102_083000
```

---

## 🛡️ Safety Features

### **1. Pre-Restore Safety Backup**
Before any restore, the system automatically creates a safety backup of current state:
```
/mnt/data/ldc-tools-backups/database/pre-restore/
```

### **2. Git Safety Tags**
Every backup creates a git tag:
```bash
git tag -l "backup-*"
# backup-manual-20251102_083000
# backup-pre-migration-20251102_090000
```

### **3. Health Verification**
- Pre-backup health check
- Post-restore health check
- Automatic verification of both environments

### **4. Metadata Tracking**
Each backup includes metadata:
```
BACKUP_TIMESTAMP=20251102_083000
BACKUP_TYPE=full
BACKUP_REASON=pre-migration
DATABASE_NAME=ldc_tools
GIT_BRANCH=main
GIT_COMMIT=abc123...
CREATED_BY=user@hostname
BACKUP_SIZE=15M
```

### **5. Automatic Cleanup**
- Keeps last 10 backups per reason
- Older backups automatically deleted
- Safety backups preserved separately

---

## 🌐 Tailscale Support

### **External Access (via Tailscale)**

When working externally, the backup system automatically detects Tailscale:

```bash
# System detects Tailscale network
./scripts/create-backup.sh full manual
# Output: "Detected Tailscale network - using Tailscale routes"
```

### **Tailscale Configuration**

**Proxmox Host:**
- Tailscale hostname: `prox`
- Access via: `ssh prox`

**Containers (via Proxmox):**
```bash
# BLUE (Container 133)
ssh prox "pct exec 133 -- [command]"

# GREEN (Container 135)
ssh prox "pct exec 135 -- [command]"

# Database (Container 131)
ssh prox "pct exec 131 -- [command]"
```

### **Testing Tailscale Connection**
```bash
# Test Proxmox access
ssh prox "hostname"

# Test container access
ssh prox "pct exec 133 -- hostname"
```

---

## 📊 Workflow Integration

### **Before Database Migration**
```bash
# 1. Create backup
./scripts/create-backup.sh db-only pre-migration

# 2. Run migration
cd frontend
npx prisma migrate deploy

# 3. Verify migration
npx prisma db pull

# 4. If issues, restore
./scripts/restore-backup.sh db [timestamp]
```

### **Before Deployment**
```bash
# 1. Create backup
./scripts/create-backup.sh full pre-deployment

# 2. Deploy via Apex Guardian
# (GitHub Actions handles deployment)

# 3. If issues, restore
./scripts/restore-backup.sh full [timestamp]
```

### **Before Release**
```bash
# 1. Create backup
./scripts/create-backup.sh full pre-release

# 2. Switch traffic
# (Use Apex Guardian release workflow)

# 3. If issues, restore or rollback
./scripts/restore-backup.sh full [timestamp]
```

---

## 🔧 Advanced Usage

### **Manual Database Backup**
```bash
ssh prox "pct exec 131 -- bash -c '
    sudo -u postgres pg_dump ldc_tools | gzip > /mnt/data/manual-backup.sql.gz
'"
```

### **Manual Files Backup**
```bash
ssh prox "pct exec 133 -- bash -c '
    cd /opt/ldc-tools
    tar -czf /tmp/manual-backup.tar.gz \
        --exclude=node_modules \
        --exclude=.next \
        frontend/
'"
```

### **Copy Backup to Local Machine**
```bash
# Via Proxmox
ssh prox "pct exec 131 -- cat /mnt/data/ldc-tools-backups/database/manual/ldc-tools_20251102_083000.sql.gz" > local-backup.sql.gz
```

### **Verify Backup Integrity**
```bash
# Test database backup
ssh prox "pct exec 131 -- bash -c '
    gunzip -t /mnt/data/ldc-tools-backups/database/manual/ldc-tools_20251102_083000.sql.gz
'"

# Test files backup
ssh prox "pct exec 131 -- bash -c '
    tar -tzf /mnt/data/ldc-tools-backups/files/manual/ldc-tools_blue_20251102_083000.tar.gz | head
'"
```

---

## 📈 Monitoring Backups

### **Check Backup Status**
```bash
# List recent backups
ssh prox "pct exec 131 -- bash -c '
    echo \"=== Database Backups ===\"
    ls -lh /mnt/data/ldc-tools-backups/database/*/*.sql.gz | tail -5
    echo \"\"
    echo \"=== Files Backups ===\"
    ls -lh /mnt/data/ldc-tools-backups/files/*/*.tar.gz | tail -5
'"
```

### **Check Backup Sizes**
```bash
ssh prox "pct exec 131 -- bash -c '
    du -sh /mnt/data/ldc-tools-backups/*
'"
```

### **View Backup Metadata**
```bash
ssh prox "pct exec 131 -- cat /mnt/data/ldc-tools-backups/database/manual/ldc-tools_20251102_083000.sql.gz.meta"
```

---

## 🚨 Emergency Procedures

### **Emergency Database Restore**
```bash
# 1. Find latest backup
ssh prox "pct exec 131 -- ls -lt /mnt/data/ldc-tools-backups/database/manual/*.sql.gz | head -1"

# 2. Restore immediately
./scripts/restore-backup.sh db [timestamp]
```

### **Emergency Files Restore**
```bash
# 1. Find latest backup
ssh prox "pct exec 131 -- ls -lt /mnt/data/ldc-tools-backups/files/manual/*.tar.gz | head -1"

# 2. Restore immediately
./scripts/restore-backup.sh files [timestamp]
```

### **Git Rollback**
```bash
# 1. List safety tags
git tag -l "backup-*"

# 2. Checkout tag
git checkout tags/backup-pre-release-20251102_083000

# 3. Deploy old version
# (Use Apex Guardian deployment)
```

---

## 🎯 Best Practices

### **DO:**
- ✅ Create backups before any database migration
- ✅ Create backups before major deployments
- ✅ Create backups before switching traffic
- ✅ Verify backup integrity periodically
- ✅ Test restore procedures regularly
- ✅ Document backup reasons clearly

### **DON'T:**
- ❌ Skip backups for "small" changes
- ❌ Delete backups manually without checking
- ❌ Restore without creating a safety backup first
- ❌ Ignore backup failures
- ❌ Forget to verify post-restore health

---

## 📚 Related Documentation

- **Apex Guardian System:** `APEX_GUARDIAN_SYSTEM.md`
- **Deployment Guide:** `.github/workflows/apex-guardian.yml`
- **Tailscale Setup:** `TAILSCALE_ACCESS.md`
- **Database Migrations:** `frontend/prisma/README.md`

---

## 🆘 Troubleshooting

### **Backup Fails**
```bash
# Check disk space
ssh prox "pct exec 131 -- df -h /mnt/data"

# Check permissions
ssh prox "pct exec 131 -- ls -ld /mnt/data/ldc-tools-backups"

# Check database connection
ssh prox "pct exec 131 -- sudo -u postgres psql -c 'SELECT version();'"
```

### **Restore Fails**
```bash
# Check backup file exists
ssh prox "pct exec 131 -- ls -lh /mnt/data/ldc-tools-backups/database/manual/ldc-tools_[timestamp].sql.gz"

# Check backup integrity
ssh prox "pct exec 131 -- gunzip -t /mnt/data/ldc-tools-backups/database/manual/ldc-tools_[timestamp].sql.gz"

# Check database is accessible
ssh prox "pct exec 131 -- sudo -u postgres psql -l"
```

### **Tailscale Connection Issues**
```bash
# Check Tailscale status
tailscale status

# Test Proxmox connection
ping prox

# Test SSH connection
ssh prox "echo 'Connection successful'"
```

---

## 📊 Backup Schedule Recommendations

### **Automated Backups (Future)**
- **Daily**: Database backup at 2 AM
- **Weekly**: Full backup on Sunday at 3 AM
- **Before migrations**: Automatic via Apex Guardian
- **Before releases**: Automatic via Apex Guardian

### **Manual Backups**
- Before major feature deployments
- Before system upgrades
- Before configuration changes
- After successful data imports

---

**Remember: Backups are your safety net. Always create them before making changes!** 🛡️
