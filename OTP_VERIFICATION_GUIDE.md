# OTP Email Verification Implementation - Complete

## Overview
The email verification system has been successfully updated from token-based (via email links) to **OTP-based (One-Time Password)** verification. Users now receive a 6-digit OTP code via email that they must enter in the registration form to verify their account.

## What Changed

### Backend Changes

#### 1. **User Entity** (`User.java`)
**From:**
- `verificationToken` (String) - Random token sent in email link
- `verificationTokenExpiry` (LocalDateTime) - 24-hour expiry

**To:**
- `verificationOTP` (String) - 6-digit numeric code
- `verificationOTPExpiry` (LocalDateTime) - 10-minute expiry

#### 2. **UserRepository** (`UserRepository.java`)
**From:**
- `findByVerificationToken(String token)`

**To:**
- `findByVerificationOTP(String otp)`

#### 3. **EmailService** (`EmailService.java`)
**From:**
- `sendVerificationEmail(String toEmail, String firstName, String token)` - Sends link

**To:**
- `sendVerificationOTP(String toEmail, String firstName, String otp)` - Sends 6-digit code

Email Template Changed:
```
Old: "Click the link below to verify your email address: [link]"
New: "Your email verification OTP is: 123456"
```

OTP Expiry: Changed from 24 hours to **10 minutes**

#### 4. **AuthService** (`AuthService.java`)
**Register Method:**
- Now generates 6-digit OTP using `generateOTP()` method
- Sends OTP via `emailService.sendVerificationOTP()`
- Sets 10-minute expiry instead of 24-hour

**Verification Method:**
- `verifyEmail(String otp)` instead of `verifyEmail(String token)`
- Validates OTP is exactly 6 digits
- Checks 10-minute expiry time
- Returns appropriate error messages for invalid/expired OTP

#### 5. **AuthController** (`AuthController.java`)
- `/auth/verify-email` endpoint now expects `{ "otp": "123456" }` instead of `{ "token": "xxx" }`

### Frontend Changes

#### 1. **API Service** (`api.js`)
```javascript
// Old: verifyEmail: (token) => apiClient.post('/auth/verify-email', { token })
// New:
verifyEmail: (otp) => apiClient.post('/auth/verify-email', { otp })
```

#### 2. **Register Component** (`Register.jsx`)
**New State Variables:**
- `otp` - Stores entered OTP value
- `otpLoading` - Loading state for OTP verification
- `otpError` - Error messages for OTP verification

**New Handler:**
- `handleOtpSubmit()` - Validates and submits OTP for verification
  - Validates OTP is exactly 6 digits
  - Calls `authAPI.verifyEmail(otp)`
  - Redirects to login on successful verification
  - Shows error messages for invalid/expired OTP

**Updated JSX:**
- Registration form shows OTP input field immediately after registration
- OTP input field:
  - Maximum 6 characters
  - Only accepts numeric input
  - Large font size for better UX (24px, monospace)
  - Special spacing between digits (letter-spacing: 8px)
  - Placeholder shows "000000"
  - Submit button disabled until all 6 digits entered
- Error messages display below OTP field
- Info text shows "Enter the 6-digit code from your verification email"

#### 3. **Auth Styles** (`Auth.css`)
**New OTP Input Styling:**
```css
#otp {
  font-size: 24px;
  letter-spacing: 8px;
  text-align: center;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

#otp:focus {
  border-color: #00A8E8;
  box-shadow: 0 0 0 3px rgba(0, 168, 232, 0.1);
}
```

## User Flow

### Before (Token-based)
1. User fills registration form → Click "Register"
2. Backend generates random token, sends email with verification link
3. User receives email with clickable link
4. User clicks link → Redirected to `/verify-email?token=xxx`
5. VerifyEmail component validates token
6. User redirected to login after successful verification

### After (OTP-based)
1. User fills registration form → Click "Register"
2. Backend generates 6-digit OTP, sends email with code
3. User receives email with OTP code
4. **OTP input form appears on same page** (no redirect needed)
5. User enters 6-digit OTP in the form
6. Backend validates OTP (10-minute window)
7. User automatically redirected to login after successful verification

## Benefits of OTP System

✅ **User-Friendly:**
- No clicking email links or copy-pasting URLs
- Direct input on registration page reduces friction
- Shorter verification window (10 min) encourages immediate action

