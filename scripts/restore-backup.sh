#!/bin/bash

# 🔄 LDC TOOLS RESTORE SYSTEM
# Restores database and application files from backups
# Supports both local (Tailscale) and remote access

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[RESTORE]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
APP_NAME="ldc-tools"
RESTORE_TYPE="${1:-}"  # db, files, full
TIMESTAMP="${2:-}"     # Backup timestamp to restore

# Database configuration
DB_HOST="10.92.3.21"
DB_PORT="5432"
DB_NAME="ldc_tools"
DB_USER="postgres"

# Container configuration
BLUE_CONTAINER="133"
GREEN_CONTAINER="135"
DB_CONTAINER="131"

# Backup paths
BACKUP_BASE="/mnt/data/ldc-tools-backups"

# Check if we're using Tailscale
if ping -c 1 -W 1 100.64.0.0/10 &> /dev/null; then
    print_status "Detected Tailscale network"
    PROXMOX_HOST="prox"
else
    print_status "Using local network"
    PROXMOX_HOST="prox"
fi

# Usage check
if [ -z "$RESTORE_TYPE" ] || [ -z "$TIMESTAMP" ]; then
    echo "Usage: $0 [db|files|full] [timestamp]"
    echo ""
    echo "Examples:"
    echo "  $0 db 20251102_083000"
    echo "  $0 files 20251102_083000"
    echo "  $0 full 20251102_083000"
    echo ""
    echo "Available backups:"
    ssh $PROXMOX_HOST "pct exec $DB_CONTAINER -- bash -c '
        echo \"Database backups:\"
        ls -lh $BACKUP_BASE/database/*/*.sql.gz 2>/dev/null | tail -5 || echo \"  No backups found\"
        echo \"\"
        echo \"Files backups:\"
        ls -lh $BACKUP_BASE/files/*/*.tar.gz 2>/dev/null | tail -5 || echo \"  No backups found\"
    '"
    exit 1
fi

echo "🔄 LDC TOOLS RESTORE SYSTEM"
echo "==========================="
echo "Restore Type: $RESTORE_TYPE"
echo "Timestamp: $TIMESTAMP"
echo ""

# Confirmation prompt
print_warning "⚠️  WARNING: This will overwrite current data!"
read -p "Are you sure you want to proceed? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    print_error "Restore cancelled by user"
    exit 1
fi

