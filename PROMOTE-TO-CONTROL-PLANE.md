# Promotions to Control Plane - LDC Tools

**Date:** 2026-02-16  
**Source Repo:** ldc-tools  
**Promoter:** Cascade AI

---

## Documentation: Release Notes UI/UX Best Practices
**Type:** documentation
**Target:** docs/ui-patterns/release-notes-best-practices.md
**Category:** ui-patterns
**Date:** 2026-02-16

**Purpose:** Document industry-standard patterns for release notes pages that can be reused across all apps (LDC Tools, TheoShift, QuantShift)

**Content Summary:** 
Research-backed best practices for designing professional release notes pages, including:
- Sidebar navigation with collapsible version groups
- User-facing content guidelines (avoid technical jargon)
- Industry patterns from Stripe, GitHub, Notion, Linear
- Semantic versioning display
- Mobile-responsive design
- Accessibility considerations

**Key Points:**
- **Sidebar Navigation:** Collapsible version groups (e.g., v1.20-1.27, v1.10-1.19, v1.0-1.9) for easy navigation without scrolling
- **Single-Version Focus:** Display one release at a time with clear version header, type badge (major/minor/patch), and date
- **Collapsible Sections:** Expandable sections for "New Features", "Bug Fixes", "Improvements" to improve scannability
- **User-Facing Content:** Simplified language focusing on user benefits, not technical implementation details
- **Visual Hierarchy:** Sticky header, clear typography, color-coded badges, consistent spacing
- **Content Structure:** Title, description, categorized bullet points (not paragraphs)

**Implementation Pattern:**
```typescript
// Server component loads markdown files
async function getReleases() {
  const releasesDir = path.join(process.cwd(), 'release-notes')
  const files = await fs.readdir(releasesDir)
  // Parse markdown with gray-matter, render with marked
  return releases.sort((a, b) => versionCompare(b.version, a.version))
}

// Client component handles UI state
export default function ReleaseNotesClient({ releases }) {
  const [selectedVersion, setSelectedVersion] = useState(releases[0]?.version)
  const [expandedGroups, setExpandedGroups] = useState({ 'latest': true })
  
  // Group releases by major version ranges
  const groupReleases = () => {
    // v1.20-1.27, v1.10-1.19, v1.0-1.9
  }
  
  return (
    <div className="flex gap-8">
      <aside className="w-64">
        {/* Collapsible sidebar navigation */}
      </aside>
      <main className="flex-1">
        {/* Single release display with collapsible sections */}
      </main>
    </div>
  )
}
```

**Markdown Frontmatter Format:**
```yaml
---
version: "1.27.3"
date: "2026-02-15"
type: "minor"  # major | minor | patch
title: "Password Reset & Feedback Management"
description: "Added password reset functionality and improved feedback tracking"
---
```

**Content Guidelines:**
- ✅ **Good:** "Password reset functionality - Admins can now send password reset emails to users"
- ❌ **Bad:** "Implemented VerificationToken model for password reset tokens with 24-hour expiration"
- ✅ **Good:** "Search box now keeps focus while you type"
- ❌ **Bad:** "Fixed React state management issue causing input blur on keystroke"

**Related Docs:** 
- Full research document: `ldc-tools/docs/RELEASE-NOTES-RECOMMENDATIONS.md`
- Implementation: `ldc-tools/frontend/src/app/release-notes/`
- D-LDC-007: Release notes redesign decision

---

## Policy: Feedback Status Transition Validation Pattern
**Type:** policy
**Target:** policy/feedback-status-transitions.md
**Affects:** all
**Date:** 2026-02-16

**Standard:** When validating feedback status transitions that require additional data (like resolution comments), check for existing data before requiring new data

**Rationale:** 
- Users may need to change status back and forth (e.g., CLOSED → RESOLVED)
- Requiring new data when existing data satisfies the requirement creates poor UX
- D-024 requires resolution comments for RESOLVED/CLOSED status, but doesn't require NEW comments on every transition

**Requirements:**
```typescript
// ❌ BAD: Requires new comment even if one exists
if (status === 'RESOLVED' && !newComment) {
  return error('Resolution comment required')
}

// ✅ GOOD: Allows existing comment to satisfy requirement
const currentFeedback = await prisma.feedback.findUnique({ where: { id } })
if (status === 'RESOLVED') {
  const hasExistingComment = currentFeedback.resolutionComment?.trim()
  const hasNewComment = newComment?.trim()
  
  if (!hasExistingComment && !hasNewComment) {
    return error('Resolution comment required')
  }
}

// Update: preserve existing comment if no new one provided
await prisma.feedback.update({
  where: { id },
  data: {
    status: newStatus,
    resolutionComment: newComment?.trim() || currentFeedback.resolutionComment || null
  }
})
```

**Enforcement:** 
- Code review for status transition endpoints
- Test cases covering bidirectional transitions (NEW → RESOLVED → CLOSED → RESOLVED)
- API validation logic should fetch current state before validation

**Exceptions:** 
- If policy explicitly requires NEW comment on every transition (not current D-024 requirement)
- If audit trail requires separate comment history (use separate comments table instead)

**Impact:**
- Improves UX for admin users managing feedback
- Prevents 400 errors when changing status back to previous state
- Maintains D-024 compliance while being user-friendly

**References:** 
- D-024: Feedback Management Standard
- Bug fix: `ldc-tools` commit 3dbceaa (2026-02-15)
- Implementation: `ldc-tools/frontend/src/app/api/v1/admin/feedback/[id]/status/route.ts`

---
