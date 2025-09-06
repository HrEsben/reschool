-- Create invitations table for tracking pending invites
CREATE TABLE IF NOT EXISTS invitations (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
  invited_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  relation VARCHAR(50) NOT NULL CHECK (relation IN ('Mor', 'Far', 'Underviser', 'Ressourceperson')),
  custom_relation_name VARCHAR(255),
  token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(email, child_id)
);

-- Create index for token lookups
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_child_id ON invitations(child_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
