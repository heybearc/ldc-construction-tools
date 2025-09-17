#!/bin/bash

# Script to create pull request from feature/enhancements to dev
echo "Creating pull request from feature/enhancements to dev..."

# Get the PR description
PR_BODY=$(cat pr_feature_enhancements_to_dev.md)

# Create the pull request using GitHub CLI if available
if command -v gh &> /dev/null; then
  echo "Using GitHub CLI to create pull request..."
  cd /Users/cory/Documents/Cloudy-Work/applications/ldc-construction-tools
  gh pr create --base dev --head feature/enhancements --title "Feature Enhancements Integration" --body "$PR_BODY"
else
  echo "GitHub CLI not found. Please create the pull request manually using the PR description in pr_feature_enhancements_to_dev.md"
  echo "Visit: https://github.com/heybearc/ldc-construction-tools/compare/dev...feature/enhancements"
fi

echo "Pull request creation process completed."
