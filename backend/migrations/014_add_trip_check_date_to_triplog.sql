-- Add trip_check_date field to triplog table
-- This field will store the specific date when check-in/check-out occurred
-- This will help in grouping logs by date in the frontend

ALTER TABLE triplog 
ADD COLUMN trip_check_date DATE AFTER log_item_id;

-- Add index for better query performance when filtering by date
CREATE INDEX idx_triplog_trip_check_date ON triplog(trip_check_date);

-- Update existing records to set trip_check_date based on scanned_at
UPDATE triplog 
SET trip_check_date = DATE(scanned_at) 
WHERE trip_check_date IS NULL;
