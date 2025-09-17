# WMACS Guardian - ldc-construction-tools

This project is equipped with the WMACS (Windsurf MCP Artifact CI/CD System) Guardian framework for automated deployment and monitoring.

## Quick Start

```bash
# Check project status
node scripts/wmacs/wmacs-guardian-ldc-construction-tools.js status

# Deploy to staging
node scripts/wmacs/wmacs-guardian-ldc-construction-tools.js deploy-staging

# Health check
node scripts/wmacs/wmacs-guardian-ldc-construction-tools.js health-check staging
```

## Configuration

1. Update `.wmacs/config/wmacs-config.json` with your environment details
2. Configure SSH access in `ssh_config_ldc-construction-tools`
3. Customize quality gates in `.wmacs/config/quality-gates.json`

## Environment Setup

1. Set up your staging and production environments
2. Configure SSH key authentication
3. Update the configuration files with actual IP addresses and paths
4. Test the deployment pipeline

## Commands

- `deploy-staging`: Deploy to staging environment
- `health-check ENV`: Check environment health
- `status`: Show overall project status

## Support

For issues with WMACS Guardian, check the logs in `.wmacs/logs/` or refer to the main WMACS documentation.
