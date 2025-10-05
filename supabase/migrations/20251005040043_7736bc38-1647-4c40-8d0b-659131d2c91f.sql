-- Enable pgsodium extension for encryption
CREATE EXTENSION IF NOT EXISTS pgsodium;

-- Add encrypted column for SSN storage
ALTER TABLE public.care_recipients 
ADD COLUMN IF NOT EXISTS ssn_last_four_encrypted bytea;

-- Create a security definer function to encrypt SSN data
CREATE OR REPLACE FUNCTION public.encrypt_ssn(ssn_value text)
RETURNS bytea
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF ssn_value IS NULL OR ssn_value = '' THEN
    RETURN NULL;
  END IF;
  
  RETURN pgsodium.crypto_aead_det_encrypt(
    convert_to(ssn_value, 'utf8'),
    convert_to('care_recipient_ssn', 'utf8'),
    NULL
  );
END;
$$;

-- Create a security definer function to decrypt SSN data (only for owner)
CREATE OR REPLACE FUNCTION public.get_care_recipient_ssn(recipient_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encrypted_ssn bytea;
  owner_id uuid;
  decrypted_value bytea;
BEGIN
  -- Get the encrypted SSN and verify ownership
  SELECT ssn_last_four_encrypted, user_id 
  INTO encrypted_ssn, owner_id
  FROM public.care_recipients 
  WHERE id = recipient_id;
  
  -- Only allow owner to decrypt
  IF owner_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized access to SSN data';
  END IF;
  
  -- Return NULL if no encrypted data
  IF encrypted_ssn IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Decrypt and return
  decrypted_value := pgsodium.crypto_aead_det_decrypt(
    encrypted_ssn,
    convert_to('care_recipient_ssn', 'utf8'),
    NULL
  );
  
  RETURN convert_from(decrypted_value, 'utf8');
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- Migrate existing SSN data to encrypted column
UPDATE public.care_recipients
SET ssn_last_four_encrypted = public.encrypt_ssn(ssn_last_four)
WHERE ssn_last_four IS NOT NULL AND ssn_last_four_encrypted IS NULL;

-- Create a trigger to automatically encrypt SSN on insert/update
CREATE OR REPLACE FUNCTION public.care_recipient_encrypt_ssn()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only encrypt if ssn_last_four is provided and encrypted column is empty
  IF NEW.ssn_last_four IS NOT NULL AND NEW.ssn_last_four_encrypted IS NULL THEN
    NEW.ssn_last_four_encrypted := public.encrypt_ssn(NEW.ssn_last_four);
  END IF;
  
  -- Clear the plaintext column for security
  NEW.ssn_last_four := NULL;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER encrypt_ssn_before_insert_or_update
  BEFORE INSERT OR UPDATE ON public.care_recipients
  FOR EACH ROW
  EXECUTE FUNCTION public.care_recipient_encrypt_ssn();

-- Add comment for documentation
COMMENT ON COLUMN public.care_recipients.ssn_last_four IS 'DEPRECATED: Use ssn_last_four_encrypted instead. This column is kept for backwards compatibility but will be NULL.';
COMMENT ON COLUMN public.care_recipients.ssn_last_four_encrypted IS 'Encrypted SSN last four digits using pgsodium. Use get_care_recipient_ssn(id) function to decrypt for authorized users.';