✅ **Security:**
- 6-digit OTP is less guessable than long alphanumeric tokens
- 10-minute expiry prevents long-term token reuse
- OTP changes for each verification attempt

✅ **Flexibility:**
- Easy to implement "Resend OTP" feature later
- Can add rate limiting per email
- Better for mobile users (copy-paste easier than clicking links)

✅ **Analytics:**
- Easier to track verification completion in real-time
- No need to track email clicks

## Technical Details

### OTP Generation
```java
private String generateOTP() {
    int otp = 100000 + (int)(Math.random() * 900000);
    return String.valueOf(otp);
}
```
- Generates random 6-digit number: 100000 to 999999

### OTP Validation
```java
if (otp.length() != 6 || !otp.matches("\\d{6}")) {
    throw new Exception("Invalid OTP format");
}
```
- Frontend: Only accepts 6 numeric digits
- Backend: Double-validates format
- Checks expiry: 10 minutes from generation

### Email Configuration
No changes to email configuration - same SMTP settings apply:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
```

## Testing the OTP Verification

1. **Start Backend:**
   ```bash
   cd backend
   java -jar target/shems-backend-1.0.0.jar
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Register Account:**
   - Navigate to `/register`
   - Fill in all fields
   - Click "Register"

4. **Check Email:**
   - Look for email with subject: "Email Verification OTP - Smart Home Energy Management System"
   - Copy the 6-digit OTP code

5. **Enter OTP:**
   - Paste OTP into the form that appears on registration page
   - Or type it with numeric input only
   - Click "Verify Email"

6. **Success:**
   - Should see "Email verified successfully! Redirecting to login..."
   - Automatically redirected to login page after 2 seconds

## Future Enhancements

1. **Resend OTP:**
   - Add "Resend OTP" button with countdown timer
   - Limited to 3-5 resends per email
   - Useful if user deletes email accidentally

2. **Rate Limiting:**
   - Limit wrong OTP attempts (e.g., 5 attempts then 15-minute lockout)
   - Prevent brute force attacks

3. **SMS OTP:**
   - Add option for SMS-based OTP delivery
   - Store user phone number
   - Use Twilio or similar SMS service

4. **Multi-Channel:**
   - Allow user to choose between Email OTP or SMS OTP during registration

5. **Verification History:**
   - Track verification attempts
   - Log failed attempts for security audit

## Database Schema Update

Run this migration if needed:
```sql
ALTER TABLE users
ADD COLUMN verification_otp VARCHAR(6) DEFAULT NULL,
ADD COLUMN verification_otp_expiry DATETIME DEFAULT NULL,
DROP COLUMN verification_token,
DROP COLUMN verification_token_expiry;
```

Or Hibernate will auto-create columns if `spring.jpa.hibernate.ddl-auto=update` is set.

## Troubleshooting

### "Invalid OTP" Error
- Ensure 6 digits are entered
- Check email for correct OTP code
- OTP is case-sensitive (if custom implementation)

### "OTP has expired" Error
- OTP expires after 10 minutes
- Click "Back to Register" to get a new OTP
- Register again and new OTP will be sent

### Email Not Received
- Check Gmail/mail settings and app password
- Check spam folder
- Verify email address is correct
- Check backend logs for email send errors

### OTP Field Not Showing
- Ensure registration was successful first
- Check browser console for JavaScript errors
- Verify API endpoint is running (backend on port 3000)

## Files Modified

**Backend:**
- `pom.xml` - No changes (Spring Mail already added)
- `User.java` - Entity fields updated
- `UserRepository.java` - Query method renamed
- `EmailService.java` - Email template changed to send OTP
- `AuthService.java` - OTP generation and verification logic
- `AuthController.java` - Endpoint now handles OTP instead of token

**Frontend:**
- `api.js` - API call parameter changed from token to otp
- `Register.jsx` - OTP input form and handlers added
- `Auth.css` - OTP input styling added
- `App.jsx` - No changes (routing already configured)
- `VerifyEmail.jsx` - No longer used (kept for future use)

## Notes

- OTP is numerical and frontend enforces 6-digit format
- Backend validates OTP format and expiry
- No special characters or letters in OTP
- Easier UX on mobile devices
- Production: Consider adding rate limiting and abuse detection
- Backup: Keep token-based system as fallback if OTP delivery fails
