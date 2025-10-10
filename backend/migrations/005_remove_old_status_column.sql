-- Remove old status column from trips table
-- Keep only trip_status_id foreign key relationship

ALTER TABLE trips DROP COLUMN status;
