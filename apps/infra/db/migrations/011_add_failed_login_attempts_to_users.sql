-- Add failed_login_attempts and account_locked_until to users table
ALTER TABLE users
ADD COLUMN failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN account_locked_until TIMESTAMPTZ;