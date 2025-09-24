---
description: Integrate WMACS Cascade Rules into Windsurf IDE customizations
---

# WMACS Cascade Rules IDE Integration

This workflow integrates WMACS Cascade Rules directly into Windsurf IDE for real-time enforcement.

## Step 1: Create IDE Configuration Directory

// turbo
```bash
mkdir -p .windsurf/customizations
mkdir -p .windsurf/settings
```

## Step 2: Create Cascade Rules Configuration

```bash
# Create IDE-specific cascade rules file
cat > .windsurf/customizations/cascade-rules.json << 'EOF'
{
  "wmacs": {
    "enabled": true,
    "strictMode": true,
    "rules": {
      "hardStops": [
        {
          "pattern": "ssh.*production.*rm -rf",
          "message": "🚫 HARD STOP: Direct production file deletion blocked",
          "action": "block"
        },
        {
          "pattern": "bypass.*ci.*cd",
          "message": "🚫 HARD STOP: CI/CD pipeline bypass not allowed",
          "action": "block"
        },
        {
          "pattern": "skip.*staging",
          "message": "🚫 HARD STOP: Staging validation required",
          "action": "block"
        }
      ],
      "softStops": [
        {
          "pattern": "architecture.*change",
          "message": "⚠️ SOFT STOP: Architecture change requires WMACS Research Advisor analysis",
          "action": "warn"
        },
        {
          "pattern": "remove.*multi-agent",
          "message": "⚠️ SOFT STOP: Multi-agent removal requires justification",
          "action": "warn"
        }
      ],
      "approvedPatterns": [
        {
          "pattern": "staging.*first",
          "message": "✅ APPROVED: Staging-first deployment",
          "action": "approve"
        },
        {
          "pattern": "wmacs.*sync",
          "message": "✅ APPROVED: WMACS synchronization",
          "action": "approve"
        }
      ]
    }
  }
}
EOF
```

## Step 3: Create IDE Settings Integration

```bash
# Create Windsurf settings file
cat > .windsurf/settings/wmacs-integration.json << 'EOF'
{
  "editor.rulers": [80, 120],
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "files.associations": {
    "wmacs-config.js": "javascript",
    "*.wmacs": "yaml"
  },
  "emmet.includeLanguages": {
    "wmacs": "yaml"
  },
  "yaml.schemas": {
    "./wmacs/schemas/wmacs-config.schema.json": "wmacs-config.js"
  },
  "editor.quickSuggestions": {
    "comments": true,
    "strings": true,
    "other": true
  },
  "editor.suggest.showWords": true,
  "editor.wordBasedSuggestions": "allDocuments",
  "workbench.colorCustomizations": {
    "editorRuler.foreground": "#ff0000",
    "statusBar.background": "#1e3a8a",
    "statusBar.foreground": "#ffffff"
  }
}
EOF
```

## Step 4: Create Command Palette Integration

```bash
# Create command definitions
cat > .windsurf/customizations/commands.json << 'EOF'
{
  "commands": [
    {
      "command": "wmacs.diagnose",
      "title": "WMACS: Run System Diagnostic",
      "category": "WMACS Guardian",
      "when": "workspaceFolder",
      "execution": {
        "command": "node",
        "args": ["wmacs/wmacs-guardian.js", "diagnose"]
      }
    },
    {
      "command": "wmacs.sync",
      "title": "WMACS: Sync with Shared System",
      "category": "WMACS Guardian", 
      "when": "workspaceFolder",
      "execution": {
        "workflow": "/wmacs-sync"
      }
    },
    {
      "command": "wmacs.test",
      "title": "WMACS: Test Current Environment",
      "category": "WMACS Guardian",
      "when": "workspaceFolder", 
      "execution": {
        "command": "node",
        "args": ["wmacs/wmacs-guardian.js", "test", "135"]
      }
    },
    {
      "command": "wmacs.research",
      "title": "WMACS: Analyze Suggestion",
      "category": "WMACS Guardian",
      "when": "editorHasSelection",
      "execution": {
        "command": "node",
        "args": ["wmacs/wmacs-research-advisor.js", "analyze", "${selectedText}"]
      }
    }
  ]
}
EOF
```

## Step 5: Create Snippets for WMACS Patterns

