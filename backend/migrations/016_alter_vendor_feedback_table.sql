-- Alter vendor_feedback table to add vendor type columns and remove vendorid
-- This migration adds the new vendor type structure

-- Add new vendor type columns
ALTER TABLE vendor_feedback 
ADD COLUMN transport_vendor_id INT NULL AFTER vendorid,
ADD COLUMN accommodation_vendor_id INT NULL AFTER transport_vendor_id,
ADD COLUMN food_vendor_id INT NULL AFTER accommodation_vendor_id,
ADD COLUMN vendor_type ENUM('transport', 'accommodation', 'food') AFTER food_vendor_id;

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

-- Add indexes for better performance
CREATE INDEX idx_vendor_feedback_transport_vendor_id ON vendor_feedback(transport_vendor_id);
CREATE INDEX idx_vendor_feedback_accommodation_vendor_id ON vendor_feedback(accommodation_vendor_id);
CREATE INDEX idx_vendor_feedback_food_vendor_id ON vendor_feedback(food_vendor_id);
CREATE INDEX idx_vendor_feedback_vendor_type ON vendor_feedback(vendor_type);
