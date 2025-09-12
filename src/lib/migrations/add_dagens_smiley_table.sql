-- Add dagens_smiley and dagens_smiley_entries tables

-- Create dagens_smiley table (similar to barometers but for smiley tools)
CREATE TABLE IF NOT EXISTS dagens_smiley (
  id SERIAL PRIMARY KEY,
  child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
  created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  topic VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create dagens_smiley_entries table
CREATE TABLE IF NOT EXISTS dagens_smiley_entries (
  id SERIAL PRIMARY KEY,
  smiley_id INTEGER REFERENCES dagens_smiley(id) ON DELETE CASCADE,
  recorded_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  selected_emoji VARCHAR(20) NOT NULL, -- openmoji unicode or identifier
  reasoning TEXT, -- why the child chose this smiley
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure only one entry per smiley per day
  UNIQUE(smiley_id, entry_date)
);

-- Create user access control table for dagens_smiley (similar to barometer_user_access)
CREATE TABLE IF NOT EXISTS dagens_smiley_user_access (
  id SERIAL PRIMARY KEY,
  smiley_id INTEGER REFERENCES dagens_smiley(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure a user can only have access once per smiley
  UNIQUE(smiley_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dagens_smiley_child_id ON dagens_smiley(child_id);
CREATE INDEX IF NOT EXISTS idx_dagens_smiley_entries_smiley_id ON dagens_smiley_entries(smiley_id);
CREATE INDEX IF NOT EXISTS idx_dagens_smiley_entries_date ON dagens_smiley_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_dagens_smiley_user_access_smiley_id ON dagens_smiley_user_access(smiley_id);
CREATE INDEX IF NOT EXISTS idx_dagens_smiley_user_access_user_id ON dagens_smiley_user_access(user_id);
