# LDC Construction Tools - Human Deployment Todo List

## Proxmox Container Setup Tasks

### 1. PostgreSQL Database Container
**Container ID: 130**
```bash
# Create LXC container
pct create 130 local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst \
  --hostname postgresql-db \
  --cores 2 \
  --memory 4096 \
  --rootfs hdd-pool:20 \
  --net0 name=eth0,bridge=vmbr0,ip=10.92.3.20/24,gw=10.92.0.1 \
  --nameserver 10.92.0.10 \
  --mp0 /mnt/pve/nfs-data,mp=/mnt/data \
  --unprivileged 1 \
  --start 1
```

**Setup Tasks:**
- [ ] Create container with above specifications
- [ ] Install PostgreSQL 15: `apt update && apt install postgresql-15 postgresql-contrib`
- [ ] Configure PostgreSQL to listen on all interfaces
- [ ] Create databases: `ldc_tools` and `jw_attendant_scheduler`
- [ ] Create users with secure passwords
- [ ] Configure firewall to allow port 5432 from 10.92.3.0/24
- [ ] Set up automated backups to `/mnt/data/backups/postgresql/`

### 2. LDC Frontend Container  
**Container ID: 131**
```bash
# Create LXC container
pct create 131 local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst \
  --hostname ldc-frontend \
  --cores 2 \
  --memory 2048 \
  --rootfs hdd-pool:8 \
  --net0 name=eth0,bridge=vmbr0,ip=10.92.3.21/24,gw=10.92.0.1 \
  --nameserver 10.92.0.10 \
  --unprivileged 1 \
  --start 1
```

**Setup Tasks:**
- [ ] Create container with above specifications
- [ ] Install Node.js 18 LTS: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && apt install nodejs`
- [ ] Install PM2 for process management: `npm install -g pm2`
- [ ] Configure firewall to allow port 3000
- [ ] Create deployment directory: `/opt/ldc-frontend/`
- [ ] Set up systemd service for auto-start

### 3. LDC Backend Container
**Container ID: 132**  
```bash
# Create LXC container
pct create 132 local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst \
  --hostname ldc-backend \
  --cores 2 \
  --memory 2048 \
  --rootfs hdd-pool:6 \
  --net0 name=eth0,bridge=vmbr0,ip=10.92.3.23/24,gw=10.92.0.1 \
  --nameserver 10.92.0.10 \
  --unprivileged 1 \
  --start 1
```

**Setup Tasks:**
- [ ] Create container with above specifications  
- [ ] Install Python 3.11: `apt update && apt install python3.11 python3.11-venv python3-pip`
- [ ] Install PostgreSQL client: `apt install postgresql-client`
- [ ] Configure firewall to allow port 8000
- [ ] Create deployment directory: `/opt/ldc-backend/`
- [ ] Set up systemd service for FastAPI with uvicorn

## Network Configuration Tasks

### DNS and Connectivity
- [ ] Verify all containers can resolve DNS through 10.92.0.10
- [ ] Test connectivity between containers:
  - Frontend (10.92.3.21) → Backend (10.92.3.23:8000)
  - Backend (10.92.3.23) → PostgreSQL (10.92.3.20:5432)
- [ ] Configure reverse proxy (optional) for external access

### Firewall Rules
- [ ] PostgreSQL (130): Allow 5432 from 10.92.3.0/24 only
- [ ] Frontend (131): Allow 3000 from your management network
- [ ] Backend (132): Allow 8000 from 10.92.3.21 (frontend) and management network

## Database Migration Tasks

### PostgreSQL Database Setup
- [ ] Create `ldc_tools` database
- [ ] Create `ldc_user` with secure password
- [ ] Grant appropriate permissions
- [ ] Test connection from backend container
- [ ] Import current SQLite data (if needed)

### JW Scheduler Migration (Optional)
- [ ] Migrate JW Attendant Scheduler from SQLite to PostgreSQL
- [ ] Update JW Scheduler connection string
- [ ] Test JW Scheduler functionality
- [ ] Backup SQLite data before migration

## Application Deployment Tasks

### Backend Deployment
- [ ] Clone LDC Construction Tools repository to backend container
- [ ] Install Python dependencies: `pip install -r requirements.txt`
- [ ] Update database connection string to PostgreSQL
- [ ] Run database migrations/table creation
- [ ] Test API endpoints
- [ ] Configure systemd service for auto-start

### Frontend Deployment  
- [ ] Clone repository to frontend container
- [ ] Install Node.js dependencies: `npm install`
- [ ] Update API endpoint configuration (point to 10.92.3.23:8000)
- [ ] Build production bundle: `npm run build`
- [ ] Configure PM2 for process management
- [ ] Test frontend functionality

## Testing and Validation

### Connectivity Tests
- [ ] Test frontend loads at http://10.92.3.21:3000
- [ ] Test backend API at http://10.92.3.23:8000/docs
- [ ] Test database connectivity from backend
- [ ] Test CSV import/export functionality
- [ ] Test volunteer management features

### Performance Validation
- [ ] Monitor container resource usage
- [ ] Test with sample data import
- [ ] Verify mobile responsiveness
- [ ] Check page load times

## Security and Backup

### Security Configuration
- [ ] Change default passwords for database users
- [ ] Configure SSL/TLS certificates (if external access needed)
- [ ] Set up container access logging
- [ ] Review and lock down unnecessary services

### Backup Strategy
- [ ] Configure PostgreSQL automated backups to NFS storage
- [ ] Set up application code backups
- [ ] Test backup restoration process
- [ ] Document backup and recovery procedures

## Resource Monitoring

### Check if Resource Increases Needed
**Current allocation adds:**
- 6 CPU cores total
- 8GB RAM total  
- 34GB storage total

**Monitor these metrics after deployment:**
- [ ] CPU usage across all containers
- [ ] Memory utilization
- [ ] Disk I/O performance
- [ ] Network bandwidth usage

**Increase resources if you see:**
- CPU usage consistently >80%
- Memory usage >90%
- Slow database queries
- High disk I/O wait times

## Post-Deployment Tasks

### Documentation
- [ ] Update infrastructure spec with new container details
- [ ] Document connection strings and credentials
- [ ] Create operational runbook for maintenance
- [ ] Update network diagram

### User Access
- [ ] Provide access URLs to end users
- [ ] Create user accounts and permissions
- [ ] Conduct user training sessions
- [ ] Set up support procedures

---

## Quick Command Reference

### Container Management
```bash
# Start containers
pct start 130 131 132

# Check status
pct status 130 131 132

# Enter container
pct enter 130
```

### Service Management (inside containers)
```bash
# Check services
systemctl status postgresql    # PostgreSQL container
systemctl status ldc-backend   # Backend container  
pm2 status                     # Frontend container
```

### Database Access
```bash
# Connect to PostgreSQL
psql -h 10.92.3.20 -U ldc_user -d ldc_tools
```

**Estimated Setup Time: 4-6 hours**  
**Recommended Order: PostgreSQL → Backend → Frontend → Testing**
