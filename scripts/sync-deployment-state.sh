#!/bin/bash
# Sync deployment state files on LDC Tools containers
# This ensures the UI badge shows correct LIVE/STANDBY status

STATE_JSON='{"liveServer":"GREEN","standbyServer":"BLUE","lastSwitch":"2026-01-13T12:40:43.526Z"}'

echo "Syncing deployment state files for LDC Tools..."
echo "GREEN (10.92.3.25) = LIVE"
echo "BLUE (10.92.3.23) = STANDBY"
echo ""

# Update BLUE container
echo "Updating BLUE container state file..."
ssh ldc "echo '$STATE_JSON' > /opt/ldc-construction-tools/deployment-state.json"
echo "✅ BLUE updated"

# Update GREEN container  
echo "Updating GREEN container state file..."
ssh ldc-staging "echo '$STATE_JSON' > /opt/ldc-construction-tools/deployment-state.json"
echo "✅ GREEN updated"

echo ""
echo "✅ Deployment state files synced!"
echo "UI badges should now show correct status"
