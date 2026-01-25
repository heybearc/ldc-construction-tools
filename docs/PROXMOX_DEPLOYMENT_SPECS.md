# LDC Construction Tools - Proxmox Deployment Specifications

## Infrastructure Analysis

Based on your Proxmox infrastructure spec, I can see you have:
- **JW Attendant Scheduler**: Already running Django with SQLite at 10.92.3.22:8000
- **Network**: 10.92.3.0/24 subnet with DNS at 10.92.0.10
- **Storage**: NFS mount `/mnt/pve/nfs-data` available for containers

## PostgreSQL Database Strategy

### Option 1: Extend Existing JW Scheduler Database (RECOMMENDED)
Since your JW Attendant Scheduler is already running with SQLite and planned for PostgreSQL migration, we can:
1. **Upgrade JW Scheduler to PostgreSQL** 
2. **Add LDC Construction Tools database** on the same PostgreSQL instance
3. **Shared PostgreSQL LXC** serving both applications

### Option 2: Dedicated PostgreSQL LXC
Create a separate PostgreSQL container specifically for LDC Construction Tools.

**RECOMMENDATION**: Option 1 - More efficient resource usage and easier maintenance.

## LXC Container Specifications

### 1. PostgreSQL Database LXC (Shared)
```
Container ID: 130 (next available)
Hostname: postgresql-db
IP Address: 10.92.3.20
Resources:
  - CPU: 2 cores
  - RAM: 4096MB (increased from typical 2GB for dual-app usage)
  - Storage: 20GB (hdd-pool:subvol-130-disk-0)
DNS: 10.92.0.10 (primary)
NFS Mount: /mnt/pve/nfs-data → /mnt/data (for backups)
```

### 2. LDC Frontend LXC
```
Container ID: 131
Hostname: ldc-frontend
IP Address: 10.92.3.21
Resources:
  - CPU: 2 cores
  - RAM: 2048MB
  - Storage: 8GB (hdd-pool:subvol-131-disk-0)
DNS: 10.92.0.10 (primary)
Services: Node.js, Next.js frontend
Port: 3000
```

### 3. LDC Backend API LXC
```
Container ID: 132
Hostname: ldc-backend
IP Address: 10.92.3.22 (NOTE: JW Scheduler currently uses this)
Alternative IP: 10.92.3.23
Resources:
  - CPU: 2 cores
  - RAM: 2048MB
  - Storage: 6GB (hdd-pool:subvol-132-disk-0)
DNS: 10.92.0.10 (primary)
Services: FastAPI, Python backend
Port: 8000
```

## Resource Requirements Assessment

### Current Infrastructure Impact
Your existing containers are well within capacity:
- **Transmission**: 2 cores, 2048MB RAM
- **SABnzbd**: 2 cores, 2048MB RAM  
- **Readarr**: 2 cores, 1024MB RAM
- **Sonarr**: 2 cores, 1024MB RAM

### Additional Resources Needed
```
Total Additional:
- CPU: 6 cores (PostgreSQL: 2, Frontend: 2, Backend: 2)
- RAM: 8192MB (PostgreSQL: 4GB, Frontend: 2GB, Backend: 2GB)
- Storage: 34GB (PostgreSQL: 20GB, Frontend: 8GB, Backend: 6GB)
```

### Resource Recommendation
**Current setup should handle this easily** - your Proxmox host appears to have sufficient resources based on existing container allocation patterns.

## Network Configuration

### Service Access URLs
- **Frontend**: http://10.92.3.21:3000
- **Backend API**: http://10.92.3.23:8000  
- **PostgreSQL**: 10.92.3.20:5432 (internal only)

### DNS Requirements
All containers must use `10.92.0.10` as primary DNS per your infrastructure standards.

## Database Configuration

### PostgreSQL Setup
```sql
-- Create databases
CREATE DATABASE ldc_tools;
CREATE DATABASE jw_attendant_scheduler;

-- Create users
CREATE USER ldc_user WITH PASSWORD 'secure_password_here';
CREATE USER jw_user WITH PASSWORD 'secure_password_here';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE ldc_tools TO ldc_user;
GRANT ALL PRIVILEGES ON DATABASE jw_attendant_scheduler TO jw_user;
```

### Connection Strings
```
LDC Tools: postgresql://ldc_user:password@10.92.3.20:5432/ldc_tools
JW Attendant Scheduler: postgresql://jw_user:password@10.92.3.20:5432/jw_attendant_scheduler
```

## Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend LXC  │    │   Backend LXC   │    │ PostgreSQL LXC  │
│   10.92.3.21    │    │   10.92.3.23    │    │   10.92.3.20    │
│   Next.js :3000 │◄──►│  FastAPI :8000  │◄──►│ PostgreSQL :5432│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   NFS Storage   │
                    │ /mnt/pve/nfs-data│
                    │   (Backups)     │
                    └─────────────────┘
```
