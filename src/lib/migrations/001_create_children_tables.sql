-- Migration: Create children and user_child_relations tables
-- Execute this in your Neon database console

-- Create users table to sync Stack Auth users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  stack_auth_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  profile_image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create children table
CREATE TABLE IF NOT EXISTS children (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create user_child_relations table
CREATE TABLE IF NOT EXISTS user_child_relations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
  relation VARCHAR(50) NOT NULL CHECK (relation IN ('Mor', 'Far', 'Underviser', 'Ressourceperson')),
  custom_relation_name VARCHAR(255), -- For Ressourceperson type
  is_administrator BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, child_id) -- A user can only have one relation per child
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_stack_auth_id ON users(stack_auth_id);
CREATE INDEX IF NOT EXISTS idx_children_created_by ON children(created_by);
CREATE INDEX IF NOT EXISTS idx_user_child_relations_user_id ON user_child_relations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_child_relations_child_id ON user_child_relations(child_id);

-- Optional: Add some sample data for testing
-- INSERT INTO users (stack_auth_id, email, display_name) 
-- VALUES ('test-user-1', 'test@example.com', 'Test User')
-- ON CONFLICT (stack_auth_id) DO NOTHING;
