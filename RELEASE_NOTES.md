# LDC Tools v1.0.0 - Release Notes

**Release Date:** November 1, 2025  
**Status:** Production Ready 🎉

---

## 🎯 What's New

### NextAuth v4 Authentication
LDC Tools now uses industry-standard NextAuth v4 for secure, database-backed authentication.

**Key Features:**
- ✅ Secure password hashing with bcrypt
- ✅ JWT session tokens (24-hour expiry)
- ✅ Database-backed user management
- ✅ Login tracking and audit trail
- ✅ Role-based access control (RBAC)

### Application Rebranding
- **New Name:** LDC Tools (simplified from "LDC Construction Tools")
- **Updated UI:** Cleaner, more modern interface
- **Better UX:** Streamlined navigation and user experience

### Infrastructure Improvements
- **Blue-Green Deployment:** Zero-downtime deployments
- **Container Naming:** `ldctools-blue` and `ldctools-green`
- **MCP Integration:** Automated deployment management

---

## 🔐 Security Enhancements

### What Changed
1. **No More Hardcoded Credentials**
   - Old system had hardcoded passwords in source code
   - New system uses database-backed authentication

2. **Stronger Password Security**
   - Bcrypt hashing with 10 rounds
   - Passwords never stored in plain text

3. **Better Session Management**
   - JWT tokens instead of custom cookies
   - Automatic session expiration
   - Secure httpOnly cookies

---

## 📦 What Was Removed

### WMACS Authentication (Deprecated)
The custom WMACS authentication system has been completely removed and replaced with NextAuth v4.

**Removed Files:**
- `frontend/src/lib/auth.ts`
- `frontend/src/app/api/auth/signin/route.ts`
- Custom session cookie management

**Why?**
- Hardcoded credentials were a security risk
- Custom auth was harder to maintain
- NextAuth v4 is industry-standard and battle-tested

---

## 🚀 Deployment Information

### Environments

**BLUE (Staging/Testing)**
- URL: https://blue.ldctools.cloudigan.net
- Container: 133 (ldctools-blue)
- IP: 10.92.3.23

**GREEN (Production)**
- URL: https://green.ldctools.cloudigan.net
- Container: 135 (ldctools-green)
- IP: 10.92.3.25

**Database**
- PostgreSQL on Container 131
- IP: 10.92.3.21
- Database: `ldc_tools`

---

## 👤 User Information

### Default Admin Account
- **Email:** `admin@ldctools.local`
- **Password:** Contact your system administrator

### First-Time Login
1. Navigate to the login page
2. Enter your email and password
3. You'll be redirected to the dashboard
4. Session lasts 24 hours

### Password Requirements
- Minimum 8 characters
- Must be stored securely in database
- Contact admin for password resets

---

## 🔄 Migration Guide

### For Existing Users

**Important:** Old WMACS sessions will not work after this upgrade.

**Steps:**
1. Clear your browser cookies
2. Navigate to the login page
3. Log in with your database credentials
4. Your session will be valid for 24 hours

### For Administrators

**Database Setup:**
- Ensure PostgreSQL is running on Container 131
- Database `ldc_tools` must exist
- User `ldc_user` must have proper permissions

**Environment Variables:**
```bash
DATABASE_URL="postgresql://ldc_user:ldc_password@10.92.3.21:5432/ldc_tools"
NEXTAUTH_URL="https://blue.ldctools.cloudigan.net"
NEXTAUTH_SECRET="your-secret-here"
NODE_ENV="production"
```

---

## 🐛 Known Issues

None at this time. This is a stable release.

---

## 📚 Documentation

### Updated Documentation
- [README.md](./README.md) - Project overview
- [CHANGELOG.md](./CHANGELOG.md) - Detailed change history
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guide

### Help & Support
- Check the admin panel for system status
- Review logs in PM2: `pm2 logs ldc-production`
- Database issues: Check Container 131 PostgreSQL

---

## 🎯 Next Steps

### Recommended Actions
1. **Test on BLUE first** - Always test changes on the blue environment
2. **Monitor logs** - Watch PM2 logs for any issues
3. **Backup database** - Regular backups of PostgreSQL
4. **Update passwords** - Ensure all users have secure passwords

### Future Enhancements
- Email-based password reset
- Two-factor authentication (2FA)
- OAuth providers (Google, Microsoft)
- User invitation system
- Advanced audit logging

---

## 📞 Support

For issues or questions:
1. Check the [CHANGELOG.md](./CHANGELOG.md) for known issues
2. Review PM2 logs: `pm2 logs ldc-production`
3. Check database connectivity
4. Contact your system administrator

---

**Thank you for using LDC Tools v1.0.0!** 🎉
