-- Add Indsatstrappe (intervention ladder/action plan) tables

-- Main indsatstrappe table - represents the overall action plan
CREATE TABLE IF NOT EXISTS indsatstrappe (
  id SERIAL PRIMARY KEY,
  child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
  created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL, -- e.g., "Få barnet tilbage i skolen"
  description TEXT, -- Overall goal description
  is_active BOOLEAN NOT NULL DEFAULT true, -- Can have multiple plans, but only one active
  start_date DATE NOT NULL DEFAULT CURRENT_DATE, -- When the plan starts (default today)
  target_date DATE, -- Optional target completion date (estimated)
  completed_date DATE, -- Actual completion date (only set when goal is reached)
  is_completed BOOLEAN NOT NULL DEFAULT false, -- Whether the overall goal has been reached
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Steps within an indsatstrappe
CREATE TABLE IF NOT EXISTS indsatstrappe_steps (
  id SERIAL PRIMARY KEY,
  indsatstrappe_id INTEGER REFERENCES indsatstrappe(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL, -- 1, 2, 3... for ordering (ascending)
  title VARCHAR(255) NOT NULL, -- e.g., "Første kontakt med skolen"
  description TEXT, -- Details about this step
  start_date DATE, -- When this step becomes active (optional, defaults to plan start or previous step end)
  target_end_date DATE, -- Expected end date for this step
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP NULL,
  completed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure step numbers are unique within an indsatstrappe
  UNIQUE(indsatstrappe_id, step_number)
);

-- Link tool entries to indsatstrappe steps (optional relationship)
-- This adds context to why a measurement was taken
CREATE TABLE IF NOT EXISTS indsatstrappe_tool_entries (
  id SERIAL PRIMARY KEY,
  indsatstrappe_step_id INTEGER REFERENCES indsatstrappe_steps(id) ON DELETE CASCADE,
  
  -- Reference to different tool entry types (only one should be set)
  barometer_entry_id INTEGER REFERENCES barometer_entries(id) ON DELETE CASCADE,
  dagens_smiley_entry_id INTEGER REFERENCES dagens_smiley_entries(id) ON DELETE CASCADE,
  sengetider_entry_id INTEGER REFERENCES sengetider_entries(id) ON DELETE CASCADE,
  
  notes TEXT, -- Additional context for why this entry relates to this step
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure an entry can only be linked to one step
  -- Check constraint ensures only one entry type is set
  CHECK (
    (barometer_entry_id IS NOT NULL)::int + 
    (dagens_smiley_entry_id IS NOT NULL)::int + 
    (sengetider_entry_id IS NOT NULL)::int = 1
  )
);

-- User access control for indsatstrappe (similar to tool access control)
CREATE TABLE IF NOT EXISTS indsatstrappe_user_access (
  id SERIAL PRIMARY KEY,
  indsatstrappe_id INTEGER REFERENCES indsatstrappe(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure a user can only have access once per indsatstrappe
  UNIQUE(indsatstrappe_id, user_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_indsatstrappe_child_id ON indsatstrappe(child_id);
CREATE INDEX IF NOT EXISTS idx_indsatstrappe_active ON indsatstrappe(child_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_indsatstrappe_steps_plan_id ON indsatstrappe_steps(indsatstrappe_id);
CREATE INDEX IF NOT EXISTS idx_indsatstrappe_steps_order ON indsatstrappe_steps(indsatstrappe_id, step_number);
CREATE INDEX IF NOT EXISTS idx_indsatstrappe_tool_entries_step_id ON indsatstrappe_tool_entries(indsatstrappe_step_id);
CREATE INDEX IF NOT EXISTS idx_indsatstrappe_tool_entries_barometer ON indsatstrappe_tool_entries(barometer_entry_id) WHERE barometer_entry_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_indsatstrappe_tool_entries_smiley ON indsatstrappe_tool_entries(dagens_smiley_entry_id) WHERE dagens_smiley_entry_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_indsatstrappe_tool_entries_sengetider ON indsatstrappe_tool_entries(sengetider_entry_id) WHERE sengetider_entry_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_indsatstrappe_user_access_plan_id ON indsatstrappe_user_access(indsatstrappe_id);
CREATE INDEX IF NOT EXISTS idx_indsatstrappe_user_access_user_id ON indsatstrappe_user_access(user_id);
