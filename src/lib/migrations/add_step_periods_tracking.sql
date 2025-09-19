-- Add table to track step activation periods
-- This allows us to track multiple periods when a step was active
-- (important for when steps are uncompleted and then reactivated)

CREATE TABLE IF NOT EXISTS indsatstrappe_step_periods (
  id SERIAL PRIMARY KEY,
  step_id INTEGER REFERENCES indsatstrappe_steps(id) ON DELETE CASCADE,
  start_date TIMESTAMP NOT NULL, -- When this period of activity started
  end_date TIMESTAMP NULL, -- When this period ended (NULL means currently active)
  activated_by INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Who activated this period
  deactivated_by INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Who ended this period
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_step_periods_step_id ON indsatstrappe_step_periods(step_id);
CREATE INDEX IF NOT EXISTS idx_step_periods_active ON indsatstrappe_step_periods(step_id, start_date, end_date) WHERE end_date IS NULL;
CREATE INDEX IF NOT EXISTS idx_step_periods_date_range ON indsatstrappe_step_periods(step_id, start_date, end_date);

-- Add a function to check for overlapping periods (we'll enforce this in application logic)
-- Note: We removed the GIST exclusion constraint due to PostgreSQL version compatibility issues

-- Migrate existing completed steps to have periods
-- For each completed step, create a period from creation to completion
INSERT INTO indsatstrappe_step_periods (step_id, start_date, end_date, activated_by, deactivated_by)
SELECT 
  id as step_id,
  created_at as start_date,
  completed_at as end_date,
  completed_by as activated_by,
  completed_by as deactivated_by
FROM indsatstrappe_steps 
WHERE is_completed = true AND completed_at IS NOT NULL
ON CONFLICT DO NOTHING;

-- For uncompleted steps, create an active period from creation to now
INSERT INTO indsatstrappe_step_periods (step_id, start_date, end_date, activated_by)
SELECT 
  id as step_id,
  created_at as start_date,
  NULL as end_date, -- Currently active
  completed_by as activated_by
FROM indsatstrappe_steps 
WHERE is_completed = false
ON CONFLICT DO NOTHING;