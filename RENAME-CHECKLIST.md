# LDC Tools Rename - App Repo Checklist

**You are here:** App repository updates (Phase 3)  
**Previous:** GitHub repository renamed  
**Next:** Local directory rename

---

## Your Tasks in This Repo

This checklist covers all changes needed in the `ldc-construction-tools` repository before renaming the local directory.

**Estimated time:** 1-2 hours

---

## Step 1: Configuration Files

### package.json
- [ ] Update `"name"` field from `"ldc-construction-tools"` to `"ldc-tools"`

### Check these files:
- [ ] `package.json` - name field
- [ ] `package-lock.json` - will regenerate after package.json change
- [ ] `frontend/package.json` - if it exists and has name field
- [ ] Any other config files with app name

**Commands:**
```bash
# Search for all references
grep -r "ldc-construction-tools" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude-dir=.cloudy-work

# Update package.json
# (Edit manually or use find/replace in Windsurf)

# Regenerate package-lock.json
npm install
```

---

## Step 2: Documentation

### Files to update:
- [ ] `README.md` - app name, installation paths, examples
- [ ] Any files in `docs/` directory
- [ ] Deployment documentation
- [ ] Developer setup guides
- [ ] Any markdown files with repo name

**Search command:**
```bash
find . -name "*.md" -not -path "./node_modules/*" -not -path "./.next/*" -not -path "./.git/*" -not -path "./.cloudy-work/*" -exec grep -l "ldc-construction-tools" {} \;
```

**Update references to:**
- Repository name: `ldc-tools`
- GitHub URL: `github.com/heybearc/ldc-tools`
- Local path: `/Users/cory/Projects/ldc-tools` (after directory rename)
- Container path: `/opt/ldc-tools` (or keep old if using symlinks)

---

## Step 3: Scripts and Code

### Check for hardcoded paths:
- [ ] Build scripts
- [ ] Deployment scripts  
- [ ] Scripts in `scripts/` directory
- [ ] Any shell scripts (`.sh` files)
- [ ] Import statements (unlikely but check)

**Search command:**
```bash
find . -name "*.sh" -o -name "*.js" -o -name "*.ts" | grep -v node_modules | grep -v .next | grep -v .git | xargs grep -l "ldc-construction-tools"
```

---

## Step 4: Environment Files

- [ ] `.env.example` - check for any path references
- [ ] Config files
- [ ] Docker configs (if any)
- [ ] PM2 ecosystem config (if in repo)

**Note:** Don't update actual `.env` files (they're gitignored), but do update `.env.example` templates.

---

## Step 5: Commit Changes

After completing all updates above:

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "refactor: rename ldc-construction-tools to ldc-tools

- Update package.json name field
- Update all documentation references
- Update script paths and references
- Update environment file templates"

# Push to GitHub (now renamed to ldc-tools)
git push origin main
```

---

## Step 6: Verify No References Remain

```bash
# Should return 0 results (or only in node_modules/.next/.git)
grep -r "ldc-construction-tools" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude-dir=.cloudy-work
```

If you see results, update those files too.

---

## Step 7: Close This Window

**Important:** Before proceeding to Phase 4 (local directory rename), you must:
1. Commit and push all changes
2. Close this Windsurf window
3. Return to terminal to rename directory

**Do not skip this step!** Windsurf needs to be closed before renaming the directory.

---

## Next Steps (After This Repo)

**Phase 4:** Local directory rename
- Close this Windsurf window
- Open terminal
- Run: `mv /Users/cory/Projects/ldc-construction-tools /Users/cory/Projects/ldc-tools`
- Update git remote
- Reopen in Windsurf

**See:** `/Users/cory/Projects/Cloudy-Work/_cloudy-ops/repo-admin/LDC-TOOLS-RENAME-PLAN.md` for complete plan

---

## Checklist Summary

- [ ] package.json name updated
- [ ] package-lock.json regenerated
- [ ] README.md updated
- [ ] All documentation updated
- [ ] Scripts updated
- [ ] Environment templates updated
- [ ] All changes committed and pushed
- [ ] Verified no references remain
- [ ] Ready to close this window

**When complete, return to Cloudy-Work window and continue with Phase 4.**
