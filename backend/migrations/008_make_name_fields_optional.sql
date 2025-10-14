-- Make firstName and lastName optional for mobile registration
ALTER TABLE users MODIFY COLUMN first_name VARCHAR(50) NULL;
ALTER TABLE users MODIFY COLUMN last_name VARCHAR(50) NULL;
