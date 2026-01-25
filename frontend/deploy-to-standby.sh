#!/bin/bash

# Blue-Green Deployment Helper Script
# This script enforces the blue-green deployment workflow

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "=========================================="
echo "🔵🟢 Blue-Green Deployment Helper"
echo "=========================================="
echo ""

# Read current status from DEPLOYMENT.md
DEPLOYMENT_FILE="DEPLOYMENT.md"

if [ ! -f "$DEPLOYMENT_FILE" ]; then
    echo -e "${RED}Error: DEPLOYMENT.md not found!${NC}"
    exit 1
fi

# Parse current LIVE and STANDBY from DEPLOYMENT.md
BLUE_STATUS=$(grep "BLUE (10.92.3.23):" "$DEPLOYMENT_FILE" | grep -o "LIVE\|STANDBY" || echo "UNKNOWN")
GREEN_STATUS=$(grep "GREEN (10.92.3.25):" "$DEPLOYMENT_FILE" | grep -o "LIVE\|STANDBY" || echo "UNKNOWN")

echo -e "${BLUE}Current Status:${NC}"
echo "  BLUE (10.92.3.23): $BLUE_STATUS"
echo "  GREEN (10.92.3.25): $GREEN_STATUS"
echo ""

# Determine STANDBY environment
if [ "$BLUE_STATUS" = "STANDBY" ]; then
    STANDBY_IP="10.92.3.23"
    STANDBY_NAME="BLUE"
    STANDBY_URL="https://blue.ldctools.com"
    LIVE_IP="10.92.3.25"
    LIVE_NAME="GREEN"
elif [ "$GREEN_STATUS" = "STANDBY" ]; then
    STANDBY_IP="10.92.3.25"
    STANDBY_NAME="GREEN"
    STANDBY_URL="https://green.ldctools.com"
    LIVE_IP="10.92.3.23"
    LIVE_NAME="BLUE"
else
    echo -e "${RED}Error: Cannot determine STANDBY environment from DEPLOYMENT.md${NC}"
    echo "Please update DEPLOYMENT.md with current LIVE/STANDBY status"
    exit 1
fi

echo -e "${YELLOW}⚠️  This script will deploy to STANDBY ($STANDBY_NAME) ONLY${NC}"
echo ""
echo "Deployment target: $STANDBY_NAME ($STANDBY_IP)"
echo "Test URL: $STANDBY_URL"
echo ""

# Confirm deployment
read -p "Deploy to STANDBY ($STANDBY_NAME)? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo -e "${GREEN}Step 1: Deploying to STANDBY ($STANDBY_NAME)...${NC}"
echo ""

# Deploy to STANDBY
ssh root@$STANDBY_IP << 'ENDSSH'
cd /opt/ldc-tools/frontend
echo "Stopping application..."
pm2 delete ldc-frontend || true
echo "Pulling latest code..."
git stash
git pull origin main
echo "Clearing caches..."
rm -rf .next node_modules/.cache
echo "Building application..."
npm run build
echo "Starting application..."
pm2 start npm --name ldc-frontend -- start
pm2 save
echo "Verifying deployment..."
sleep 3
curl -s http://localhost:3001/api/v1/admin/system/info || echo "Warning: Health check failed"
ENDSSH

echo ""
echo -e "${GREEN}✓ Deployment to STANDBY ($STANDBY_NAME) complete!${NC}"
echo ""
echo "=========================================="
echo -e "${YELLOW}Next Steps:${NC}"
echo "=========================================="
echo ""
echo "2️⃣  Test on $STANDBY_URL"
echo "   ✓ Login/logout"
echo "   ✓ User management page"
echo "   ✓ Trade Teams page"
echo "   ✓ Volunteers page (grid and list views)"
echo "   ✓ Edit functionality"
echo "   ✓ No console errors"
echo ""
echo "3️⃣  If tests pass, switch traffic:"
echo "   Update proxy/DNS: ldctools.com -> $STANDBY_IP ($STANDBY_NAME)"
echo ""
echo "4️⃣  After traffic switch, sync new STANDBY ($LIVE_NAME):"
echo "   ssh root@$LIVE_IP"
echo "   cd /opt/ldc-tools/frontend"
echo "   pm2 delete ldc-frontend"
echo "   git pull origin main"
echo "   rm -rf .next node_modules/.cache"
echo "   npm run build"
echo "   pm2 start npm --name ldc-frontend -- start"
echo "   pm2 save"
echo ""
echo "5️⃣  Update DEPLOYMENT.md:"
echo "   - Swap LIVE/STANDBY designations"
echo "   - Update 'Last Updated' date"
echo ""
echo -e "${RED}❌ Do NOT deploy to $LIVE_NAME until after traffic switch!${NC}"
echo ""
