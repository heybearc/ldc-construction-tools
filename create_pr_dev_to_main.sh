#!/bin/bash

# Script to create pull request from dev to main
echo "Creating pull request from dev to main..."

# Get the PR description
PR_BODY=$(cat pr_dev_to_main.md)

# Create the pull request using GitHub CLI if available
if command -v gh &> /dev/null; then
  echo "Using GitHub CLI to create pull request..."
  cd /Users/cory/Documents/Cloudy-Work/applications/ldc-construction-tools
  gh pr create --base main --head dev --title "Development to Production Release" --body "$PR_BODY"
else
  echo "GitHub CLI not found. Please create the pull request manually using the PR description in pr_dev_to_main.md"
  echo "Visit: https://github.com/heybearc/ldc-construction-tools/compare/main...dev"
fi

echo "Pull request creation process completed."
