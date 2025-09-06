#!/bin/bash
# deploy-ldc.sh - LDC Construction Tools Deployment Script

set -e

LOCAL_PATH="/Users/cory/Documents/Cloudy-Work/applications/ldc-construction-tools"
STAGING_HOST="ldc-staging"
PRODUCTION_HOST="ldc"
REMOTE_PATH="/opt/ldc-construction-tools"

# Determine target environment
TARGET=${1:-production}

if [[ "$TARGET" == "staging" ]]; then
    REMOTE_HOST=$STAGING_HOST
    echo "🚀 Deploying LDC Construction Tools to STAGING (10.92.3.25)..."
elif [[ "$TARGET" == "production" ]]; then
    REMOTE_HOST=$PRODUCTION_HOST
    echo "🚀 Deploying LDC Construction Tools to PRODUCTION (10.92.3.23)..."
else
    echo "❌ Invalid target. Use 'staging' or 'production'"
    exit 1
fi

# 1. Backup current deployment
echo "📦 Creating backup..."
ssh $REMOTE_HOST "if [ -d $REMOTE_PATH ]; then cp -r $REMOTE_PATH ${REMOTE_PATH}.backup.$(date +%Y%m%d_%H%M%S); fi"

# 2. Sync code (excluding build artifacts and sensitive files)
echo "📤 Syncing code..."
rsync -avz --exclude='.next' --exclude='node_modules' --exclude='.git' \
    --exclude='__pycache__' --exclude='*.pyc' --exclude='.env' \
    $LOCAL_PATH/ $REMOTE_HOST:$REMOTE_PATH/

# 3. Install backend dependencies
echo "🐍 Installing backend dependencies..."
ssh $REMOTE_HOST "cd $REMOTE_PATH/backend && pip install -r requirements.txt"

# 4. Install frontend dependencies and build
echo "📦 Installing frontend dependencies..."
ssh $REMOTE_HOST "cd $REMOTE_PATH/frontend && npm ci"

echo "🏗️ Building frontend..."
ssh $REMOTE_HOST "cd $REMOTE_PATH/frontend && npm run build"

# 5. Restart services
echo "🔄 Restarting services..."
ssh $REMOTE_HOST "cd $REMOTE_PATH && pkill -f 'python.*app' || true"
ssh $REMOTE_HOST "cd $REMOTE_PATH && pkill -f 'next.*dev' || true"

# Start backend
ssh $REMOTE_HOST "cd $REMOTE_PATH/backend && nohup python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &"

# Start frontend
ssh $REMOTE_HOST "cd $REMOTE_PATH/frontend && nohup npm run dev > /tmp/frontend.log 2>&1 &"

# 6. Verify deployment
echo "🏥 Verifying deployment..."
sleep 10

# Check backend
ssh $REMOTE_HOST "curl -f http://localhost:8000/health || echo '⚠️ Backend health check failed'"

# Check frontend
ssh $REMOTE_HOST "curl -f http://localhost:3001 > /dev/null && echo '✅ Frontend is responding' || echo '⚠️ Frontend check failed'"

echo "✅ Deployment completed successfully!"
echo "🌐 Frontend: http://$(echo $REMOTE_HOST | cut -d'@' -f2):3001"
echo "🔧 Backend: http://$(echo $REMOTE_HOST | cut -d'@' -f2):8000"
