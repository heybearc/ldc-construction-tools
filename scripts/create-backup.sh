#!/bin/bash

# 🛡️ LDC TOOLS BACKUP SYSTEM
# Creates comprehensive backups of database and application files
# Supports both local (Tailscale) and remote access

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[BACKUP]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
APP_NAME="ldc-tools"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_TYPE="${1:-full}"  # full, db-only, files-only
BACKUP_REASON="${2:-manual}"  # manual, pre-migration, pre-deployment, pre-release

# Database configuration
DB_HOST="10.92.3.21"
DB_PORT="5432"
DB_NAME="ldc_tools"
DB_USER="postgres"

# Container configuration
BLUE_CONTAINER="133"
GREEN_CONTAINER="135"
DB_CONTAINER="131"

# Backup paths (on database server)
BACKUP_BASE="/mnt/data/ldc-tools-backups"
DB_BACKUP_DIR="$BACKUP_BASE/database/$BACKUP_REASON"
FILES_BACKUP_DIR="$BACKUP_BASE/files/$BACKUP_REASON"

# Check if we're using Tailscale (external access)
if ping -c 1 -W 1 100.64.0.0/10 &> /dev/null; then
    print_status "Detected Tailscale network - using Tailscale routes"
    PROXMOX_HOST="prox"  # Tailscale hostname
else
    print_status "Using local network"
    PROXMOX_HOST="prox"
fi

echo "🛡️ LDC TOOLS BACKUP SYSTEM"
echo "=========================="
echo "Timestamp: $TIMESTAMP"
echo "Type: $BACKUP_TYPE"
echo "Reason: $BACKUP_REASON"
echo ""

# Function to create database backup
backup_database() {
    print_status "Creating database backup..."
    
    # Create backup directory on database server
    ssh $PROXMOX_HOST "pct exec $DB_CONTAINER -- mkdir -p $DB_BACKUP_DIR"
    
    # Create database dump
    BACKUP_FILE="$DB_BACKUP_DIR/${APP_NAME}_${TIMESTAMP}.sql.gz"
    
    ssh $PROXMOX_HOST "pct exec $DB_CONTAINER -- bash -c '
        sudo -u postgres pg_dump $DB_NAME | gzip > $BACKUP_FILE
    '"
    
    if [ $? -eq 0 ]; then
        # Get backup size
        BACKUP_SIZE=$(ssh $PROXMOX_HOST "pct exec $DB_CONTAINER -- du -h $BACKUP_FILE | cut -f1")
        print_success "Database backup created: $BACKUP_FILE ($BACKUP_SIZE)"
        
        # Create backup metadata
        ssh $PROXMOX_HOST "pct exec $DB_CONTAINER -- bash -c '
            cat > ${BACKUP_FILE}.meta << EOF
BACKUP_TIMESTAMP=$TIMESTAMP
BACKUP_TYPE=$BACKUP_TYPE
BACKUP_REASON=$BACKUP_REASON
DATABASE_NAME=$DB_NAME
DATABASE_HOST=$DB_HOST
CREATED_BY=$(whoami)@$(hostname)
BACKUP_SIZE=$BACKUP_SIZE
EOF
        '"
        
        return 0
    else
        print_error "Database backup failed!"
        return 1
    fi
}

# Function to backup application files
backup_files() {
    local container=$1
    local container_name=$2
    
    print_status "Creating filesystem backup for $container_name (Container $container)..."
    
    # Create backup directory
    ssh $PROXMOX_HOST "pct exec $DB_CONTAINER -- mkdir -p $FILES_BACKUP_DIR"
    
    # Create tarball of application files
    BACKUP_FILE="$FILES_BACKUP_DIR/${APP_NAME}_${container_name}_${TIMESTAMP}.tar.gz"
    
    ssh $PROXMOX_HOST "pct exec $container -- bash -c '
        cd /opt/ldc-tools
        tar -czf /tmp/ldc-backup-${container_name}.tar.gz \
            --exclude=node_modules \
            --exclude=.next \
            --exclude=.git \
            frontend/
    '"
    
    # Move to backup location
    ssh $PROXMOX_HOST "pct exec $container -- bash -c '
        mv /tmp/ldc-backup-${container_name}.tar.gz /mnt/data/ldc-tools-backups/files/$BACKUP_REASON/
    '" 2>/dev/null || {
        # If direct move fails, copy via database container
        ssh $PROXMOX_HOST "bash -c '
            pct exec $container -- cat /tmp/ldc-backup-${container_name}.tar.gz | \
            pct exec $DB_CONTAINER -- bash -c \"cat > $BACKUP_FILE\"
            pct exec $container -- rm /tmp/ldc-backup-${container_name}.tar.gz
        '"
    }
    
    if [ $? -eq 0 ]; then
        BACKUP_SIZE=$(ssh $PROXMOX_HOST "pct exec $DB_CONTAINER -- du -h $BACKUP_FILE | cut -f1")
        print_success "Files backup created: $BACKUP_FILE ($BACKUP_SIZE)"
        
        # Get current git info
        GIT_BRANCH=$(ssh $PROXMOX_HOST "pct exec $container -- bash -c 'cd /opt/ldc-tools && git branch --show-current'")
        GIT_COMMIT=$(ssh $PROXMOX_HOST "pct exec $container -- bash -c 'cd /opt/ldc-tools && git rev-parse HEAD'")
        
        # Create metadata
        ssh $PROXMOX_HOST "pct exec $DB_CONTAINER -- bash -c '
            cat > ${BACKUP_FILE}.meta << EOF
