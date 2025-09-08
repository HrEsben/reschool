# Stack Auth Email Template Setup

## Issue
The custom email verification template is not being used - Stack Auth is still sending default emails instead of our Danish-branded templates.

## Solution
The custom email templates need to be activated in the Stack Auth dashboard.

### Steps to Activate Custom Email Templates

1. **Go to Stack Auth Dashboard**
   - Visit: https://app.stack-auth.com/
   - Log in to your ReSchool project

2. **Navigate to Email Templates**
   - Go to "Settings" or "Configuration"
   - Find "Email Templates" or "Email Settings" section

3. **Activate Custom Templates**
   For each email type, you need to:
   - Find the "Email Verification" template
   - Switch from "Default" to "Custom" 
   - Ensure the custom template is set as "Active" or "Primary"

4. **Email Types to Configure**
   - **Email Verification** (most important - currently not working)
   - Password Reset
   - Magic Link/OTP
   - Team Invitations
   - Sign-in Notifications

5. **Verify Configuration**
   - Send a test email verification
   - Check that the email uses the Danish template with ReSchool branding
   - Verify the Inter font and gradient logo are displayed correctly

### Template Files Location
The custom templates are defined in the Stack Auth dashboard and should match:
- Danish language text
- ReSchool branding and colors
- Inter font family
- Gradient logo
- Professional styling

### Expected Outcome
After activation, all authentication emails should:
- Be in Danish language
- Display the ReSchool gradient logo
- Use Inter font for professional appearance
- Match the overall site design and branding

### Testing
1. Create a new user account
2. Check the email verification email
3. Verify it uses the custom Danish template
4. Test other email types (password reset, etc.)

## Notes
- This is a configuration issue, not a code issue
- The templates themselves are correctly defined
- They just need to be activated in the Stack Auth dashboard
- This affects user experience and brand consistency
