#!/bin/bash

# Script to commit changes and prepare for pull requests
echo "Starting git operations..."

# Check current branch
echo "Current branch:"
git branch --show-current

# Check status
echo "Git status:"
git status

# Add all changes
echo "Adding all changes..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "Complete Role Management System implementation for LDC Construction Tools Phase 2"

# Push to current branch
echo "Pushing to current branch..."
git push origin $(git branch --show-current)

echo "Git operations completed."
