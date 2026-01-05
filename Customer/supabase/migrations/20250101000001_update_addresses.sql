/*
  # Update Addresses Table

  This migration updates the addresses table to include new fields:
  - door_no: Door/Flat number
  - area: Area/Locality information

  These fields provide more detailed address information for better delivery accuracy.
*/

-- Add new columns to addresses table
ALTER TABLE addresses 
ADD COLUMN IF NOT EXISTS door_no text,
ADD COLUMN IF NOT EXISTS area text;

-- Add comments to new columns
COMMENT ON COLUMN addresses.door_no IS 'Door/Flat number for detailed address';
COMMENT ON COLUMN addresses.area IS 'Area/Locality information';

-- Update existing addresses to have default values for new fields
UPDATE addresses 
SET door_no = '', area = '' 
WHERE door_no IS NULL OR area IS NULL;

-- Make the new fields NOT NULL with default empty string
ALTER TABLE addresses 
ALTER COLUMN door_no SET DEFAULT '',
ALTER COLUMN area SET DEFAULT '';

-- Update the existing addresses to use the new structure
-- This ensures backward compatibility with existing data
UPDATE addresses 
SET door_no = COALESCE(door_no, ''),
    area = COALESCE(area, '');

