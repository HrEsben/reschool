-- Add sengetider (bedtime tracking) and sengetider_entries tables

-- Create sengetider table (similar to dagens_smiley but for bedtime tracking)
CREATE TABLE IF NOT EXISTS sengetider (
  id SERIAL PRIMARY KEY,
  child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
  created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  topic VARCHAR(255) NOT NULL,
  description TEXT,
  target_bedtime TIME, -- Target bedtime for this tracking tool
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create sengetider_entries table
CREATE TABLE IF NOT EXISTS sengetider_entries (
  id SERIAL PRIMARY KEY,
  sengetider_id INTEGER REFERENCES sengetider(id) ON DELETE CASCADE,
  recorded_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  actual_bedtime TIME NOT NULL, -- Time the child actually went to bed
  notes TEXT, -- Optional notes about the bedtime routine or any issues
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure only one entry per sengetider per day
  UNIQUE(sengetider_id, entry_date)
);

-- Create user access control table for sengetider (similar to dagens_smiley_user_access)
CREATE TABLE IF NOT EXISTS sengetider_user_access (
  id SERIAL PRIMARY KEY,
  sengetider_id INTEGER REFERENCES sengetider(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure a user can only have access once per sengetider
  UNIQUE(sengetider_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sengetider_child_id ON sengetider(child_id);
CREATE INDEX IF NOT EXISTS idx_sengetider_entries_sengetider_id ON sengetider_entries(sengetider_id);
CREATE INDEX IF NOT EXISTS idx_sengetider_entries_date ON sengetider_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_sengetider_user_access_sengetider_id ON sengetider_user_access(sengetider_id);
CREATE INDEX IF NOT EXISTS idx_sengetider_user_access_user_id ON sengetider_user_access(user_id);
