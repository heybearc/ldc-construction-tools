# Tailscale Access Guide - LDC Tools

**Working with LDC Tools infrastructure from external locations**

## 🌐 Overview

Tailscale provides secure access to your homelab infrastructure from anywhere:
- **Encrypted tunnel** to your Proxmox environment
- **No port forwarding** required
- **Works from anywhere** (coffee shops, travel, etc.)
- **Seamless integration** with existing tools

---

## 🔧 Setup

### **Prerequisites**
- ✅ Tailscale installed on your Mac
- ✅ Tailscale router configured in homelab
- ✅ SSH keys configured for Proxmox access

### **Verify Tailscale Connection**
```bash
# Check Tailscale status
tailscale status

# Should show your devices including 'prox'
```

---

## 🖥️ Infrastructure Access

### **Proxmox Host**
```bash
# SSH to Proxmox
ssh prox

# Check Proxmox version
ssh prox "pveversion"
```

### **LXC Containers (via Proxmox)**

**BLUE (Container 133) - 10.92.3.23**
```bash
# Execute command
ssh prox "pct exec 133 -- [command]"

# Interactive shell
ssh prox "pct enter 133"

# Examples
ssh prox "pct exec 133 -- pm2 status"
ssh prox "pct exec 133 -- cd /opt/ldc-tools && git status"
```

**GREEN (Container 135) - 10.92.3.25**
```bash
# Execute command
ssh prox "pct exec 135 -- [command]"

# Interactive shell
ssh prox "pct enter 135"
```

**Database (Container 131) - 10.92.3.21**
```bash
# Execute command
ssh prox "pct exec 131 -- [command]"

# PostgreSQL access
ssh prox "pct exec 131 -- sudo -u postgres psql ldc_tools"
```

---

## 🚀 Common Operations via Tailscale

### **Check Application Status**
```bash
# Check BLUE
ssh prox "pct exec 133 -- pm2 status"

# Check GREEN
ssh prox "pct exec 135 -- pm2 status"

# Check both
ssh prox "pct exec 133 -- pm2 status && pct exec 135 -- pm2 status"
```

### **View Logs**
```bash
# BLUE logs
ssh prox "pct exec 133 -- pm2 logs ldc-production --lines 50"

# GREEN logs
ssh prox "pct exec 135 -- pm2 logs ldc-production --lines 50"
```

### **Restart Application**
```bash
# Restart BLUE
ssh prox "pct exec 133 -- pm2 restart ldc-production"

# Restart GREEN
ssh prox "pct exec 135 -- pm2 restart ldc-production"
```

### **Check Git Status**
```bash
# BLUE
ssh prox "pct exec 133 -- bash -c 'cd /opt/ldc-tools && git status'"

# GREEN
ssh prox "pct exec 135 -- bash -c 'cd /opt/ldc-tools && git status'"
```

### **Database Operations**
```bash
# Connect to database
ssh prox "pct exec 131 -- sudo -u postgres psql ldc_tools"

# Run query
ssh prox "pct exec 131 -- sudo -u postgres psql ldc_tools -c 'SELECT COUNT(*) FROM \"User\";'"

# Backup database
ssh prox "pct exec 131 -- sudo -u postgres pg_dump ldc_tools | gzip > /mnt/data/manual-backup.sql.gz"
```

---

## 🛠️ Deployment via Tailscale

### **Manual Deployment**
```bash
# Deploy to STANDBY (GREEN)
ssh prox "pct exec 135 -- bash -c '
    cd /opt/ldc-tools
    git pull origin main
    cd frontend
    npm install --legacy-peer-deps
    npm run build
    pm2 restart ldc-production
'"
```

### **Backup Operations**
```bash
# Create backup (works via Tailscale)
cd /Users/cory/Documents/Cloudy-Work/applications/ldc-tools
./scripts/create-backup.sh full manual

# Restore backup
./scripts/restore-backup.sh full 20251102_083000
```

### **HAProxy Operations**
```bash
# Check HAProxy status
ssh prox "pct exec 136 -- systemctl status haproxy"

# View HAProxy config
ssh prox "pct exec 136 -- cat /etc/haproxy/haproxy.cfg | grep ldc"

# Reload HAProxy
ssh prox "pct exec 136 -- systemctl reload haproxy"
```

---

## 🌍 Working Remotely

### **Development Workflow**

**1. Check Current State**
```bash
# Verify Tailscale connection
tailscale status | grep prox

# Check application health
curl -I https://ldctools.com
curl -I https://blue.ldctools.com
curl -I https://green.ldctools.com
```

**2. Make Changes Locally**
```bash
cd /Users/cory/Documents/Cloudy-Work/applications/ldc-tools
git checkout -b feature/remote-work
# Make changes
git commit -am "feat: Working remotely via Tailscale"
git push origin feature/remote-work
```

**3. Deploy via GitHub Actions**
```bash
# GitHub Actions automatically deploys to STANDBY
# Monitor at: https://github.com/heybearc/ldc-tools/actions
```

**4. Test on STANDBY**
```bash
# Test via Tailscale
curl https://green.ldctools.com

# Or test via browser
open https://green.ldctools.com
```

**5. Release to Production**
```bash
# Use GitHub Actions workflow
# Actions → Run workflow → release-to-prod
```

---

## 🔍 Monitoring via Tailscale

### **Health Checks**
```bash
# Check all environments
echo "=== BLUE ===" && curl -I https://blue.ldctools.com
echo "=== GREEN ===" && curl -I https://green.ldctools.com
echo "=== PROD ===" && curl -I https://ldctools.com
```

### **System Resources**
```bash
# Check container resources
ssh prox "pct status 133"
ssh prox "pct status 135"
ssh prox "pct status 131"

# Check disk usage
ssh prox "pct exec 133 -- df -h"
ssh prox "pct exec 135 -- df -h"
ssh prox "pct exec 131 -- df -h"
```

