#!/bin/bash

# Script to create pull requests for LDC Construction Tools
echo "Creating pull request from sdd-adopt to feature/enhancements..."

# Get the PR description
PR_BODY=$(cat pr_sdd_adopt_to_feature_enhancements.md)

# Create the pull request using GitHub CLI if available
if command -v gh &> /dev/null; then
  echo "Using GitHub CLI to create pull request..."
  cd /Users/cory/Documents/Cloudy-Work/applications/ldc-construction-tools
  gh pr create --base feature/enhancements --head sdd-adopt --title "Role Management System Implementation" --body "$PR_BODY"
else
  echo "GitHub CLI not found. Please create the pull request manually using the PR description in pr_sdd_adopt_to_feature_enhancements.md"
  echo "Visit: https://github.com/heybearc/ldc-construction-tools/compare/feature/enhancements...sdd-adopt"
fi

echo "Pull request creation process completed."
