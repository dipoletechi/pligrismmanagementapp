-- Add mobile registration fields to users table
ALTER TABLE users 
ADD COLUMN phone VARCHAR(20) NULL,
ADD COLUMN registration_method ENUM('email', 'phone', 'digilocker') DEFAULT 'email',
ADD COLUMN otp VARCHAR(10) NULL,
ADD COLUMN otp_expiry DATETIME NULL,
ADD COLUMN is_email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN is_phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN age INT NULL,
ADD COLUMN digilocker_data JSON NULL;

-- Update existing users to have email verified
UPDATE users SET is_email_verified = TRUE WHERE email IS NOT NULL;

-- Make email nullable for phone-only registrations
ALTER TABLE users MODIFY COLUMN email VARCHAR(100) NULL;

-- Make password nullable for digilocker registrations
ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL;

-- Add unique constraint for phone
ALTER TABLE users ADD UNIQUE KEY unique_phone (phone);

-- Update role enum to match the new values
ALTER TABLE users MODIFY COLUMN role ENUM('superadmin', 'admin', 'trip_manager', 'financial_manager', 'user') DEFAULT 'user';
