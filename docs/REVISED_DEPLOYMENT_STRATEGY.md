# LDC Construction Tools - Revised Deployment Strategy

## Infrastructure Assessment Results

### Current Proxmox Environment
- **PostgreSQL LXC**: ID 131, IP 10.92.3.21 (2 cores, 4GB RAM, 20GB storage)
- **JW Attendant LXC**: ID 132, IP 10.92.3.22 (2 cores, 2GB RAM, 8GB storage)
- **Next Available IDs**: 133, 134, 135...

### Architecture Decision: **MONOLITHIC DEPLOYMENT** (Recommended)

## Why Monolithic is Optimal

### Current LDC App Analysis
Your LDC Construction Tools currently runs as:
- **Frontend**: Next.js with API routes (integrated backend)
- **Backend**: FastAPI (separate process)
- **Database**: SQLite (file-based)

### Deployment Options Comparison

#### Option 1: Monolithic Next.js App (RECOMMENDED)
```
Single LXC Container (ID: 133)
├── Next.js Frontend (port 3000)
├── API Routes (/api/*)
├── PostgreSQL connection
└── All functionality in one container
```

**Advantages:**
- **Simpler deployment**: One container to manage
- **Lower resource usage**: No inter-container communication overhead
- **Easier maintenance**: Single codebase, single deployment
- **Better performance**: No network latency between frontend/backend
- **Cost effective**: Uses fewer resources

#### Option 2: Separated Frontend + Backend
```
Frontend LXC (133) + Backend LXC (134)
├── Frontend: Next.js (port 3000)
└── Backend: FastAPI (port 8000)
```

**Disadvantages:**
- **Unnecessary complexity**: Your app doesn't need this separation
- **Higher resource usage**: 2 containers vs 1
- **Network overhead**: Frontend → Backend API calls
- **More maintenance**: 2 deployments, 2 configurations

## Recommended Deployment Architecture

### Single LDC Construction Tools LXC
```
Container ID: 133
Hostname: ldc-tools
IP Address: 10.92.3.23
Resources:
  - CPU: 2 cores
  - RAM: 3072MB (3GB)
  - Storage: 10GB
Services:
  - Next.js application (port 3000)
  - Built-in API routes
  - PostgreSQL client connection
Database: Connects to existing PostgreSQL LXC 131
```

### Database Strategy
- **Use existing PostgreSQL LXC 131**: Add `ldc_construction_tools` database
- **Shared database server**: Efficient resource utilization
- **Connection**: `postgresql://ldc_user:password@10.92.3.21:5432/ldc_construction_tools`

## Implementation Plan

### Phase 1: Database Setup (30 minutes)
```sql
-- On PostgreSQL LXC 131
CREATE DATABASE ldc_construction_tools;
CREATE USER ldc_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE ldc_construction_tools TO ldc_user;
```

### Phase 2: Container Creation (15 minutes)
```bash
pct create 133 local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst \
  --hostname ldc-tools \
  --cores 2 \
  --memory 3072 \
  --rootfs hdd-pool:10 \
  --net0 name=eth0,bridge=vmbr0923,gw=10.92.3.1,ip=10.92.3.23/24,type=veth \
  --nameserver 10.92.0.10 \
  --unprivileged 1 \
  --start 1
```

### Phase 3: Application Deployment (45 minutes)
1. **Install Node.js 18**: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && apt install nodejs`
2. **Install PostgreSQL client**: `apt install postgresql-client`
3. **Clone repository**: Deploy LDC Construction Tools code
4. **Configure database**: Update connection string to PostgreSQL
5. **Install dependencies**: `npm install`
6. **Build application**: `npm run build`
7. **Configure PM2**: Process management for auto-restart
8. **Test functionality**: Verify all features work

## Migration Strategy

### Convert FastAPI Backend to Next.js API Routes
Your current FastAPI endpoints can be converted to Next.js API routes:

```javascript
// pages/api/volunteers/index.js
export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get volunteers logic
  } else if (req.method === 'POST') {
    // Create volunteer logic
  }
}
```

### Database Migration
1. **Export current SQLite data**: `sqlite3 database.db .dump > data.sql`
2. **Convert to PostgreSQL format**: Adjust SQL syntax
3. **Import to PostgreSQL**: `psql -h 10.92.3.21 -U ldc_user -d ldc_construction_tools < data.sql`

## Resource Efficiency Comparison

### Monolithic Deployment
- **Total Resources**: 2 cores, 3GB RAM, 10GB storage
- **Network**: Internal database connection only
- **Maintenance**: Single container management

### Separated Deployment  
- **Total Resources**: 4 cores, 4GB RAM, 14GB storage
- **Network**: Frontend ↔ Backend ↔ Database
- **Maintenance**: Multiple container coordination

**Resource Savings**: 50% CPU, 25% RAM, 40% storage

## Access URLs

### Production URLs
- **Application**: http://10.92.3.23:3000
- **API Endpoints**: http://10.92.3.23:3000/api/*
- **Database**: Internal connection to 10.92.3.21:5432

### Development URLs (for testing)
- **Local Development**: http://localhost:3000
- **API Testing**: http://10.92.3.23:3000/api/volunteers

## Security Considerations

### Container Security
- **Unprivileged container**: Enhanced security isolation
- **Firewall**: Allow port 3000 from management network only
- **Database access**: Restricted to application user only

### Application Security
- **Environment variables**: Database credentials in .env
- **API validation**: Input sanitization and validation
- **HTTPS**: Configure SSL certificate for production access

## Monitoring and Maintenance

### Health Checks
- **Application**: `curl http://10.92.3.23:3000/api/health`
- **Database**: `pg_isready -h 10.92.3.21 -U ldc_user`
- **Container**: `pct status 133`

### Backup Strategy
- **Database**: Automated PostgreSQL backups (handled by LXC 131)
- **Application**: Code repository backup
- **Configuration**: Container configuration backup

## Next Steps

1. **Create database** on PostgreSQL LXC 131
2. **Create LXC container** 133 with specifications above
3. **Deploy monolithic application** with Next.js + API routes
4. **Migrate data** from SQLite to PostgreSQL
5. **Test functionality** and performance
6. **Configure monitoring** and backups

**Estimated Deployment Time**: 90 minutes total
**Recommended Approach**: Monolithic deployment for optimal resource usage and simplicity
