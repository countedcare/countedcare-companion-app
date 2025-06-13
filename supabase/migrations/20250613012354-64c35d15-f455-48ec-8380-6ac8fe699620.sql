
-- Add missing stripe_account_id field to linked_accounts table
ALTER TABLE linked_accounts 
ADD COLUMN IF NOT EXISTS stripe_account_id text;
