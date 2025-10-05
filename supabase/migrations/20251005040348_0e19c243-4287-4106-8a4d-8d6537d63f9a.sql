-- Remove SSN collection entirely since it's not needed and poses unnecessary security risk

-- Drop the trigger first
DROP TRIGGER IF EXISTS encrypt_ssn_before_insert_or_update ON public.care_recipients;

-- Drop the encryption functions
DROP FUNCTION IF EXISTS public.care_recipient_encrypt_ssn();
DROP FUNCTION IF EXISTS public.get_care_recipient_ssn(uuid);
DROP FUNCTION IF EXISTS public.encrypt_ssn(text);

-- Remove both SSN columns (plaintext and encrypted)
ALTER TABLE public.care_recipients 
DROP COLUMN IF EXISTS ssn_last_four,
DROP COLUMN IF EXISTS ssn_last_four_encrypted;

-- Add comment to document why SSN was removed
COMMENT ON TABLE public.care_recipients IS 'Care recipient information. SSN fields were removed to minimize collection of highly sensitive PII data.';