BACKUP_TIMESTAMP=$TIMESTAMP
BACKUP_TYPE=$BACKUP_TYPE
BACKUP_REASON=$BACKUP_REASON
CONTAINER=$container
CONTAINER_NAME=$container_name
GIT_BRANCH=$GIT_BRANCH
GIT_COMMIT=$GIT_COMMIT
CREATED_BY=$(whoami)@$(hostname)
BACKUP_SIZE=$BACKUP_SIZE
EOF
        '"
        
        return 0
    else
        print_error "Files backup failed for $container_name!"
        return 1
    fi
}

# Function to create git safety tag
create_git_tag() {
    print_status "Creating git safety tag..."
    
    cd /Users/cory/Documents/Cloudy-Work/applications/ldc-tools
    
    TAG_NAME="backup-${BACKUP_REASON}-${TIMESTAMP}"
    git tag -a "$TAG_NAME" -m "Backup checkpoint: $BACKUP_REASON at $TIMESTAMP"
    git push origin --tags
    
    print_success "Git tag created: $TAG_NAME"
}

# Function to verify system health before backup
verify_health() {
    print_status "Verifying system health..."
    
    # Check BLUE
    BLUE_STATUS=$(curl -s -w "%{http_code}" "https://blue.ldctools.com" -o /dev/null 2>/dev/null || echo "000")
    # Check GREEN
    GREEN_STATUS=$(curl -s -w "%{http_code}" "https://green.ldctools.com" -o /dev/null 2>/dev/null || echo "000")
    
    echo ""
    echo "SYSTEM HEALTH CHECK:"
    echo "- BLUE (Container $BLUE_CONTAINER): $BLUE_STATUS"
    echo "- GREEN (Container $GREEN_CONTAINER): $GREEN_STATUS"
    echo ""
    
    if [[ "$BLUE_STATUS" =~ ^(200|307|302)$ ]] || [[ "$GREEN_STATUS" =~ ^(200|307|302)$ ]]; then
        print_success "✅ At least one environment is healthy"
        return 0
    else
        print_warning "⚠️ Both environments may be down - backup will proceed anyway"
        return 0
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    print_status "Cleaning up old backups (keeping last 10)..."
    
    # Cleanup database backups
    ssh $PROXMOX_HOST "pct exec $DB_CONTAINER -- bash -c '
        cd $DB_BACKUP_DIR 2>/dev/null || exit 0
        ls -t *.sql.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
        ls -t *.sql.gz.meta 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
    '"
    
    # Cleanup files backups
    ssh $PROXMOX_HOST "pct exec $DB_CONTAINER -- bash -c '
        cd $FILES_BACKUP_DIR 2>/dev/null || exit 0
        ls -t *.tar.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
        ls -t *.tar.gz.meta 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
    '"
    
    print_success "Old backups cleaned up"
}

# Function to display backup summary
display_summary() {
    echo ""
    echo "🛡️ BACKUP COMPLETED SUCCESSFULLY"
    echo "================================="
    echo ""
    echo "Backup Details:"
    echo "- Timestamp: $TIMESTAMP"
    echo "- Type: $BACKUP_TYPE"
    echo "- Reason: $BACKUP_REASON"
    echo ""
    echo "Backup Locations (on Container $DB_CONTAINER):"
    echo "- Database: $DB_BACKUP_DIR/"
    echo "- Files: $FILES_BACKUP_DIR/"
    echo ""
    echo "Restore Instructions:"
    echo "- Database: ./scripts/restore-backup.sh db $TIMESTAMP"
    echo "- Files: ./scripts/restore-backup.sh files $TIMESTAMP"
    echo "- Full: ./scripts/restore-backup.sh full $TIMESTAMP"
    echo ""
    echo "Git Tag: backup-${BACKUP_REASON}-${TIMESTAMP}"
    echo ""
    print_success "✅ Backup complete - safe to proceed with changes"
}

# Main execution
main() {
    # Verify health
    verify_health
    
    # Create git tag
    create_git_tag
    
    # Perform backup based on type
    case $BACKUP_TYPE in
        "full")
            backup_database
            backup_files $BLUE_CONTAINER "blue"
            backup_files $GREEN_CONTAINER "green"
            ;;
        "db-only")
            backup_database
            ;;
        "files-only")
            backup_files $BLUE_CONTAINER "blue"
            backup_files $GREEN_CONTAINER "green"
            ;;
        *)
            print_error "Invalid backup type: $BACKUP_TYPE"
            echo "Usage: $0 [full|db-only|files-only] [manual|pre-migration|pre-deployment|pre-release]"
            exit 1
            ;;
    esac
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Display summary
    display_summary
}

# Run main function
main
