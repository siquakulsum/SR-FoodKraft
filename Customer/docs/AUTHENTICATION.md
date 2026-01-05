# Authentication System - SR FoodKraft

## Overview

The SR FoodKraft application now supports multiple authentication methods:

1. **Email/Password Login** - Traditional authentication
2. **OTP Login** - Phone number-based authentication with SMS OTP
3. **Forgot Password** - Email-based password reset

## Features

### 1. Email/Password Authentication

- Standard login with email and password
- Demo user: `demo@srfoodkraft.com` / `demo123`
- Integration with Supabase Auth

### 2. OTP Authentication

- Phone number-based login
- 6-digit SMS OTP verification
- 5-minute OTP expiration
- Automatic user profile creation for new OTP users
- Resend OTP functionality with 60-second cooldown

### 3. Forgot Password

- Email-based password reset
- Secure reset link generation
- Password update with confirmation
- Integration with Supabase Auth

## Implementation Details

### Frontend Components

#### OTPLogin Component (`src/components/Auth/OTPLogin.tsx`)

- Two-step process: phone input → OTP verification
- Real-time OTP input with 6-digit validation
- Countdown timer for resend functionality
- Error handling and loading states

#### ForgotPassword Component (`src/components/Auth/ForgotPassword.tsx`)

- Email input with validation
- Success confirmation screen
- Integration with Supabase password reset

#### ResetPasswordPage (`src/pages/ResetPasswordPage.tsx`)

- Secure password update form
- Password confirmation validation
- Success feedback and auto-redirect

### Backend Implementation

#### Supabase Edge Functions

**send-otp** (`supabase/functions/send-otp/index.ts`)

- Generates 6-digit OTP
- Stores OTP with 5-minute expiration
- SMS integration ready (Twilio example included)
- Development mode returns OTP for testing

**verify-otp** (`supabase/functions/verify-otp/index.ts`)

- Validates OTP against stored records
- Checks expiration
- Creates user profile for new OTP users
- Returns user data on successful verification

#### Database Schema

**otp_verifications table**

```sql
- id (uuid, primary key)
- phone (text, not null)
- otp (text, not null)
- expires_at (timestamptz, not null)
- verified (boolean, default false)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())
```

**user_profiles table** (updated)

- Added unique phone number index
- Support for OTP-based user creation

### Authentication Flow

#### OTP Login Flow

1. User enters phone number
2. System generates and stores 6-digit OTP
3. OTP sent via SMS (or logged in development)
4. User enters OTP
5. System verifies OTP and expiration
6. User profile created/retrieved
7. User logged in successfully

#### Forgot Password Flow

1. User enters email address
2. System sends password reset email via Supabase
3. User clicks reset link in email
4. User redirected to reset password page
5. User enters new password with confirmation
6. Password updated via Supabase Auth
7. User redirected to login page

## Configuration

### Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# SMS Service (for production)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### Supabase Setup

1. Run the migration: `supabase/migrations/20250101000000_otp_verification.sql`
2. Deploy edge functions:
   ```bash
   supabase functions deploy send-otp
   supabase functions deploy verify-otp
   ```
3. Configure CORS for edge functions
4. Set up SMS service integration

## Usage

### For Users

#### OTP Login

1. Go to login page
2. Click "OTP" tab
3. Enter phone number
4. Enter 6-digit OTP received via SMS
5. Access granted

#### Forgot Password

1. Go to login page
2. Click "Forgot your password?"
3. Enter email address
4. Check email for reset link
5. Click link and set new password

### For Developers

#### Testing OTP

- In development mode, OTP is logged to console
- Any 6-digit number works for demo purposes
- Use phone number format: `+91 98765 43210`

#### API Endpoints

- `POST /api/send-otp` - Send OTP to phone number
- `POST /api/verify-otp` - Verify OTP code

## Security Features

- OTP expiration (5 minutes)
- Rate limiting on OTP requests
- Secure password reset tokens
- Row Level Security (RLS) on all tables
- CORS protection on edge functions
- Input validation and sanitization

## Future Enhancements

1. **SMS Integration**: Full Twilio/AWS SNS integration
2. **Rate Limiting**: Implement request throttling
3. **Biometric Auth**: Fingerprint/face recognition
4. **Social Login**: Google, Facebook, Apple Sign-In
5. **2FA**: Two-factor authentication for enhanced security
6. **Audit Logs**: Track authentication events
7. **Account Lockout**: Temporary lockout after failed attempts

## Troubleshooting

### Common Issues

1. **OTP not received**

   - Check phone number format
   - Verify SMS service configuration
   - Check spam folder for SMS

2. **Reset link not working**

   - Check email configuration
   - Verify Supabase Auth settings
   - Ensure correct redirect URL

3. **Database errors**
   - Run migrations: `supabase db reset`
   - Check RLS policies
   - Verify table permissions

### Debug Mode

- Set `NODE_ENV=development` to see OTP in console
- Check browser network tab for API calls
- Review Supabase logs for edge function errors