```bash
# Create WMACS code snippets
cat > .windsurf/customizations/snippets.json << 'EOF'
{
  "wmacs-commit": {
    "prefix": "wmacs-commit",
    "body": [
      "git commit -m \"${1:type}: ${2:description}",
      "",
      "🛡️ WMACS ${3:COMPONENT}:",
      "- ${4:change description}",
      "- ${5:additional changes}",
      "",
      "✅ ${6:VALIDATION}:",
      "- ${7:validation points}",
      "",
      "WMACS Guardian: ${8:summary}\""
    ],
    "description": "WMACS-compliant commit message"
  },
  "wmacs-config": {
    "prefix": "wmacs-config",
    "body": [
      "// WMACS Guardian Configuration",
      "module.exports = {",
      "  projectName: '${1:project-name}',",
      "  projectType: '${2:nextjs}',",
      "  environments: {",
      "    staging: {",
      "      container: '${3:135}',",
      "      ip: '${4:10.92.3.25}'",
      "    },",
      "    production: {", 
      "      container: '${5:134}',",
      "      ip: '${6:10.92.3.24}'",
      "    }",
      "  },",
      "  enforcement: {",
      "    strictMode: ${7:true}",
      "  }",
      "};"
    ],
    "description": "WMACS configuration template"
  }
}
EOF
```

## Step 6: Create Status Bar Integration

```bash
# Create status bar configuration
cat > .windsurf/customizations/statusbar.json << 'EOF'
{
  "statusBar": {
    "items": [
      {
        "id": "wmacs.status",
        "name": "WMACS Status",
        "text": "🛡️ WMACS",
        "tooltip": "WMACS Guardian System Status",
        "command": "wmacs.diagnose",
        "alignment": "left",
        "priority": 100
      },
      {
        "id": "wmacs.environment", 
        "name": "Environment",
        "text": "📍 Staging",
        "tooltip": "Current deployment environment",
        "command": "wmacs.test",
        "alignment": "left",
        "priority": 99
      }
    ]
  }
}
EOF
```

## Step 7: Create Keybinding Integration

```bash
# Create keyboard shortcuts
cat > .windsurf/customizations/keybindings.json << 'EOF'
[
  {
    "key": "ctrl+shift+w d",
    "command": "wmacs.diagnose",
    "when": "workspaceFolder"
  },
  {
    "key": "ctrl+shift+w s", 
    "command": "wmacs.sync",
    "when": "workspaceFolder"
  },
  {
    "key": "ctrl+shift+w t",
    "command": "wmacs.test", 
    "when": "workspaceFolder"
  },
  {
    "key": "ctrl+shift+w r",
    "command": "wmacs.research",
    "when": "editorHasSelection"
  }
]
EOF
```

## Step 8: Create Workspace Settings

```bash
# Create workspace-specific settings
cat > .windsurf/settings.json << 'EOF'
{
  "wmacs.enabled": true,
  "wmacs.strictMode": true,
  "wmacs.autoSync": false,
  "wmacs.notifications": true,
  "wmacs.configPath": "./wmacs-config.js",
  "wmacs.sharedSystemPath": "~/Documents/Cloudy-Work/shared/wmacs-guardian-system",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll": true
  },
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/.git/**": true,
    "**/wmacs/logs/**": true
  }
}
EOF
```

## Step 9: Commit IDE Integration

```bash
git add .windsurf/
git commit -m "feat: Integrate WMACS Cascade Rules into Windsurf IDE

🛡️ WMACS IDE INTEGRATION:
- Added cascade rules enforcement in IDE
- Created command palette integration
- Configured status bar monitoring
- Added keyboard shortcuts for WMACS operations

✅ IDE FEATURES:
- Real-time rule enforcement
- Quick access to WMACS commands
- Code snippets for WMACS patterns
- Workspace-specific settings

🔧 KEYBOARD SHORTCUTS:
- Ctrl+Shift+W D: Diagnose WMACS system
- Ctrl+Shift+W S: Sync with shared system
- Ctrl+Shift+W T: Test environment
- Ctrl+Shift+W R: Research advisor analysis

WMACS Guardian: Full IDE integration active"
```

## Validation

After completing this workflow:

1. **Test Command Palette**: Press `Ctrl+Shift+P` and search for "WMACS"
2. **Check Status Bar**: Look for 🛡️ WMACS indicator
3. **Try Shortcuts**: Use `Ctrl+Shift+W D` to run diagnostics
4. **Verify Settings**: Check that WMACS settings are applied

## Usage

- **Real-time Enforcement**: Rules will trigger warnings/blocks as you type
- **Quick Commands**: Use keyboard shortcuts for common WMACS operations
- **Status Monitoring**: Status bar shows current WMACS state
- **Code Assistance**: Snippets help write WMACS-compliant code
