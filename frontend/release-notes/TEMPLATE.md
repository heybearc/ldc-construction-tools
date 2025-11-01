# Release Notes Template

**Use this template when creating new release notes. Focus on USER IMPACT, not technical implementation.**

---

## Template File: `release-notes/vX.Y.Z.md`

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

---

## ✅ DO's - User-Focused Language

### ✅ Good Examples:

- "Fixed issue where login would fail after 24 hours"
- "Improved dashboard loading speed by 50%"
- "Added ability to export trade teams to PDF"
- "Enhanced mobile experience with better touch controls"
- "Resolved notification delay issues"

### ✅ Focus On:
- What users can now do
- What problems were fixed
- How their experience improved
- Any actions they need to take

---

## ❌ DON'Ts - Technical Implementation Details

### ❌ Bad Examples:

- "Updated Prisma schema for NextAuth tables"
- "File: `src/app/api/auth/[...nextauth]/route.ts`"
- "Deployed to Container 133 (ldctools-blue)"
- "Updated TypeScript interfaces"
- "Refactored database queries"

### ❌ Avoid:
- IP addresses and container numbers
- File paths and code references
- Internal infrastructure details
- Deployment procedures
- Technical jargon
- Database schema details
- API endpoint paths (unless user-facing)

---

## 📊 Version Type Guidelines

### Major (X.0.0)
- Breaking changes that require user action
- Major new features
- Significant UI/UX changes
- Example: v1.0.0 → v2.0.0

### Minor (0.X.0)
- New features (backward compatible)
- Significant improvements
- New capabilities
- Example: v1.0.0 → v1.1.0

### Patch (0.0.X)
- Bug fixes
- Small improvements
- Performance enhancements
- Example: v1.0.0 → v1.0.1

---

## 🎯 Writing Tips

1. **Use Plain Language** - Write for non-technical users
2. **Be Specific** - "Fixed login errors" not just "Bug fixes"
3. **Show Benefits** - Explain WHY it matters to users
4. **Be Concise** - One clear sentence per item
5. **Use Emojis** - Makes it more scannable and friendly
6. **Test Readability** - Would a non-technical user understand it?

---

## 🚀 Quick Checklist Before Publishing

- [ ] No IP addresses or container numbers
- [ ] No file paths or code references
- [ ] No internal infrastructure details
- [ ] Written in plain, user-friendly language
- [ ] Focused on user benefits and impact
- [ ] Emojis used for scannability
- [ ] Spell-checked and proofread
- [ ] Would make sense to a non-technical user

---

**Remember: Release notes are for USERS, not developers!**
