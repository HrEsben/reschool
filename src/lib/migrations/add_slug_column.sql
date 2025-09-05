-- Add slug column to children table
ALTER TABLE children ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Create index on slug for better performance
CREATE INDEX IF NOT EXISTS idx_children_slug ON children(slug);

-- Update existing children with slugs based on their names
UPDATE children 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s\-æøåÆØÅ]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;
