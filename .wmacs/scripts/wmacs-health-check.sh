#!/bin/bash

# WMACS Guardian Health Check Script
# Repository-isolated health monitoring for LDC Construction Tools

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
SSH_KEY="$PROJECT_ROOT/.wmacs/ssh-keys/id_rsa"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}✅${NC} $1"; }
error() { echo -e "${RED}❌${NC} $1"; }
warning() { echo -e "${YELLOW}⚠️${NC} $1"; }

log "🛡️ WMACS Guardian Health Check - LDC Construction Tools"
log "=================================================="

# Check SSH connectivity
log "Testing SSH connectivity..."

if ssh -i "$SSH_KEY" -o ConnectTimeout=10 -o StrictHostKeyChecking=no root@10.92.3.25 "echo 'staging-ok'" >/dev/null 2>&1; then
    success "Staging SSH (10.92.3.25): Connected"
else
    error "Staging SSH (10.92.3.25): Failed"
    exit 1
fi

if ssh -i "$SSH_KEY" -o ConnectTimeout=10 -o StrictHostKeyChecking=no root@10.92.3.23 "echo 'production-ok'" >/dev/null 2>&1; then
    success "Production SSH (10.92.3.23): Connected"
else
    error "Production SSH (10.92.3.23): Failed"
    exit 1
fi

# Check services
log "Checking service status..."

# Staging services
STAGING_FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://10.92.3.25:3001/ --max-time 10 || echo "000")
STAGING_BACKEND=$(curl -s -o /dev/null -w "%{http_code}" http://10.92.3.25:8000/ --max-time 10 || echo "000")

if [[ "$STAGING_FRONTEND" =~ ^(200|302)$ ]]; then
    success "Staging Frontend (3001): Running"
else
    warning "Staging Frontend (3001): HTTP $STAGING_FRONTEND"
fi

if [[ "$STAGING_BACKEND" =~ ^(200|302)$ ]]; then
    success "Staging Backend (8000): Running"
else
    warning "Staging Backend (8000): HTTP $STAGING_BACKEND"
fi

# Production services
PRODUCTION_FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://10.92.3.23:3000/ --max-time 10 || echo "000")
PRODUCTION_BACKEND=$(curl -s -o /dev/null -w "%{http_code}" http://10.92.3.23:8000/ --max-time 10 || echo "000")

if [[ "$PRODUCTION_FRONTEND" =~ ^(200|302)$ ]]; then
    success "Production Frontend (3000): Running"
else
    warning "Production Frontend (3000): HTTP $PRODUCTION_FRONTEND"
fi

if [[ "$PRODUCTION_BACKEND" =~ ^(200|302)$ ]]; then
    success "Production Backend (8000): Running"
else
    warning "Production Backend (8000): HTTP $PRODUCTION_BACKEND"
fi

# Database connectivity test
log "Testing database connectivity..."

DB_TEST=$(ssh -i "$SSH_KEY" root@10.92.3.25 "cd /opt/ldc-construction-tools/backend && python3 -c \"import psycopg2; conn = psycopg2.connect(host='10.92.3.21', database='ldc_construction_tools_staging', user='ldc_user', password='ldc_password'); print('OK'); conn.close()\"" 2>/dev/null || echo "FAILED")

if [[ "$DB_TEST" == "OK" ]]; then
    success "Database (10.92.3.21): Connected"
else
    error "Database (10.92.3.21): Failed"
fi

# Process monitoring
log "Checking running processes..."

STAGING_PROCESSES=$(ssh -i "$SSH_KEY" root@10.92.3.25 "ps aux | grep -E '(next-server|uvicorn)' | grep -v grep | wc -l")
PRODUCTION_PROCESSES=$(ssh -i "$SSH_KEY" root@10.92.3.23 "ps aux | grep -E '(next-server|python3.*uvicorn)' | grep -v grep | wc -l")

success "Staging processes: $STAGING_PROCESSES running"
success "Production processes: $PRODUCTION_PROCESSES running"

log "=================================================="
log "🛡️ WMACS Guardian Health Check Complete"

# Summary
TOTAL_CHECKS=6
PASSED_CHECKS=0

[[ "$STAGING_FRONTEND" =~ ^(200|302)$ ]] && ((PASSED_CHECKS++))
[[ "$STAGING_BACKEND" =~ ^(200|302)$ ]] && ((PASSED_CHECKS++))
[[ "$PRODUCTION_FRONTEND" =~ ^(200|302)$ ]] && ((PASSED_CHECKS++))
[[ "$PRODUCTION_BACKEND" =~ ^(200|302)$ ]] && ((PASSED_CHECKS++))
[[ "$DB_TEST" == "OK" ]] && ((PASSED_CHECKS++))
[[ "$STAGING_PROCESSES" -gt 0 ]] && ((PASSED_CHECKS++))

if [ $PASSED_CHECKS -eq $TOTAL_CHECKS ]; then
    success "All systems operational ($PASSED_CHECKS/$TOTAL_CHECKS)"
    exit 0
else
    warning "Some issues detected ($PASSED_CHECKS/$TOTAL_CHECKS)"
    exit 1
fi
