---
description: Version bump for LDC Tools with help documentation analysis
---

# LDC Tools Version Bump Workflow

When the user says "bump" for LDC Tools, follow this complete workflow.

## Infrastructure Context

**LDC Tools Blue-Green Setup:**
- **BLUE (Container 133):** 10.92.3.23:3001 - Currently PRODUCTION
- **GREEN (Container 135):** 10.92.3.25:3001 - Currently STANDBY
- **Database (Container 131):** 10.92.3.21 - Shared
- **HAProxy (Container 136):** Routes ldctools.com traffic
- **Repository:** `/opt/ldc-construction-tools`
- **Branch:** `dev` (GREEN), `main` (BLUE)

## Step 1: Analyze Recent Changes

Review recent commits to understand what changed:
```bash
cd /Users/cory/Documents/Cloudy-Work/applications/ldc-construction-tools
git log --oneline -10
```

Identify:
- New features added
- Bug fixes
- UI changes
- API changes
- Configuration changes

## Step 2: Determine Version Type

Based on changes, decide version bump:
- **MAJOR** (x.0.0): Breaking changes, major architecture changes
- **MINOR** (0.x.0): New features, new user-facing functionality
- **PATCH** (0.0.x): Bug fixes, small improvements, documentation only

## Step 3: **CRITICAL - Analyze Help Documentation Needs**

### Automatic Analysis Questions:

**Ask yourself for EACH change:**

1. **Is this visible to users?**
   - New UI elements, pages, or features?
   - Changed workflows or processes?
   - New admin capabilities?
   → If YES: Help documentation likely needed

2. **Does this change how users do something?**
   - Modified existing features?
   - New steps in existing workflows?
   - Changed behavior?
   → If YES: Update existing help pages

3. **Will users have questions about this?**
   - Complex new feature?
   - Non-obvious functionality?
   - Requires explanation?
   → If YES: Add FAQ section or new help page

4. **Is this admin-only?**
   - Admin portal features?
   - System management?
   - Configuration?
   → If YES: Create admin-restricted help page

### Help Documentation Decision Matrix:

| Change Type | Help Action Required |
|-------------|---------------------|
| New user-facing feature | Create new help page + add to index |
| Modified existing feature | Update relevant help page |
| Bug fix (no UI change) | No help update needed |
| Admin feature | Create admin help page |
| New workflow/process | Document step-by-step |
| UI redesign | Update screenshots/descriptions |

### If Help Documentation Needed:

**Create Help Page:**
- Location: `/frontend/src/app/help/[feature-name]/page.tsx`
- Use existing help pages as template (getting-started, authentication)
- Include: Overview, How-to, FAQ
- Use clear, non-technical language
- Add emojis for visual clarity
- Set proper role restrictions
- Add `export const dynamic = 'force-dynamic'`

**Update Help Index:**
- Edit `/frontend/src/app/help/page.tsx`
- Add to `helpTopics` array
- Set appropriate roles array
- Use descriptive title and description

**Content Guidelines:**
- Write for end-users, not developers
- Step-by-step instructions
- Include "What you'll see" descriptions
- Add common questions section
- Explain WHY not just HOW

## Step 4: Update Version Number

Edit `frontend/package.json`:
```json
"version": "X.Y.Z"
```

**Note:** Version is now dynamically read from `package.json` via `/frontend/src/lib/version.ts`.
All components (HelpLayout, ConditionalLayout, etc.) automatically use this version.
You only need to update `package.json` - no other files need version changes.

## Branch Strategy

- **`green-development`** - Active development branch, deploys to GREEN (STANDBY)
- **`dev`** - Stable development branch, merged from green-development after testing
- **`main`** - Production branch, deploys to BLUE (PROD)

## Step 5: Create User-Friendly Release Notes

Create `/frontend/release-notes/vX.Y.Z.md` with frontmatter:

**Template:**
```markdown
---
version: X.Y.Z
date: YYYY-MM-DD
type: major|minor|patch
title: Brief User-Friendly Title
description: One sentence describing the main focus of this release
---

## ✨ New Features (if any)

- **Feature Name** - Brief description of what users can now do
- **Another Feature** - How this benefits users

## 🐛 Bug Fixes (if any)

- **Fixed [issue]** - Describe what was broken and is now fixed
- **Resolved [problem]** - User-facing description of the fix

## 🔧 Improvements (if any)

- **Better [thing]** - How the experience is improved
- **Enhanced [feature]** - What's better for users

## 🔐 Security (if any)

- **Security Enhancement** - What security improvement was made
- **Updated Dependencies** - Security patches applied

## ⚠️ Breaking Changes (if any - rare!)

- **[Change]** - What changed and what users need to do
- **Action Required** - Clear steps for users to take

## 📝 Notes (optional)

- Additional context or information users should know
- Migration notes if applicable
- Known limitations or workarounds
```

**Release Notes Rules:**
- NO technical jargon
- NO code references
- NO implementation details
- NO IP addresses or container numbers
- Focus on user benefits
- Clear, simple language
- Examples when helpful
- Follow TEMPLATE.md guidelines

## Step 6: Update CHANGELOG.md

Update `/CHANGELOG.md` with technical details:
```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- Technical feature descriptions

### Changed
- What changed technically

### Fixed
- Bug fixes with technical context

### Security
- Security updates
```

## Step 7: Commit Everything

```bash
git add -A
git commit -m "Release vX.Y.Z - [Brief Description]

[Detailed commit message with changes]

[If help docs added: mention it]"
git push origin dev
```

## Step 8: Deploy to STANDBY (GREEN)

Use MCP tool to deploy to STANDBY:
```bash
# Check current deployment status
mcp3_get_deployment_status --app=ldc-tools

# Deploy to STANDBY (GREEN)
mcp3_deploy_to_standby --app=ldc-tools --pullGithub=true --createBackup=true
```

## Step 9: Test on STANDBY

Test the new version:
- URL: `https://green.ldctools.com`
- Verify all changes work
- Check help pages if added
- Review release notes display
- Test user workflows

## Step 10: Report and Wait for Approval

**DO NOT auto-release!** Report to user:

```
✅ vX.Y.Z Ready for Release

Version: X.Y.Z
STANDBY: https://green.ldctools.com
PROD: https://ldctools.com (still on vX.Y.Z-1)

Changes:
- [Change 1]
- [Change 2]

Help Documentation:
- [Created/Updated/None needed]

Ready to release when you approve!
```

## Step 11: Release (Only After Approval)

User will say "release" - then:
1. Update HAProxy to route to GREEN
2. **STOP and report success**
3. **ASK: "Ready to sync BLUE (new STANDBY)?"**
4. **WAIT for approval**
5. Only sync after explicit approval

## Checklist

Before saying "ready for release":

- [ ] Version number updated in package.json
- [ ] Version updated in HelpLayout.tsx
- [ ] Version updated in ConditionalLayout.tsx
- [ ] Release notes created (user-friendly, with frontmatter)
- [ ] CHANGELOG.md updated (technical)
- [ ] Help documentation analyzed
- [ ] Help pages created/updated (if needed)
- [ ] Help index updated (if needed)
- [ ] All changes committed
- [ ] Deployed to STANDBY (GREEN)
- [ ] STANDBY tested
- [ ] Waiting for user approval

## Notes

- **ALWAYS** analyze help documentation needs
- **NEVER** skip help docs for user-facing changes
- **NEVER** auto-release without approval
- **NEVER** sync STANDBY without asking
- Release notes must be non-technical
- Help pages must use simple language
- Use `--legacy-peer-deps` for npm install
- GREEN is currently STANDBY, BLUE is PROD
