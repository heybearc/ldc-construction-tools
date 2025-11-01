# LDC Tools - Quick Help Guide

## 🚀 Getting Started

### Login
1. Navigate to: https://blue.ldctools.cloudigan.net or https://green.ldctools.cloudigan.net
2. Enter your email and password
3. Click "Sign in"

**Default Admin:**
- Email: `admin@ldctools.local`
- Password: Contact your administrator

### Session Duration
- Sessions last **24 hours**
- You'll be automatically logged out after 24 hours
- You can log out manually anytime

---

## 🏗️ Environments

### BLUE (Staging/Testing)
- **URL:** https://blue.ldctools.cloudigan.net
- **Purpose:** Testing new features before production
- **Container:** 133 (ldctools-blue)

### GREEN (Production)
- **URL:** https://green.ldctools.cloudigan.net
- **Purpose:** Live production environment
- **Container:** 135 (ldctools-green)

**Rule:** Always test on BLUE first!

---

## 📋 Common Tasks

### User Management
1. Go to **Admin** → **Users**
2. View all users, roles, and status
3. Invite new users (coming soon)

### Trade Teams
1. Go to **Trade Teams**
2. View all trade teams and crews
3. Manage team members

### Projects
1. Go to **Projects**
2. View active projects
3. Manage project assignments

### Volunteers
1. Go to **Volunteers**
2. Track volunteer information
3. View volunteer statistics

---

## 🔧 Troubleshooting

### Can't Log In
**Problem:** "Invalid email or password"

**Solutions:**
1. Check your email is correct
2. Verify password with administrator
3. Clear browser cookies and try again
4. Try a different browser

### Session Expired
**Problem:** Redirected to login page unexpectedly

**Solutions:**
1. Your 24-hour session expired
2. Simply log in again
3. Your session will be restored

### Page Not Loading
**Problem:** Blank page or loading forever

**Solutions:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Check your internet connection
4. Contact administrator if issue persists

### Access Denied
**Problem:** "You don't have permission to access this page"

**Solutions:**
1. Check your user role
2. Contact administrator to update permissions
3. You may need a different role assigned

---

## 🔐 Security Best Practices

### Password Security
- ✅ Use a strong, unique password
- ✅ Don't share your password
- ✅ Change password if compromised
- ✅ Log out on shared computers

### Session Security
- ✅ Always log out when done
- ✅ Don't leave sessions open on public computers
- ✅ Use secure networks (avoid public WiFi)

---

## 📊 Admin Panel

### System Health
**Admin** → **Health**
- View system status
- Check database connectivity
- Monitor application health

### Email Configuration
**Admin** → **Email**
- Configure SMTP settings
- Test email delivery
- Manage email templates

### API Management
**Admin** → **API**
- View API endpoints
- Check API health
- Monitor API usage

### Audit Logs
**Admin** → **Audit**
- View system activity
- Track user actions
- Monitor security events

---

## 🆘 Getting Help

### Documentation
- [README.md](./README.md) - Project overview
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [RELEASE_NOTES.md](./RELEASE_NOTES.md) - Latest release info
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Developer guide

### System Logs
Administrators can check logs:
```bash
# View application logs
ssh ldctools-blue "pm2 logs ldc-production"

# View last 50 lines
ssh ldctools-blue "pm2 logs ldc-production --lines 50"
```

### Database Issues
Check database connectivity:
```bash
# Test database connection
ssh prox "pct exec 131 -- psql -U ldc_user -d ldc_tools -c 'SELECT 1;'"
```

### Contact Support
1. Check this help guide first
2. Review [CHANGELOG.md](./CHANGELOG.md) for known issues
3. Contact your system administrator
4. Provide error messages and screenshots

---

## 📱 Browser Compatibility

### Supported Browsers
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

### Not Supported
- ❌ Internet Explorer
- ❌ Very old browser versions

---

## 🔄 Updates & Maintenance

### How Updates Work
1. New features tested on BLUE
2. After testing, deployed to GREEN
3. Zero-downtime deployments
4. You may need to refresh your browser

### When to Refresh
- After system updates
- If you see old data
- If features aren't working
- Hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`

---

## 💡 Tips & Tricks

### Keyboard Shortcuts
- `Ctrl+K` or `Cmd+K` - Quick search (if available)
- `Esc` - Close modals
- `Tab` - Navigate forms

### Performance
- Use Chrome for best performance
- Close unused tabs
- Clear cache if slow

### Mobile Access
- Works on mobile browsers
- Best experience on tablets
- Desktop recommended for admin tasks

---

## 📞 Quick Reference

| Item | Value |
|------|-------|
| **Version** | 1.0.0 |
| **Release Date** | November 1, 2025 |
| **Auth System** | NextAuth v4 |
| **Session Duration** | 24 hours |
| **Database** | PostgreSQL (Container 131) |
| **BLUE URL** | https://blue.ldctools.cloudigan.net |
| **GREEN URL** | https://green.ldctools.cloudigan.net |

---

**Need more help?** Check [RELEASE_NOTES.md](./RELEASE_NOTES.md) or contact your administrator.
