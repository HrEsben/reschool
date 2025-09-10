-- Migration to normalize email addresses to lowercase for case-insensitive handling
-- This ensures consistent email storage and comparison across the application

-- Update invitations table to normalize emails to lowercase
UPDATE invitations 
SET email = LOWER(email) 
WHERE email != LOWER(email);

-- Update notifications table to normalize pending emails to lowercase  
UPDATE notifications 
SET pending_email = LOWER(pending_email) 
WHERE pending_email IS NOT NULL 
  AND pending_email != LOWER(pending_email);

-- Update users table to normalize emails to lowercase
UPDATE users 
SET email = LOWER(email) 
WHERE email != LOWER(email);

-- Add comment for future reference
COMMENT ON COLUMN invitations.email IS 'Email address normalized to lowercase for case-insensitive comparisons';
COMMENT ON COLUMN notifications.pending_email IS 'Pending email address normalized to lowercase for case-insensitive comparisons';
COMMENT ON COLUMN users.email IS 'Email address normalized to lowercase for case-insensitive comparisons';