# Function to restore database
restore_database() {
    print_status "Searching for database backup..."
    
    # Find the backup file
    BACKUP_FILE=$(ssh $PROXMOX_HOST "pct exec $DB_CONTAINER -- bash -c '
        find $BACKUP_BASE/database -name \"${APP_NAME}_${TIMESTAMP}.sql.gz\" 2>/dev/null | head -1
    '")
    
    if [ -z "$BACKUP_FILE" ]; then
        print_error "Database backup not found for timestamp: $TIMESTAMP"
        return 1
    fi
    
    print_status "Found backup: $BACKUP_FILE"
    
    # Display backup metadata
    ssh $PROXMOX_HOST "pct exec $DB_CONTAINER -- bash -c '
        if [ -f ${BACKUP_FILE}.meta ]; then
            echo \"Backup Metadata:\"
            cat ${BACKUP_FILE}.meta
            echo \"\"
        fi
    '"
    
    # Create a safety backup before restore
    print_status "Creating safety backup of current database..."
    SAFETY_BACKUP="$BACKUP_BASE/database/pre-restore/pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"
    ssh $PROXMOX_HOST "pct exec $DB_CONTAINER -- bash -c '
        mkdir -p $BACKUP_BASE/database/pre-restore
        sudo -u postgres pg_dump $DB_NAME | gzip > $SAFETY_BACKUP
    '"
    print_success "Safety backup created: $SAFETY_BACKUP"
    
    # Restore database
    print_status "Restoring database..."
    print_warning "This will drop and recreate the database!"
    
    ssh $PROXMOX_HOST "pct exec $DB_CONTAINER -- bash -c '
        # Drop existing connections
        sudo -u postgres psql -c \"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '\''$DB_NAME'\'' AND pid <> pg_backend_pid();\"
        
        # Drop and recreate database
        sudo -u postgres dropdb $DB_NAME || true
        sudo -u postgres createdb $DB_NAME
        
        # Restore from backup
        gunzip -c $BACKUP_FILE | sudo -u postgres psql $DB_NAME
    '"
    
    if [ $? -eq 0 ]; then
        print_success "✅ Database restored successfully!"
        return 0
    else
        print_error "❌ Database restore failed!"
        print_warning "Safety backup available at: $SAFETY_BACKUP"
        return 1
    fi
}

# Function to restore files
restore_files() {
    local container=$1
    local container_name=$2
    
    print_status "Searching for files backup for $container_name..."
    
    # Find the backup file
    BACKUP_FILE=$(ssh $PROXMOX_HOST "pct exec $DB_CONTAINER -- bash -c '
        find $BACKUP_BASE/files -name \"${APP_NAME}_${container_name}_${TIMESTAMP}.tar.gz\" 2>/dev/null | head -1
    '")
    
    if [ -z "$BACKUP_FILE" ]; then
        print_error "Files backup not found for $container_name at timestamp: $TIMESTAMP"
        return 1
    fi
    
    print_status "Found backup: $BACKUP_FILE"
    
    # Display backup metadata
    ssh $PROXMOX_HOST "pct exec $DB_CONTAINER -- bash -c '
        if [ -f ${BACKUP_FILE}.meta ]; then
            echo \"Backup Metadata:\"
            cat ${BACKUP_FILE}.meta
            echo \"\"
        fi
    '"
    
    # Create safety backup of current files
    print_status "Creating safety backup of current files..."
    ssh $PROXMOX_HOST "pct exec $container -- bash -c '
        cd /opt/ldc-construction-tools
        tar -czf /tmp/pre-restore-${container_name}-$(date +%Y%m%d_%H%M%S).tar.gz \
            --exclude=node_modules \
            --exclude=.next \
            --exclude=.git \
            frontend/
    '"
    
    # Stop the application
    print_status "Stopping application on $container_name..."
    ssh $PROXMOX_HOST "pct exec $container -- pm2 stop ldc-production" || true
    
    # Restore files
    print_status "Restoring files to $container_name..."
    
    # Copy backup to container
    ssh $PROXMOX_HOST "bash -c '
        pct exec $DB_CONTAINER -- cat $BACKUP_FILE | \
        pct exec $container -- bash -c \"cat > /tmp/restore-backup.tar.gz\"
    '"
    
    # Extract backup
    ssh $PROXMOX_HOST "pct exec $container -- bash -c '
        cd /opt/ldc-construction-tools
        tar -xzf /tmp/restore-backup.tar.gz
        rm /tmp/restore-backup.tar.gz
    '"
    
    # Reinstall dependencies and rebuild
    print_status "Reinstalling dependencies..."
    ssh $PROXMOX_HOST "pct exec $container -- bash -c '
        cd /opt/ldc-construction-tools/frontend
        npm install --legacy-peer-deps
        npm run build
    '"
    
    # Restart application
    print_status "Restarting application..."
    ssh $PROXMOX_HOST "pct exec $container -- bash -c '
        cd /opt/ldc-construction-tools/frontend
        pm2 restart ldc-production
    '"
    
    if [ $? -eq 0 ]; then
        print_success "✅ Files restored successfully on $container_name!"
        return 0
    else
        print_error "❌ Files restore failed on $container_name!"
        return 1
    fi
}

# Function to verify restore
verify_restore() {
    print_status "Verifying restore..."
    
    sleep 5
    
    # Check BLUE
    BLUE_STATUS=$(curl -s -w "%{http_code}" "https://blue.ldctools.com" -o /dev/null 2>/dev/null || echo "000")
    # Check GREEN
    GREEN_STATUS=$(curl -s -w "%{http_code}" "https://green.ldctools.com" -o /dev/null 2>/dev/null || echo "000")
    
    echo ""
    echo "POST-RESTORE HEALTH CHECK:"
    echo "- BLUE (Container $BLUE_CONTAINER): $BLUE_STATUS"
    echo "- GREEN (Container $GREEN_CONTAINER): $GREEN_STATUS"
    echo ""
    
    if [[ "$BLUE_STATUS" =~ ^(200|307|302)$ ]] || [[ "$GREEN_STATUS" =~ ^(200|307|302)$ ]]; then
        print_success "✅ System is responding after restore"
        return 0
    else
        print_warning "⚠️ System may not be responding - check logs"
        return 1
    fi
}

# Main execution
main() {
    case $RESTORE_TYPE in
        "db")
            restore_database
            ;;
        "files")
            restore_files $BLUE_CONTAINER "blue"
            restore_files $GREEN_CONTAINER "green"
            ;;
        "full")
            restore_database
            restore_files $BLUE_CONTAINER "blue"
            restore_files $GREEN_CONTAINER "green"
            ;;
        *)
            print_error "Invalid restore type: $RESTORE_TYPE"
            echo "Usage: $0 [db|files|full] [timestamp]"
            exit 1
            ;;
    esac
    
    # Verify restore
    verify_restore
    
    echo ""
    echo "🔄 RESTORE COMPLETED"
    echo "==================="
    echo ""
    echo "Restored from timestamp: $TIMESTAMP"
    echo "Type: $RESTORE_TYPE"
    echo ""
    print_success "✅ Restore process complete!"
}

# Run main function
main
