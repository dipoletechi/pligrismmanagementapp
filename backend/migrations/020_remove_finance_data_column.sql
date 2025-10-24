-- Remove finance_data column from trips table
-- This column is no longer needed as all finance data is now stored in trip_vendor_allocations table

-- Check if column exists before dropping (older MySQL compatibility)
-- If column doesn't exist, this will be skipped by migration error handler
ALTER TABLE trips DROP COLUMN finance_data;