### **Application Metrics**
```bash
# PM2 metrics
ssh prox "pct exec 133 -- pm2 describe ldc-production"
ssh prox "pct exec 135 -- pm2 describe ldc-production"

# Database connections
ssh prox "pct exec 131 -- sudo -u postgres psql ldc_tools -c 'SELECT count(*) FROM pg_stat_activity;'"
```

---

## 🚨 Emergency Access

### **Quick Health Check**
```bash
#!/bin/bash
# Save as: check-ldc-health.sh

echo "🏥 LDC Tools Health Check (via Tailscale)"
echo "=========================================="

# Tailscale status
echo "Tailscale: $(tailscale status | grep prox | awk '{print $2}')"

# Proxmox
echo "Proxmox: $(ssh prox 'hostname' 2>/dev/null || echo 'OFFLINE')"

# BLUE
BLUE_STATUS=$(ssh prox "pct exec 133 -- pm2 jlist 2>/dev/null | jq -r '.[0].pm2_env.status' 2>/dev/null" || echo "UNKNOWN")
echo "BLUE (133): $BLUE_STATUS"

# GREEN
GREEN_STATUS=$(ssh prox "pct exec 135 -- pm2 jlist 2>/dev/null | jq -r '.[0].pm2_env.status' 2>/dev/null" || echo "UNKNOWN")
echo "GREEN (135): $GREEN_STATUS"

# Database
DB_STATUS=$(ssh prox "pct exec 131 -- sudo -u postgres psql -c 'SELECT 1;' 2>/dev/null" && echo "ONLINE" || echo "OFFLINE")
echo "Database (131): $DB_STATUS"

# Web checks
echo ""
echo "Web Status:"
curl -s -o /dev/null -w "BLUE: %{http_code}\n" https://blue.ldctools.com
curl -s -o /dev/null -w "GREEN: %{http_code}\n" https://green.ldctools.com
curl -s -o /dev/null -w "PROD: %{http_code}\n" https://ldctools.com
```

### **Emergency Restart**
```bash
# Restart everything
ssh prox "pct exec 133 -- pm2 restart ldc-production"
ssh prox "pct exec 135 -- pm2 restart ldc-production"
ssh prox "pct exec 136 -- systemctl reload haproxy"
```

### **Emergency Backup**
```bash
# Quick backup via Tailscale
cd /Users/cory/Documents/Cloudy-Work/applications/ldc-tools
./scripts/create-backup.sh full emergency
```

---

## 🔐 Security Best Practices

### **DO:**
- ✅ Keep Tailscale updated
- ✅ Use SSH keys (no passwords)
- ✅ Monitor Tailscale connections
- ✅ Disconnect when not in use
- ✅ Use MFA on Tailscale account

### **DON'T:**
- ❌ Share Tailscale credentials
- ❌ Leave connections open unnecessarily
- ❌ Bypass Tailscale for direct access
- ❌ Use public WiFi without VPN
- ❌ Store credentials in scripts

---

## 🎯 Tailscale vs Local Network

### **Tailscale (External)**
```bash
# Automatically detected by scripts
./scripts/create-backup.sh full manual
# Output: "Detected Tailscale network"

# Access via Tailscale hostname
ssh prox "hostname"
```

### **Local Network (Internal)**
```bash
# Same commands work
./scripts/create-backup.sh full manual
# Output: "Using local network"

# Direct IP access also works
ssh 10.92.0.5 "hostname"
```

---

## 📊 Performance Considerations

### **Tailscale Performance**
- **Latency**: +10-50ms compared to local
- **Bandwidth**: Depends on internet connection
- **Reliability**: Very stable, auto-reconnects

### **Optimization Tips**
```bash
# Use compression for large transfers
ssh prox "pct exec 133 -- tar -czf - /opt/ldc-tools/frontend" | tar -xzf - -C /tmp/

# Batch commands to reduce round trips
ssh prox "pct exec 133 -- bash -c '
    cd /opt/ldc-tools
    git pull
    npm install
    npm run build
    pm2 restart ldc-production
'"
```

---

## 🆘 Troubleshooting

### **Can't Connect to Tailscale**
```bash
# Check Tailscale status
tailscale status

# Restart Tailscale
sudo tailscale down
sudo tailscale up

# Check network
ping 100.64.0.1  # Tailscale gateway
```

### **Can't Access Proxmox**
```bash
# Test Tailscale connection
tailscale ping prox

# Test SSH
ssh -v prox "echo test"

# Check SSH keys
ssh-add -l
```

### **Slow Performance**
```bash
# Check Tailscale route
tailscale status | grep prox

# Check internet speed
speedtest-cli

# Use direct connection if available
ssh 10.92.0.5 "hostname"  # Local IP
```

---

## 📚 Related Documentation

- **Backup System:** `BACKUP_SYSTEM.md`
- **Apex Guardian:** `APEX_GUARDIAN_SYSTEM.md`
- **Deployment Guide:** `.github/workflows/apex-guardian.yml`
- **SSH Configuration:** `~/.ssh/config`

---

## 🎉 Benefits of Tailscale

1. **Work from Anywhere**
   - Coffee shops
   - Travel
   - Remote locations
   - No VPN setup needed

2. **Secure Access**
   - Encrypted tunnels
   - No exposed ports
   - MFA support
   - Audit logs

3. **Seamless Integration**
   - Works with existing tools
   - No script changes needed
   - Automatic detection
   - Same commands everywhere

4. **Reliable Connection**
   - Auto-reconnects
   - NAT traversal
   - Peer-to-peer when possible
   - Relay fallback

---

**With Tailscale, your homelab is always accessible, securely!** 🌐🔒
