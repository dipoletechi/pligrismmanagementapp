-- Migration: Make only title required in bus_details table
-- Date: 2025-10-28
-- Description: Remove NOT NULL constraint from rc_no and make only title required

-- Remove NOT NULL constraint from rc_no
ALTER TABLE bus_details 
MODIFY COLUMN rc_no VARCHAR(20) NULL;

-- Remove UNIQUE constraint from rc_no since it's now optional
ALTER TABLE bus_details 
DROP INDEX rc_no;

