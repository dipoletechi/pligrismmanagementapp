-- Remove finance_data column from trips table
-- This column is no longer needed as all finance data is now stored in trip_vendor_allocations table

-- Note: IF EXISTS not supported in older MySQL versions
-- Migration script will handle error gracefully if column doesn't exist
ALTER TABLE trips DROP COLUMN finance_data;
