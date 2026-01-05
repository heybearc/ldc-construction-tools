#!/bin/bash

# Quick Test Runner for LDC Construction Tools
# Run this before every deployment to verify critical functionality

set -e

echo "🧪 LDC Construction Tools - Quick Test Runner"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL=${BASE_URL:-"http://localhost:3001"}
TEST_TYPE=${1:-"smoke"}

echo "📍 Testing against: $BASE_URL"
echo "🎯 Test type: $TEST_TYPE"
echo ""

# Check if server is running
echo "🔍 Checking if server is accessible..."
if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" | grep -q "200\|302\|401"; then
    echo -e "${GREEN}✓${NC} Server is accessible"
else
    echo -e "${RED}✗${NC} Server is not accessible at $BASE_URL"
    echo "   Please start the server first or check the URL"
    exit 1
fi

echo ""
echo "🚀 Running tests..."
echo ""

# Run tests based on type
if [ "$TEST_TYPE" = "smoke" ]; then
    BASE_URL=$BASE_URL npm run test:smoke:quick
elif [ "$TEST_TYPE" = "full" ]; then
    BASE_URL=$BASE_URL npm run test:e2e
else
    echo -e "${RED}✗${NC} Invalid test type: $TEST_TYPE"
    echo "   Usage: ./scripts/quick-test.sh [smoke|full]"
    exit 1
fi

TEST_EXIT_CODE=$?

echo ""
echo "=============================================="

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "📊 View detailed report:"
    echo "   npm run test:report"
    echo ""
    echo "✅ Ready to deploy!"
else
    echo -e "${RED}✗ Some tests failed${NC}"
    echo ""
    echo "🔍 Debug options:"
    echo "   1. View report: npm run test:report"
    echo "   2. Run with UI: npm run test:e2e:ui"
    echo "   3. Check screenshots in test-results/"
    echo ""
    echo "❌ Fix issues before deploying"
fi

exit $TEST_EXIT_CODE
