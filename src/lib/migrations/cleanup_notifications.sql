-- Comprehensive notification system fix
-- This script will:
-- 1. Apply the pending notifications migration if not already applied
-- 2. Clean up existing invalid notification states
-- 3. Update notification messages to use display names instead of emails

-- Step 1: Apply pending notifications migration (if not already applied)
-- Add support for pending notifications (linked to email before user exists)
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS pending_email VARCHAR(255);

-- Add index for pending email lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_notifications_pending_email ON notifications(pending_email);

-- Allow user_id to be nullable for pending notifications (if not already nullable)
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE notifications ALTER COLUMN user_id DROP NOT NULL;
    EXCEPTION
        WHEN others THEN
            -- Column is already nullable or doesn't exist, ignore
            RAISE NOTICE 'user_id column is already nullable or does not exist';
    END;
END $$;

-- Step 2: Show current state before cleanup
SELECT 
    'Before cleanup:' as status,
    COUNT(*) as total_notifications,
    COUNT(CASE WHEN user_id IS NOT NULL AND pending_email IS NULL THEN 1 END) as activated_notifications,
    COUNT(CASE WHEN user_id IS NULL AND pending_email IS NOT NULL THEN 1 END) as pending_notifications,
    COUNT(CASE WHEN user_id IS NOT NULL AND pending_email IS NOT NULL THEN 1 END) as invalid_notifications
FROM notifications;

-- Step 3: Clean up notifications that have both user_id and pending_email set
-- Clear the pending_email since these are already activated
UPDATE notifications 
SET pending_email = NULL, updated_at = NOW()
WHERE user_id IS NOT NULL AND pending_email IS NOT NULL;

-- Step 4: Update notification messages that use email addresses instead of display names
-- For user_joined_child notifications, replace email with display name from users table
UPDATE notifications n
SET 
    message = REPLACE(n.message, u.email, COALESCE(u.display_name, u.email)),
    data = jsonb_set(
        n.data, 
        '{userName}', 
        to_jsonb(COALESCE(u.display_name, u.email)), 
        false
    ),
    updated_at = NOW()
FROM users u
WHERE n.type = 'user_joined_child'
  AND n.data->>'userName' = u.email
  AND u.display_name IS NOT NULL
  AND u.display_name != '';

-- Step 5: Verify the cleanup
SELECT 
    'After cleanup:' as status,
    COUNT(*) as total_notifications,
    COUNT(CASE WHEN user_id IS NOT NULL AND pending_email IS NULL THEN 1 END) as activated_notifications,
    COUNT(CASE WHEN user_id IS NULL AND pending_email IS NOT NULL THEN 1 END) as pending_notifications,
    COUNT(CASE WHEN user_id IS NOT NULL AND pending_email IS NOT NULL THEN 1 END) as invalid_notifications
FROM notifications;

-- Step 6: Show updated notifications to verify name changes
SELECT 
    id,
    type,
    title,
    message,
    data->>'userName' as user_name_in_data,
    created_at,
    updated_at
FROM notifications 
WHERE type = 'user_joined_child'
ORDER BY updated_at DESC;
