-- First, let's create a unique constraint to prevent duplicate user preferences
-- But first, we need to clean up the existing duplicates

-- Delete duplicate user_preferences, keeping only the most recent one for each user
DELETE FROM user_preferences 
WHERE id IN (
    SELECT id 
    FROM (
        SELECT id, 
               ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC, created_at DESC) as rn
        FROM user_preferences
    ) t 
    WHERE rn > 1
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE user_preferences 
ADD CONSTRAINT user_preferences_user_id_unique UNIQUE (user_id);