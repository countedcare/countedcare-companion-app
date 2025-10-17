-- Create encrypted token storage using pgsodium in public schema
-- This provides encryption at rest for sensitive Plaid OAuth tokens

-- Create encrypted tokens table in public schema
CREATE TABLE IF NOT EXISTS public.encrypted_plaid_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  linked_account_id UUID NOT NULL REFERENCES public.linked_accounts(id) ON DELETE CASCADE,
  encrypted_access_token TEXT NOT NULL, -- Encrypted using pgsodium
  nonce TEXT NOT NULL, -- Nonce for encryption
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_encrypted_account_token UNIQUE (linked_account_id)
);

-- Create index for faster lookups
CREATE INDEX idx_encrypted_plaid_tokens_account ON public.encrypted_plaid_tokens(linked_account_id);
CREATE INDEX idx_encrypted_plaid_tokens_user ON public.encrypted_plaid_tokens(user_id);

-- Enable RLS
ALTER TABLE public.encrypted_plaid_tokens ENABLE ROW LEVEL SECURITY;

-- Service role can access all tokens (for edge functions)
CREATE POLICY "Service role can manage encrypted tokens"
ON public.encrypted_plaid_tokens
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Function to encrypt and store Plaid access token
CREATE OR REPLACE FUNCTION public.store_encrypted_plaid_token(
  p_user_id UUID,
  p_account_id UUID,
  p_token TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pgsodium, pg_catalog
AS $$
DECLARE
  v_nonce TEXT;
  v_encrypted TEXT;
  v_token_id UUID;
  v_key_id BIGINT;
BEGIN
  -- Get or create encryption key
  SELECT id INTO v_key_id FROM pgsodium.key WHERE name = 'plaid_tokens_key';
  
  IF v_key_id IS NULL THEN
    -- Create new key for Plaid tokens
    INSERT INTO pgsodium.key (name) 
    VALUES ('plaid_tokens_key')
    RETURNING id INTO v_key_id;
  END IF;
  
  -- Generate a random nonce
  v_nonce := encode(pgsodium.crypto_secretbox_noncegen(), 'base64');
  
  -- Encrypt the token using the key
  v_encrypted := encode(
    pgsodium.crypto_secretbox(
      p_token::bytea,
      decode(v_nonce, 'base64'),
      (SELECT raw_key FROM pgsodium.key WHERE id = v_key_id)
    ),
    'base64'
  );
  
  -- Store encrypted token
  INSERT INTO public.encrypted_plaid_tokens (
    user_id, 
    linked_account_id, 
    encrypted_access_token,
    nonce
  )
  VALUES (p_user_id, p_account_id, v_encrypted, v_nonce)
  ON CONFLICT (linked_account_id) 
  DO UPDATE SET 
    encrypted_access_token = EXCLUDED.encrypted_access_token,
    nonce = EXCLUDED.nonce,
    updated_at = now()
  RETURNING id INTO v_token_id;
  
  RETURN v_token_id;
END;
$$;

-- Function to decrypt and retrieve Plaid access token
CREATE OR REPLACE FUNCTION public.get_decrypted_plaid_token(p_account_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pgsodium, pg_catalog
AS $$
DECLARE
  v_encrypted TEXT;
  v_nonce TEXT;
  v_decrypted BYTEA;
  v_key_id BIGINT;
BEGIN
  -- Fetch encrypted token and nonce
  SELECT encrypted_access_token, nonce
  INTO v_encrypted, v_nonce
  FROM public.encrypted_plaid_tokens
  WHERE linked_account_id = p_account_id;
  
  IF v_encrypted IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get encryption key
  SELECT id INTO v_key_id FROM pgsodium.key WHERE name = 'plaid_tokens_key';
  
  IF v_key_id IS NULL THEN
    RAISE EXCEPTION 'Encryption key not found';
  END IF;
  
  -- Decrypt the token
  v_decrypted := pgsodium.crypto_secretbox_open(
    decode(v_encrypted, 'base64'),
    decode(v_nonce, 'base64'),
    (SELECT raw_key FROM pgsodium.key WHERE id = v_key_id)
  );
  
  IF v_decrypted IS NULL THEN
    RAISE EXCEPTION 'Failed to decrypt token';
  END IF;
  
  RETURN convert_from(v_decrypted, 'UTF8');
END;
$$;

-- Migration function to move existing plaintext tokens to encrypted storage
CREATE OR REPLACE FUNCTION public.migrate_plaid_tokens_to_encryption()
RETURNS TABLE(migrated_count INTEGER, failed_count INTEGER, error_details TEXT[])
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_migrated INTEGER := 0;
  v_failed INTEGER := 0;
  v_errors TEXT[] := ARRAY[]::TEXT[];
  v_account RECORD;
BEGIN
  -- Loop through all accounts with plaintext tokens
  FOR v_account IN 
    SELECT id, user_id, plaid_access_token
    FROM public.linked_accounts
    WHERE plaid_access_token IS NOT NULL
      AND plaid_access_token != ''
  LOOP
    BEGIN
      -- Store encrypted version
      PERFORM public.store_encrypted_plaid_token(
        v_account.user_id,
        v_account.id,
        v_account.plaid_access_token
      );
      
      v_migrated := v_migrated + 1;
    EXCEPTION WHEN OTHERS THEN
      v_failed := v_failed + 1;
      v_errors := array_append(v_errors, 
        format('Account %s: %s', v_account.id, SQLERRM)
      );
    END;
  END LOOP;
  
  RETURN QUERY SELECT v_migrated, v_failed, v_errors;
END;
$$;