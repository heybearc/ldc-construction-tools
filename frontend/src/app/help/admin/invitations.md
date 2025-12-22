# Inviting New Users

## Overview
The user invitation system allows administrators to invite new users to LDC Tools via email. Invited users receive a personalized email with a secure link to set up their account.

## How to Invite a User

### Step 1: Access the Admin Panel
1. Click **Admin** in the main navigation
2. Select **Users** from the admin menu

### Step 2: Send an Invitation
1. Click the **Invite User** button
2. Fill in the invitation form:
   - **Name:** The person's full name (optional but recommended)
   - **Email:** Their email address
   - **Role:** Select their role in the system
   - **Zone/Region:** Select if applicable to their role

3. Click **Send Invitation**

### Step 3: What Happens Next
- The user receives an email with:
  - A personalized greeting using their name
  - Their assigned role
  - A secure invitation link
  - Instructions to set up their password

- The invitation link expires after **7 days**
- If they don't accept within 7 days, you'll need to send a new invitation

## What the User Sees

The invited user will:
1. Receive an email titled "You've been invited to LDC Tools"
2. Click the "Accept Invitation" button
3. See a welcome page showing their name, email, and role
4. Create a secure password (minimum 8 characters)
5. Be automatically logged in after setup

## Troubleshooting

### "Failed to send invitation"
- Check that email configuration is set up in Admin → Email Configuration
- Verify the email address is correct
- Ensure the user doesn't already have an account

### User didn't receive the email
- Check their spam/junk folder
- Verify the email address is correct
- Resend the invitation if needed

### Invitation link expired
- Send a new invitation from Admin → Users
- The old invitation link will no longer work

## Best Practices

✅ **Do:**
- Include the person's name for a personalized experience
- Double-check the email address before sending
- Verify you've selected the correct role
- Send invitations promptly when onboarding new users

❌ **Don't:**
- Share invitation links with anyone other than the intended recipient
- Reuse expired invitation links
- Send invitations to email addresses already in the system

## Security Notes

- Invitation links are unique and can only be used once
- Links automatically expire after 7 days
- Passwords must be at least 8 characters
- Users set their own passwords (admins never see them)
- Email addresses are verified through the invitation process

## Related Help Topics
- [User Management](../admin/users.md)
- [Email Configuration](../admin/email-config.md)
- [Roles and Permissions](../admin/roles.md)
