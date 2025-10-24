-- Remove finance_data column from trips table
-- This column is no longer needed as all finance data is now stored in trip_vendor_allocations table

ALTER TABLE trips
DROP COLUMN IF EXISTS finance_data;
