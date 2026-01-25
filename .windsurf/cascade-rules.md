# Cascade Rules for LDC Construction Tools

## WMACS Guardian MCP Advisory System - MANDATORY USAGE

### Rule 1: WMACS Guardian First Protocol
**ALWAYS** use the WMACS Guardian MCP advisory system as the first step for every user request:

```bash
node wmacs/wmacs-guardian.js [command] [target]
```

Available commands:
- `test` - Comprehensive system testing
- `health` - Health check and diagnostics  
- `redirect` - Authentication redirect testing
- `start` - System startup and initialization

### Rule 2: Systematic Problem Resolution
1. **Diagnose** with WMACS Guardian first
2. **Analyze** the Guardian's output
3. **Implement** fixes based on Guardian recommendations
4. **Validate** with Guardian testing
5. **Document** results in todo_list

### Rule 3: No Ad-Hoc Solutions
- Never implement fixes without Guardian analysis
- Always validate solutions with Guardian testing
- Use Guardian advisory for all authentication, deployment, and system issues

### Rule 4: Authentication Simplification
- Remove complex JWT/NextAuth implementations
- Use simple session-based authentication
- Follow Guardian recommendations for auth flow

### Rule 5: Container Operations
- Use Guardian for all container diagnostics
- Follow Guardian protocols for deployment
- Validate all changes with Guardian health checks

### Rule 6: WMACS Artifact Deployment Workflow - MANDATORY
**NEVER make direct changes on staging server. ALWAYS follow artifact-based deployment:**

#### 6.1 Local Development First
```bash
# Work on local codebase ONLY
cd /Users/cory/Documents/Cloudy-Work/applications/ldc-tools
# Make ALL changes locally, test locally
```

#### 6.2 Create Deployment Artifacts
```bash
# Commit changes as proper artifacts
git add [files]
git commit -m "feat/fix: [WMACS compliant description]"
git push origin staging
```

#### 6.3 Deploy to Staging
```bash
# Clean deployment to staging
ssh prox "pct exec 135 -- bash -c 'cd /opt/ldc-tools && git reset --hard HEAD && git clean -fd'"
ssh prox "pct exec 135 -- bash -c 'cd /opt/ldc-tools && git pull origin staging'"
# Restart services if needed
```

#### 6.4 WMACS Guardian Validation
```bash
# ALWAYS validate deployment with Guardian
node wmacs/wmacs-guardian.js test 135
node wmacs/wmacs-guardian.js health 135
```

#### 6.5 Violation Consequences
- Direct staging changes violate WMACS principles
- All fixes must be artifacts created locally first
- No exceptions to this workflow

## Implementation Priority
These rules take precedence over all other development approaches. The WMACS Guardian MCP advisory system and artifact deployment workflow are the primary tools for all LDC Construction Tools operations.
