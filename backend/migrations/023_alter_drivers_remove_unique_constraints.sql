-- Migration: Remove unique constraints from drivers table
-- Date: 2025-10-28
-- Description: Remove UNIQUE constraints from aadhar_no and driving_license_no columns

-- Remove UNIQUE constraint from aadhar_no
ALTER TABLE drivers 
DROP INDEX aadhar_no;

-- Remove UNIQUE constraint from driving_license_no
ALTER TABLE drivers 
DROP INDEX driving_license_no;

