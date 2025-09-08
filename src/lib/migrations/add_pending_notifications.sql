-- Add support for pending notifications (linked to email before user exists)
ALTER TABLE notifications 
ADD COLUMN pending_email VARCHAR(255);

-- Add index for pending email lookups
CREATE INDEX IF NOT EXISTS idx_notifications_pending_email ON notifications(pending_email);

-- Allow user_id to be nullable for pending notifications
ALTER TABLE notifications 
ALTER COLUMN user_id DROP NOT NULL;
