# WMACS Modular Architecture

## Architecture Overview

```
wmacs/
├── core/                           # Shared system components (synced)
│   ├── wmacs-guardian-core.js      # Core guardian logic
│   ├── wmacs-research-advisor.js   # Research capabilities
│   ├── wmacs-auto-advisor.js       # Auto-advisory features
│   ├── enforcement/                # Enforcement mechanisms
│   ├── procedures/                 # Operational procedures
│   └── templates/                  # Template files
├── config/                         # Repository-specific configs (protected)
│   ├── project.json                # Project-specific settings
│   ├── environments.json           # Environment configurations
│   ├── ssh-config.json             # SSH settings
│   └── overrides.json              # Local rule overrides
├── local/                          # Local customizations (protected)
│   ├── custom-rules.js             # Project-specific rules
│   ├── local-procedures.md         # Local procedures
│   └── integrations/               # Project integrations
└── wmacs-guardian.js               # Main entry point (hybrid)
```

## Synchronization Strategy

### Shared Components (Always Synced)
- Core logic and algorithms
- Base enforcement mechanisms
- Standard operational procedures
- Template files
- Research and advisory capabilities

### Protected Components (Never Overwritten)
- Project-specific configurations
- Environment settings
- SSH configurations
- Local customizations
- Project integrations

### Hybrid Components (Intelligent Merge)
- Main entry point (wmacs-guardian.js)
- Configuration loaders
- Rule processors

## Configuration Hierarchy

1. **Core Defaults** (from shared system)
2. **Project Config** (project.json)
3. **Environment Config** (environments.json)
4. **Local Overrides** (overrides.json)

Later configurations override earlier ones.
