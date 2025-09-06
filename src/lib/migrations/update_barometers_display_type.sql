-- Update barometers table to support different display types and higher scale

-- Add display_type column to barometers table
ALTER TABLE barometers 
ADD COLUMN IF NOT EXISTS display_type VARCHAR(20) DEFAULT 'numbers' CHECK (display_type IN ('numbers', 'smileys'));

-- Allow scale_max to go up to 100
ALTER TABLE barometers 
DROP CONSTRAINT IF EXISTS check_scale_max;

ALTER TABLE barometers 
ADD CONSTRAINT check_scale_max CHECK (scale_max <= 100 AND scale_max >= scale_min + 1);

-- Update existing data to use 'numbers' display type
UPDATE barometers SET display_type = 'numbers' WHERE display_type IS NULL;
