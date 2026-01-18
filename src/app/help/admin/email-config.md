# Email Configuration

## Overview
Configure email settings to enable LDC Tools to send notifications, user invitations, and system alerts.

## Supported Email Providers
- **Gmail** (Recommended)
- **Other SMTP Providers** (Outlook, custom mail servers)

## Setting Up Gmail

### Step 1: Create an App Password
1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Scroll to "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password (remove spaces)

### Step 2: Configure in LDC Tools
1. Go to **Admin → Email Configuration**
2. Fill in the form:
   - **Provider:** Gmail
   - **Display Name:** Your organization name
   - **SMTP Host:** smtp.gmail.com
   - **SMTP Port:** 587
   - **Encryption:** TLS (recommended)
   - **From Email:** your-email@gmail.com
   - **From Name:** LDC Tools (or your organization)
   - **Username:** your-email@gmail.com
   - **App Password:** Paste the 16-character password

3. Click **Save Configuration**

### Step 3: Test Your Configuration
1. Click **Test Email Configuration**
2. Enter a test email address
3. Check that the test email arrives
4. If successful, your email is ready!

## Troubleshooting

### "Username and Password not accepted"
- Verify you're using an **App Password**, not your regular Gmail password
- Remove any spaces from the app password
- Ensure 2-Step Verification is enabled on your Google account
- Try generating a new app password

### Test email not received
- Check spam/junk folders
- Verify the "From Email" address is correct
- Ensure SMTP settings match your provider
- For Gmail, confirm port 587 and TLS encryption

### "Email configuration not found"
- Make sure you've saved the configuration
- Only one configuration can be active at a time
- Check that "Active" is enabled

## Security Best Practices

✅ **Do:**
- Use app passwords, never your main account password
- Keep your app password secure
- Test configuration after setup
- Use TLS/SSL encryption

❌ **Don't:**
- Share your app password
- Use your regular email password
- Leave email configuration unsaved
- Disable encryption in production

## Email Features

Once configured, LDC Tools will use email for:
- **User Invitations:** Welcome emails with account setup links
- **Crew Request Notifications:** Alerts for new requests
- **System Alerts:** Important system notifications
- **Password Resets:** Secure password recovery (future)

## Advanced Settings

### Custom SMTP Providers
For non-Gmail providers:
1. Get SMTP settings from your email provider
2. Common ports:
   - **587:** TLS (STARTTLS)
   - **465:** SSL
   - **25:** Unencrypted (not recommended)

3. Update configuration with provider-specific settings

### Multiple Configurations
- Only one configuration can be active
- Previous configurations are deactivated automatically
- You can switch providers by creating a new configuration

## Related Help Topics
- [Inviting New Users](./invitations.md)
- [User Management](./users.md)
- [System Administration](./system.md)
