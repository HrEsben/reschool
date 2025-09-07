-- Add smiley_type column to barometers table to support different smiley styles

-- Add smiley_type column to barometers table
ALTER TABLE barometers 
ADD COLUMN IF NOT EXISTS smiley_type VARCHAR(20) DEFAULT 'emojis' CHECK (smiley_type IN ('emojis', 'simple', 'subtle'));

-- Update existing smiley barometers to use 'emojis' smiley type by default
UPDATE barometers SET smiley_type = 'emojis' WHERE display_type = 'smileys' AND smiley_type IS NULL;

-- Also update the display_type constraint to include percentage
ALTER TABLE barometers 
DROP CONSTRAINT IF EXISTS barometers_display_type_check;

ALTER TABLE barometers 
ADD CONSTRAINT barometers_display_type_check CHECK (display_type IN ('numbers', 'smileys', 'percentage'));
