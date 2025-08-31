#!/bin/bash
# DevOps Agent: Staging Deployment Script
# Eliminates local development workflow - direct staging deployment

set -e

echo "🚀 DevOps Agent: Staging Deployment Pipeline"
echo "📦 Target: Container 135 (10.92.3.25)"

# Configuration
STAGING_CONTAINER="135"
STAGING_PATH="/opt/ldc-construction-tools"
BRANCH="feature/enhancements"

# Pull latest changes on staging
echo "📥 Pulling latest changes..."
ssh prox "pct exec $STAGING_CONTAINER -- bash -c 'cd $STAGING_PATH && git pull origin $BRANCH'"

# Install/update backend dependencies
echo "🐍 Installing backend dependencies..."
ssh prox "pct exec $STAGING_CONTAINER -- bash -c 'cd $STAGING_PATH/backend && pip install -r requirements.txt'"

# Install/update frontend dependencies
echo "📦 Installing frontend dependencies..."
ssh prox "pct exec $STAGING_CONTAINER -- bash -c 'cd $STAGING_PATH/frontend && npm ci'"

# Build frontend
echo "🏗️ Building frontend..."
ssh prox "pct exec $STAGING_CONTAINER -- bash -c 'cd $STAGING_PATH/frontend && npm run build'"

# Database migrations (if needed)
echo "🗄️ Running database migrations..."
ssh prox "pct exec $STAGING_CONTAINER -- bash -c 'cd $STAGING_PATH/backend && python -c \"from app.core.database import engine; from app.models import *; Base.metadata.create_all(bind=engine)\"'"

# Restart backend service
echo "🔄 Restarting backend service..."
ssh prox "pct exec $STAGING_CONTAINER -- bash -c 'pkill -f uvicorn || true'"
ssh prox "pct exec $STAGING_CONTAINER -- bash -c 'cd $STAGING_PATH/backend && nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > /tmp/backend.log 2>&1 &'"

# Restart frontend service
echo "🔄 Restarting frontend service..."
ssh prox "pct exec $STAGING_CONTAINER -- bash -c 'pkill -f next || true'"
ssh prox "pct exec $STAGING_CONTAINER -- bash -c 'cd $STAGING_PATH/frontend && nohup npm run dev > /tmp/frontend.log 2>&1 &'"

# Health checks
echo "🏥 Running health checks..."
sleep 5

# Check backend health
BACKEND_STATUS=$(ssh prox "pct exec $STAGING_CONTAINER -- curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/health || echo '000'")
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed (HTTP $BACKEND_STATUS)"
fi

# Check frontend health
FRONTEND_STATUS=$(ssh prox "pct exec $STAGING_CONTAINER -- curl -s -o /dev/null -w '%{http_code}' http://localhost:3001 || echo '000'")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend health check passed"
else
    echo "❌ Frontend health check failed (HTTP $FRONTEND_STATUS)"
fi

echo "🎯 Staging deployment completed"
echo "📍 Access URLs:"
echo "   • Backend API: http://10.92.3.25:8000"
echo "   • Frontend App: http://10.92.3.25:3001"
echo "   • Database: postgresql://ldc_user:ldc_password@10.92.3.21:5432/ldc_construction_tools_staging"
