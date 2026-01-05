/*
  # OTP Verification System

  This migration creates a table to store OTP (One-Time Password) verifications
  for phone number-based authentication.

  Features:
  - Store OTP codes with expiration
  - Track verification status
  - Support for phone number authentication
  - Automatic cleanup of expired OTPs
*/

-- Create OTP verifications table
CREATE TABLE IF NOT EXISTS otp_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  otp text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies for OTP verifications
-- Note: This table is managed by edge functions with service role key
-- so we don't need user-specific policies

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_otp_verifications_phone ON otp_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires_at ON otp_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_verified ON otp_verifications(verified);

-- Function to clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_verifications 
  WHERE expires_at < now() 
  AND verified = false;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired OTPs (runs every hour)
-- Note: This requires pg_cron extension to be enabled
-- SELECT cron.schedule('cleanup-expired-otps', '0 * * * *', 'SELECT cleanup_expired_otps();');

-- Add phone column to user_profiles if it doesn't exist
-- (This might already exist from previous migrations)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN phone text;
  END IF;
END $$;

-- Create unique index on phone number for user profiles
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_phone_unique 
ON user_profiles(phone) 
WHERE phone IS NOT NULL;

-- Add comment to table
COMMENT ON TABLE otp_verifications IS 'Stores OTP codes for phone number verification';
COMMENT ON COLUMN otp_verifications.phone IS 'Phone number for OTP verification';
COMMENT ON COLUMN otp_verifications.otp IS '6-digit OTP code';
COMMENT ON COLUMN otp_verifications.expires_at IS 'OTP expiration timestamp (typically 5 minutes)';
COMMENT ON COLUMN otp_verifications.verified IS 'Whether the OTP has been successfully verified';

