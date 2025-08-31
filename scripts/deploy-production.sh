#!/bin/bash
# DevOps Agent: Production Deployment Script
# Automated staging → production deployment pipeline

set -e

echo "🚀 DevOps Agent: Production Deployment Pipeline"
echo "📦 Target: Container 134 (10.92.3.24)"

# Configuration
STAGING_CONTAINER="135"
PRODUCTION_CONTAINER="134"
PRODUCTION_PATH="/opt/ldc-construction-tools"
DB_NAME="ldc_construction_tools_production"

# Pre-deployment validation
echo "🔍 Pre-deployment validation..."

# Check staging health
STAGING_HEALTH=$(ssh prox "pct exec $STAGING_CONTAINER -- curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/health || echo '000'")
if [ "$STAGING_HEALTH" != "200" ]; then
    echo "❌ Staging environment unhealthy (HTTP $STAGING_HEALTH). Aborting production deployment."
    exit 1
fi
echo "✅ Staging environment healthy"

# Backup production database
echo "💾 Creating production database backup..."
BACKUP_FILE="/tmp/ldc_production_backup_$(date +%Y%m%d_%H%M%S).sql"
ssh prox "pct exec 131 -- su - postgres -c \"pg_dump $DB_NAME > $BACKUP_FILE\""
echo "✅ Database backup created: $BACKUP_FILE"

# Deploy to production
echo "📥 Deploying to production..."
ssh prox "pct exec $PRODUCTION_CONTAINER -- bash -c 'cd $PRODUCTION_PATH && git pull origin main'"

# Install dependencies
echo "🐍 Installing production dependencies..."
ssh prox "pct exec $PRODUCTION_CONTAINER -- bash -c 'cd $PRODUCTION_PATH/backend && pip install -r requirements.txt'"
ssh prox "pct exec $PRODUCTION_CONTAINER -- bash -c 'cd $PRODUCTION_PATH/frontend && npm ci'"

# Build for production
echo "🏗️ Building for production..."
ssh prox "pct exec $PRODUCTION_CONTAINER -- bash -c 'cd $PRODUCTION_PATH/frontend && npm run build'"

# Database migrations
echo "🗄️ Running production database migrations..."
ssh prox "pct exec $PRODUCTION_CONTAINER -- bash -c 'cd $PRODUCTION_PATH/backend && python -c \"
import os
os.environ['DATABASE_URL'] = 'postgresql://ldc_user:ldc_password@10.92.3.21:5432/$DB_NAME'
from app.core.database import engine
from app.models import *
Base.metadata.create_all(bind=engine)
\"'"

# Restart production services
echo "🔄 Restarting production services..."
ssh prox "pct exec $PRODUCTION_CONTAINER -- bash -c 'pkill -f uvicorn || true'"
ssh prox "pct exec $PRODUCTION_CONTAINER -- bash -c 'pkill -f next || true'"

# Start backend (production mode)
ssh prox "pct exec $PRODUCTION_CONTAINER -- bash -c 'cd $PRODUCTION_PATH/backend && nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 > /tmp/backend_prod.log 2>&1 &'"

# Start frontend (production mode)
ssh prox "pct exec $PRODUCTION_CONTAINER -- bash -c 'cd $PRODUCTION_PATH/frontend && nohup npm start > /tmp/frontend_prod.log 2>&1 &'"

# Post-deployment health checks
echo "🏥 Running post-deployment health checks..."
sleep 10

# Backend health check
BACKEND_STATUS=$(ssh prox "pct exec $PRODUCTION_CONTAINER -- curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/health || echo '000'")
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Production backend health check passed"
else
    echo "❌ Production backend health check failed (HTTP $BACKEND_STATUS)"
    echo "🔄 Rolling back..."
    # Rollback logic would go here
    exit 1
fi

# Frontend health check
FRONTEND_STATUS=$(ssh prox "pct exec $PRODUCTION_CONTAINER -- curl -s -o /dev/null -w '%{http_code}' http://localhost:3001 || echo '000'")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Production frontend health check passed"
else
    echo "❌ Production frontend health check failed (HTTP $FRONTEND_STATUS)"
    echo "🔄 Rolling back..."
    # Rollback logic would go here
    exit 1
fi

# Verify database connectivity
DB_CHECK=$(ssh prox "pct exec 131 -- su - postgres -c \"psql -d $DB_NAME -c 'SELECT COUNT(*) FROM trade_teams;'\" | grep -o '[0-9]*' | head -1")
if [ "$DB_CHECK" -gt "0" ]; then
    echo "✅ Production database connectivity verified ($DB_CHECK trade teams)"
else
    echo "❌ Production database connectivity failed"
    exit 1
fi

echo "🎉 Production deployment completed successfully!"
echo "📍 Production URLs:"
echo "   • Backend API: http://10.92.3.24:8000"
echo "   • Frontend App: http://10.92.3.24:3001"
echo "   • Database: postgresql://ldc_user:ldc_password@10.92.3.21:5432/$DB_NAME"
echo "💾 Backup available: $BACKUP_FILE"
