-- Update sengetider schema for new requirements
-- This modifies the existing sengetider tables to match the new specification

-- 1. First, add the new columns to sengetider table
ALTER TABLE sengetider 
ADD COLUMN IF NOT EXISTS puttetid TIME,  -- Bedtime/put to bed time
ADD COLUMN IF NOT EXISTS sov_kl TIME,    -- Fell asleep time
ADD COLUMN IF NOT EXISTS vaagnede TIME;  -- Wake up time

-- 2. Update sengetider_entries to use the new fields
ALTER TABLE sengetider_entries 
ADD COLUMN IF NOT EXISTS puttetid TIME,   -- Time put to bed
ADD COLUMN IF NOT EXISTS sov_kl TIME,     -- Time fell asleep  
ADD COLUMN IF NOT EXISTS vaagnede TIME;   -- Time woke up

-- 3. Drop the topic column since sengetider should be fixed per child
ALTER TABLE sengetider DROP COLUMN IF EXISTS topic;

-- 4. Drop the target_bedtime column as it's replaced by puttetid
ALTER TABLE sengetider DROP COLUMN IF EXISTS target_bedtime;

-- 5. Drop the actual_bedtime column from entries as it's replaced by the new fields
ALTER TABLE sengetider_entries DROP COLUMN IF EXISTS actual_bedtime;

-- 6. Add constraint to ensure only one sengetider per child
ALTER TABLE sengetider 
ADD CONSTRAINT IF NOT EXISTS unique_sengetider_per_child UNIQUE (child_id);

-- 7. Update the unique constraint on entries to allow multiple entries per day
-- (in case we want to track naps or multiple sleep periods)
ALTER TABLE sengetider_entries 
DROP CONSTRAINT IF EXISTS sengetider_entries_sengetider_id_entry_date_key;

-- 8. Add new constraint to ensure reasonable data entry
-- (entries should have at least puttetid, and times should be in logical order)
-- We'll handle validation in the application layer for more complex rules

-- 9. Create a view for easy querying of current week's data
CREATE OR REPLACE VIEW sengetider_current_week AS
SELECT 
  s.id as sengetider_id,
  s.child_id,
  s.description,
  s.is_public,
  s.created_by,
  e.id as entry_id,
  e.entry_date,
  e.puttetid,
  e.sov_kl,
  e.vaagnede,
  e.notes,
  e.recorded_by,
  e.created_at as entry_created_at
FROM sengetider s
LEFT JOIN sengetider_entries e ON s.id = e.sengetider_id
WHERE e.entry_date >= DATE_TRUNC('week', CURRENT_DATE)
  AND e.entry_date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
ORDER BY s.child_id, e.entry_date DESC;

-- 10. Update indexes to reflect new schema
DROP INDEX IF EXISTS idx_sengetider_entries_date;
CREATE INDEX IF NOT EXISTS idx_sengetider_entries_date_puttetid ON sengetider_entries(entry_date, puttetid);
CREATE INDEX IF NOT EXISTS idx_sengetider_child_unique ON sengetider(child_id) WHERE child_id IS NOT NULL;
