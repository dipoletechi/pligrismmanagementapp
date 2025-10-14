-- Increase aadhaar_number column size to accommodate longer numbers
ALTER TABLE users 
MODIFY COLUMN aadhaar_number VARCHAR(20) NULL;
