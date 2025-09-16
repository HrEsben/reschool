-- Add missing date columns to existing indsatstrappe table

-- Add start_date, completed_date, and is_completed columns to indsatstrappe table
ALTER TABLE indsatstrappe 
ADD COLUMN IF NOT EXISTS start_date DATE NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS completed_date DATE,
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN NOT NULL DEFAULT false;

-- Add target_end_date column to indsatstrappe_steps table (replacing targetCompletionDate)
ALTER TABLE indsatstrappe_steps 
ADD COLUMN IF NOT EXISTS target_end_date DATE,
ADD COLUMN IF NOT EXISTS målsætning TEXT;

-- Update any existing records to have start_date as today if NULL
UPDATE indsatstrappe 
SET start_date = CURRENT_DATE 
WHERE start_date IS NULL;

-- Create additional indexes for the new date columns
CREATE INDEX IF NOT EXISTS idx_indsatstrappe_start_date ON indsatstrappe(start_date);
CREATE INDEX IF NOT EXISTS idx_indsatstrappe_completed ON indsatstrappe(is_completed, completed_date) WHERE is_completed = true;
CREATE INDEX IF NOT EXISTS idx_indsatstrappe_steps_target_end ON indsatstrappe_steps(target_end_date) WHERE target_end_date IS NOT NULL;
