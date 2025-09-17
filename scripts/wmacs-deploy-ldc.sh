#!/bin/bash

# WMACS Deployment Script for LDC Construction Tools
# Usage: ./scripts/wmacs-deploy-ldc.sh [staging|production] [release_hash] [reason]

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Validate arguments
if [ $# -lt 3 ]; then
    error "Usage: $0 [staging|production] [release_hash] [reason]"
    error "Example: $0 staging abc123f 'Deploy Phase 2 assignment workflow'"
    exit 1
fi

ENVIRONMENT="$1"
RELEASE_HASH="$2"
REASON="$3"

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    error "Environment must be 'staging' or 'production'"
    exit 1
fi

# Set environment-specific variables
if [ "$ENVIRONMENT" = "staging" ]; then
    TARGET_HOST="10.92.3.25"
    CONTAINER_ID="135"
    DB_NAME="ldc_construction_tools_staging"
    PORT_FRONTEND="3001"
    PORT_BACKEND="8000"
else
    TARGET_HOST="10.92.3.23"
    CONTAINER_ID="133"
    DB_NAME="ldc_construction_tools"
    PORT_FRONTEND="3001"
    PORT_BACKEND="8000"
fi

log "Starting WMACS deployment to $ENVIRONMENT"
log "Target: $TARGET_HOST (Container $CONTAINER_ID)"
log "Release: $RELEASE_HASH"
log "Reason: $REASON"

# Credit budget tracking
DEPLOYMENT_START_TIME=$(date +%s)
log "Tracking credit usage for deployment..."

# Guardian protection wrapper
guardian_execute() {
    local operation="$1"
    local command="$2"
    
    log "Guardian: Executing $operation"
    
    # Use Guardian for protected execution
    if command -v node >/dev/null 2>&1 && [ -f "$PROJECT_ROOT/wmacs-guardian-ldc.js" ]; then
        node "$PROJECT_ROOT/wmacs-guardian-ldc.js" executeWithGuardian "$operation" "$ENVIRONMENT" "$command"
    else
        warning "Guardian not available, executing directly"
        eval "$command"
    fi
}

# Pre-deployment validation
log "Validating deployment prerequisites..."

# Check SSH connectivity
if ! ssh -o ConnectTimeout=10 root@$TARGET_HOST "echo 'SSH OK'" >/dev/null 2>&1; then
    error "Cannot connect to $TARGET_HOST via SSH"
    exit 1
fi

# Check if release exists locally (for artifact upload)
if [ ! -d "$PROJECT_ROOT/artifacts/ldc-construction-tools-$RELEASE_HASH" ] && [ ! -d "$PROJECT_ROOT" ]; then
    error "Release $RELEASE_HASH not found locally"
    exit 1
fi

# Create release directory on target
log "Creating release directory on $TARGET_HOST..."
ssh root@$TARGET_HOST "mkdir -p /opt/ldc-construction-tools/releases/$RELEASE_HASH"

# Upload release artifacts
log "Uploading release artifacts..."
if [ -d "$PROJECT_ROOT/artifacts/ldc-construction-tools-$RELEASE_HASH" ]; then
    # Upload from artifacts (CI/CD build)
    scp -r "$PROJECT_ROOT/artifacts/ldc-construction-tools-$RELEASE_HASH/"* root@$TARGET_HOST:/opt/ldc-construction-tools/releases/$RELEASE_HASH/
else
    # Upload current codebase (manual deployment)
    rsync -avz --exclude='.git' --exclude='node_modules' --exclude='__pycache__' \
          "$PROJECT_ROOT/" root@$TARGET_HOST:/opt/ldc-construction-tools/releases/$RELEASE_HASH/
fi

# Setup environment on target
log "Setting up environment on target..."
ssh root@$TARGET_HOST << EOF
cd /opt/ldc-construction-tools/releases/$RELEASE_HASH

# Backend setup
if [ -d "backend" ]; then
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Frontend setup
if [ -d "frontend" ]; then
    cd frontend
    if [ -f "package.json" ]; then
        npm ci --production
    fi
    cd ..
fi

# Create environment configuration
cat > .env.local << EOL
DATABASE_URL=postgresql://ldc_user:ldc_password@10.92.3.21:5432/$DB_NAME
NODE_ENV=production
PORT=$PORT_FRONTEND
BACKEND_PORT=$PORT_BACKEND
ENVIRONMENT=$ENVIRONMENT
RELEASE_HASH=$RELEASE_HASH
DEPLOYMENT_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
EOL

# Create deployment metadata
cat > deployment-metadata.json << EOL
{
  "release_hash": "$RELEASE_HASH",
  "environment": "$ENVIRONMENT",
  "deployment_time": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "reason": "$REASON",
  "deployed_by": "wmacs-deploy-ldc.sh",
  "target_host": "$TARGET_HOST",
  "container_id": "$CONTAINER_ID"
}
EOL

EOF

# Stop current services gracefully
log "Stopping current services..."
guardian_execute "service-stop" "ssh root@$TARGET_HOST 'systemctl stop ldc-frontend ldc-backend || pkill -f \"ldc\" || true'"

# Update symlink atomically
log "Updating symlink to new release..."
guardian_execute "symlink-update" "ssh root@$TARGET_HOST 'ln -sfn /opt/ldc-construction-tools/releases/$RELEASE_HASH /opt/ldc-construction-tools/current-new && mv /opt/ldc-construction-tools/current-new /opt/ldc-construction-tools/current'"

# Start services
log "Starting services..."
guardian_execute "service-start" "ssh root@$TARGET_HOST << 'EOF'
cd /opt/ldc-construction-tools/current

# Start backend
if [ -d \"backend\" ]; then
    cd backend
    source venv/bin/activate
    nohup uvicorn app.main:app --host 0.0.0.0 --port $PORT_BACKEND > /var/log/ldc-backend.log 2>&1 &
    cd ..
fi

# Start frontend
if [ -d \"frontend\" ]; then
    cd frontend
    NODE_ENV=production PORT=$PORT_FRONTEND nohup npm start > /var/log/ldc-frontend.log 2>&1 &
    cd ..
fi
EOF"

# Wait for services to start
log "Waiting for services to initialize..."
sleep 15

# Health checks
log "Performing health checks..."
HEALTH_CHECK_FAILED=0

# Frontend health check
if ! curl -f -s -o /dev/null "http://$TARGET_HOST:$PORT_FRONTEND/" --max-time 10; then
    error "Frontend health check failed"
    HEALTH_CHECK_FAILED=1
else
    success "Frontend health check passed"
fi

# Backend health check
if ! curl -f -s -o /dev/null "http://$TARGET_HOST:$PORT_BACKEND/api/v1/health" --max-time 10; then
    error "Backend health check failed"
    HEALTH_CHECK_FAILED=1
else
    success "Backend health check passed"
fi

# API functionality check
if ! curl -f -s -o /dev/null "http://$TARGET_HOST:$PORT_BACKEND/api/v1/trade-teams?limit=1" --max-time 10; then
    warning "API functionality check failed (may be expected for new deployments)"
else
    success "API functionality check passed"
fi

# Verify current release
CURRENT_RELEASE=$(ssh root@$TARGET_HOST "readlink /opt/ldc-construction-tools/current | xargs basename")
if [ "$CURRENT_RELEASE" = "$RELEASE_HASH" ]; then
    success "Symlink verification passed: $CURRENT_RELEASE"
else
    error "Symlink verification failed: expected $RELEASE_HASH, got $CURRENT_RELEASE"
    HEALTH_CHECK_FAILED=1
fi

# Calculate deployment time and credit usage
DEPLOYMENT_END_TIME=$(date +%s)
DEPLOYMENT_DURATION=$((DEPLOYMENT_END_TIME - DEPLOYMENT_START_TIME))
CREDIT_USAGE=2.0  # Standard deployment cost

# Log deployment result
DEPLOYMENT_STATUS="success"
if [ $HEALTH_CHECK_FAILED -eq 1 ]; then
    DEPLOYMENT_STATUS="partial_failure"
    warning "Deployment completed with health check failures"
else
    success "Deployment completed successfully"
fi

# Update credit budget
if [ -f "$PROJECT_ROOT/.wmacs/credit-budget.json" ]; then
    log "Updating credit budget..."
    # This would update the credit budget file
    # For now, just log the usage
    log "Credit usage: $CREDIT_USAGE credits"
    log "Deployment duration: ${DEPLOYMENT_DURATION}s"
fi

# Cleanup old releases (keep last 5)
log "Cleaning up old releases..."
ssh root@$TARGET_HOST "cd /opt/ldc-construction-tools/releases && ls -t | tail -n +6 | xargs -r rm -rf"

# Final status report
log "=== DEPLOYMENT SUMMARY ==="
log "Environment: $ENVIRONMENT"
log "Release: $RELEASE_HASH"
log "Target: $TARGET_HOST"
log "Duration: ${DEPLOYMENT_DURATION}s"
log "Status: $DEPLOYMENT_STATUS"
log "Credit Usage: $CREDIT_USAGE"
log "Reason: $REASON"

if [ $HEALTH_CHECK_FAILED -eq 0 ]; then
    success "WMACS deployment completed successfully!"
    log "Frontend: http://$TARGET_HOST:$PORT_FRONTEND/"
    log "Backend: http://$TARGET_HOST:$PORT_BACKEND/api/v1/health"
    exit 0
else
    error "WMACS deployment completed with issues!"
    log "Check service logs: ssh root@$TARGET_HOST 'tail -f /var/log/ldc-*.log'"
    exit 1
fi
