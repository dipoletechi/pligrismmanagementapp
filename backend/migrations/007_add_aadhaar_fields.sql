-- Add Aadhaar verification fields to users table
ALTER TABLE users 
ADD COLUMN aadhaar_number VARCHAR(12) NULL,
ADD COLUMN aadhaar_front_image TEXT NULL,
ADD COLUMN aadhaar_back_image TEXT NULL,
ADD COLUMN aadhaar_name VARCHAR(100) NULL,
ADD COLUMN aadhaar_address TEXT NULL,
ADD COLUMN account_status ENUM('pending', 'in_verification', 'approved', 'rejected') DEFAULT 'pending';
