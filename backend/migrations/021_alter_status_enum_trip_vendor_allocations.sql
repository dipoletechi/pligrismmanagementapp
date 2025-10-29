-- Alter status enum in trip_vendor_allocations table
-- Change from: ('pending', 'approved', 'processing', 'completed', 'cancelled')
-- To: ('paid', 'pending', 'approved')

ALTER TABLE trip_vendor_allocations 
MODIFY COLUMN status ENUM('paid', 'pending', 'approved') DEFAULT 'pending';

