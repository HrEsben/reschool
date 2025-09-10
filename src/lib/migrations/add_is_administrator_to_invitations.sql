-- Add is_administrator column to invitations table
-- This allows inviting users directly as administrators

ALTER TABLE invitations 
ADD COLUMN IF NOT EXISTS is_administrator BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN invitations.is_administrator IS 'Whether the invited user should be granted administrator privileges';

-- Create index for administrator lookups
CREATE INDEX IF NOT EXISTS idx_invitations_is_administrator ON invitations(is_administrator);
