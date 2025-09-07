-- Add description column to barometers table

ALTER TABLE barometers 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add comment to the column
COMMENT ON COLUMN barometers.description IS 'Optional description explaining what users should evaluate';
