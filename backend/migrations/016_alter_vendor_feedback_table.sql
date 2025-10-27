-- Alter vendor_feedback table to add vendor type columns and remove vendorid
-- This migration adds the new vendor type structure

-- Add new vendor type columns
-- Note: Errors for duplicate columns will be handled gracefully by migration script
ALTER TABLE vendor_feedback 
ADD COLUMN transport_vendor_id INT NULL,
ADD COLUMN accommodation_vendor_id INT NULL,
ADD COLUMN food_vendor_id INT NULL,
ADD COLUMN vendor_type ENUM('transport', 'accommodation', 'food');

-- Add foreign key constraints
ALTER TABLE vendor_feedback 
ADD CONSTRAINT fk_vendor_feedback_transport_vendor 
FOREIGN KEY (transport_vendor_id) REFERENCES transport_vendors(id) ON DELETE CASCADE;

ALTER TABLE vendor_feedback 
ADD CONSTRAINT fk_vendor_feedback_accommodation_vendor 
FOREIGN KEY (accommodation_vendor_id) REFERENCES accommodation_vendors(id) ON DELETE CASCADE;

ALTER TABLE vendor_feedback 
ADD CONSTRAINT fk_vendor_feedback_food_vendor 
FOREIGN KEY (food_vendor_id) REFERENCES food_vendors(id) ON DELETE CASCADE;

-- Remove old vendorid column
-- ALTER TABLE vendor_feedback DROP COLUMN vendorid;

-- Add indexes for better performance (will be skipped if already exist)
ALTER TABLE vendor_feedback ADD INDEX idx_vendor_feedback_transport_vendor_id (transport_vendor_id);
ALTER TABLE vendor_feedback ADD INDEX idx_vendor_feedback_accommodation_vendor_id (accommodation_vendor_id);
ALTER TABLE vendor_feedback ADD INDEX idx_vendor_feedback_food_vendor_id (food_vendor_id);
ALTER TABLE vendor_feedback ADD INDEX idx_vendor_feedback_vendor_type (vendor_type);
