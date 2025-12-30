# 📋 Multi-Tenant Audit Logs

## Overview

The Multi-Tenant Audit Logs feature helps Super Admins track all Construction Group operations and cross-tenant activities. This powerful tool provides complete visibility into who made what changes, when, and from where.

## What Gets Logged

The system automatically tracks:

- **Construction Group Changes** - Creating, editing, or deleting CGs
- **CG Filter Changes** - When Super Admins switch between CGs
- **User Operations** - User creation, updates, and role changes
- **Volunteer Operations** - Volunteer data changes across CGs
- **Login Activity** - User authentication events

## How to Access Audit Logs

1. Go to **Admin** → **Audit Logs** (in the sidebar)
2. You'll see two options:
   - **General Audit Logs** - Standard system activity
   - **Multi-Tenant Audit Logs** - CG operations and cross-tenant tracking
3. Click on **Multi-Tenant Audit Logs** to view CG-specific activities

## Understanding the Audit Log Table

Each log entry shows:

- **Timestamp** - When the action occurred
- **User** - Who performed the action (name and email)
- **Action** - What they did (Login, CG Created, CG Updated, etc.)
- **Resource** - What was affected (Construction Group, User, Volunteer, etc.)
- **CG Change** - Shows CG transitions (e.g., CG 01.12 → CG 01.15)
- **Details** - Click "Show" to see more information

## Filtering Audit Logs

Use the filters at the top to find specific activities:

### Filter by Action
- **All Actions** - See everything
- **Login** - User login events
- **CG Created** - New Construction Groups
- **CG Updated** - CG edits
- **CG Deleted** - CG deletions
- **CG Reactivated** - Restored CGs
- **CG Filter Change** - Super Admin CG switches
- **User Created** - New user accounts
- **Volunteer Updated** - Volunteer data changes

### Filter by Resource
- **Construction Group** - CG operations
- **User** - User account changes
- **Volunteer** - Volunteer data changes
- **Session** - Login/logout events

### Filter by Date Range
- **From Date** - Start of date range
- **To Date** - End of date range

### Search
Type keywords to search across all log fields.

## Viewing Detailed Information

Click the **Show** button on any log entry to see:

- **IP Address** - Where the action came from
- **User Agent** - Browser and device information
- **Metadata** - Additional context about the action
- **Old Values** - What the data looked like before
- **New Values** - What the data looks like after

This is especially helpful for:
- Understanding what changed in a CG edit
- Tracking down who made a specific change
- Investigating security concerns
- Compliance and auditing requirements

## Exporting Audit Logs

Need to save or share audit logs?

1. Apply any filters you want
2. Click the **Export CSV** button at the top
3. The file will download with all filtered logs
4. Open in Excel or any spreadsheet program

The CSV includes:
- Timestamp
- User name and email
- Action type
- Resource type
- IP address
- Construction Group changes

## Common Use Cases

### Track CG Deletions
1. Filter by Action: **CG Deleted**
2. See who deleted which CGs and when
3. Click Show to see the full CG details that were deleted

### Monitor Super Admin Activity
1. Filter by Action: **CG Filter Change**
2. See when Super Admins switch between CGs
3. Useful for security and compliance tracking

### Investigate Data Changes
1. Filter by Resource: **Volunteer**
2. Filter by date range
3. Click Show on entries to see before/after values
4. Identify who made changes to volunteer data

### Audit CG Operations
1. Filter by Resource: **Construction Group**
2. See all CG create, update, delete, and reactivate operations
3. Export to CSV for reporting

## Frequently Asked Questions

### Who can access audit logs?

Only **Super Admins** can view multi-tenant audit logs. This ensures sensitive operational data is protected.

### How long are logs kept?

Audit logs are retained indefinitely for compliance purposes. They are never automatically deleted.

### Can I delete audit logs?

No. Audit logs are immutable and cannot be edited or deleted. This ensures data integrity for compliance.

### Why don't I see some actions?

You might be viewing **General Audit Logs** instead of **Multi-Tenant Audit Logs**. Make sure you're on the Multi-Tenant page for CG-specific operations.

### What's the difference between General and Multi-Tenant logs?

- **General Audit Logs** - Standard system operations (email config, announcements, etc.)
- **Multi-Tenant Audit Logs** - Construction Group operations and cross-tenant activities

### Can I see who viewed data?

Currently, the system logs changes (create, update, delete) but not read operations. This keeps the log volume manageable.

### What if I need logs from before this feature was added?

Multi-tenant audit logging was added in version 1.24.0. Only actions after this version are tracked in the multi-tenant logs.

## Best Practices

✅ **Regular Reviews** - Check audit logs weekly for unusual activity

✅ **Export Important Logs** - Save CSV exports for significant events

✅ **Use Filters** - Don't try to review all logs at once - filter to what matters

✅ **Check Before Deleting** - Review audit logs before deleting CGs to understand impact

✅ **Document Investigations** - Export and save logs when investigating issues

## Quick Access

**Admin** → **Audit Logs** → **Multi-Tenant Audit Logs**

---

**Need Help?**
- Contact your system administrator
- Send feedback using the **Send Feedback** button
- Check the main Help Center for other topics
