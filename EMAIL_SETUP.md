# Email Verification Setup Guide

## Overview
The email verification feature is now fully implemented in both the backend and frontend. Users must verify their email address before they can log in to the application.

## What Was Fixed

### Backend Changes
1. **Added Spring Mail Dependency** (`pom.xml`)
   - Added `spring-boot-starter-mail` dependency for email sending capability

2. **Created EmailService** (`src/main/java/com/shems/service/EmailService.java`)
   - Handles sending verification emails to users
   - Generates verification links with tokens
   - Configurable email template with 24-hour expiry message

3. **Updated AuthService** (`src/main/java/com/shems/service/AuthService.java`)
   - Integrated email sending into the registration process
   - Creates verification token with 24-hour expiry
   - Automatically sends verification email after successful registration

4. **Updated AuthController** 
   - Endpoint `/auth/verify-email` processes email verification tokens
   - Returns success/error messages to the frontend

5. **Updated Application Properties** (`application.properties`)
   - Added email configuration with environment variable support
   - Default configuration uses Gmail SMTP server (configurable)

### Frontend Changes
1. **Register.jsx** - Already updated to show verification prompt after registration
2. **VerifyEmail.jsx** - Handles email verification when user clicks the link
3. **Login.jsx** - Already updated to prevent login if email not verified
4. **App.jsx** - Routing configured for the `/verify-email` endpoint

## Email Configuration

### Option 1: Using Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the generated 16-character password

3. **Set Environment Variables** (Windows):
   ```powershell
   $env:MAIL_USERNAME = "your-email@gmail.com"
   $env:MAIL_PASSWORD = "your-16-char-app-password"
   $env:APP_BASE_URL = "http://localhost:5173"
   ```

4. **Start Backend with Environment Variables**:
   ```powershell
   $env:MAIL_USERNAME = "your-email@gmail.com"; $env:MAIL_PASSWORD = "app-password"; java -jar backend/target/shems-backend-1.0.0.jar
   ```

### Option 2: Using Other SMTP Services

Update `application.properties`:
```properties
spring.mail.host=your-smtp-host.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME:your-email}
spring.mail.password=${MAIL_PASSWORD:your-password}
```

### Option 3: For Local Testing (Using MailHog or Similar)

Install and run a local SMTP server:
1. Download MailHog from https://github.com/mailhog/MailHog
2. Run it: `./MailHog`
3. Update properties:
```properties
spring.mail.host=localhost
spring.mail.port=1025
spring.mail.username=
spring.mail.password=
```
Then check emails at http://localhost:8025

## Testing the Email Verification Flow

1. **Start the Backend**:
   ```bash
   cd backend
   java -jar target/shems-backend-1.0.0.jar
   ```

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Register a New Account**:
   - Go to http://localhost:5173/register
   - Fill in the registration form
   - Click "Register"
   - You should see a message saying "Confirmation email sent"

4. **Check Your Email**:
   - Look for an email from the configured sender
   - Click the verification link in the email

5. **Verify and Login**:
   - You'll be redirected to a success page
   - Then you can log in with your credentials

## Troubleshooting

### Emails Not Sending
1. Check backend logs for email errors
2. Verify email credentials are correct
3. Ensure `spring.mail.host` and port are accessible
4. Check firewall/network settings

### Invalid Verification Link
1. Ensure `APP_BASE_URL` matches your frontend URL
2. Check that the token is being passed correctly in the URL
3. Verify token hasn't expired (24-hour limit)

### Gmail Connection Issues
- Enable "Less secure app access" (if using regular password instead of app password)
- Or use OAuth2 for better security (requires additional configuration)

## Production Considerations

1. **Use Environment Variables**: Never hardcode credentials in properties files
2. **Use OAuth2 or API Keys**: Consider using SendGrid, Mailgun, or similar services
3. **Add Email Templates**: Use HTML templates for professional-looking emails
4. **Rate Limiting**: Prevent email spam with rate limiting
5. **Retry Logic**: Add retry mechanism for failed email sends
6. **Monitoring**: Log all email sending attempts for debugging

## Database Schema

The `users` table now includes three new fields:
- `email_verified` (BOOLEAN) - Whether email has been verified
- `verification_token` (VARCHAR) - Unique verification token
- `verification_token_expiry` (DATETIME) - When the token expires

## Next Steps

1. Configure email credentials before deploying
2. Test the complete flow from registration to verification to login
3. Customize email templates for branding
4. Add additional email notifications (password reset, etc.)
5. Implement admin dashboard for managing unverified accounts
