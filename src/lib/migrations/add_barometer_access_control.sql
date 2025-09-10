-- Add barometer access control table for fine-grained permissions

-- Create barometer_user_access table
CREATE TABLE IF NOT EXISTS barometer_user_access (
  id SERIAL PRIMARY KEY,
  barometer_id INTEGER REFERENCES barometers(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure each user can only have one access record per barometer
  UNIQUE(barometer_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_barometer_user_access_barometer_id ON barometer_user_access(barometer_id);
CREATE INDEX IF NOT EXISTS idx_barometer_user_access_user_id ON barometer_user_access(user_id);

-- Add is_public column to barometers table to indicate if barometer is accessible to all adults
ALTER TABLE barometers ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

-- Create index for is_public column
CREATE INDEX IF NOT EXISTS idx_barometers_is_public ON barometers(is_public);
