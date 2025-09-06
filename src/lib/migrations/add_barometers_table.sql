-- Add barometers and barometer_entries tables

-- Create barometers table
CREATE TABLE IF NOT EXISTS barometers (
  id SERIAL PRIMARY KEY,
  child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
  created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  topic VARCHAR(255) NOT NULL,
  scale_min INTEGER NOT NULL DEFAULT 1,
  scale_max INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create barometer_entries table
CREATE TABLE IF NOT EXISTS barometer_entries (
  id SERIAL PRIMARY KEY,
  barometer_id INTEGER REFERENCES barometers(id) ON DELETE CASCADE,
  recorded_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure only one entry per barometer per day
  UNIQUE(barometer_id, entry_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_barometers_child_id ON barometers(child_id);
CREATE INDEX IF NOT EXISTS idx_barometer_entries_barometer_id ON barometer_entries(barometer_id);
CREATE INDEX IF NOT EXISTS idx_barometer_entries_date ON barometer_entries(entry_date);
