-- Fix search_path for migrate_plaid_tokens_to_encryption function
CREATE OR REPLACE FUNCTION public.migrate_plaid_tokens_to_encryption()
RETURNS TABLE(migrated_count integer, failed_count integer, error_details text[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_migrated INTEGER := 0;
  v_failed INTEGER := 0;
  v_errors TEXT[] := ARRAY[]::TEXT[];
  v_account RECORD;
BEGIN
  FOR v_account IN 
    SELECT id, user_id, plaid_access_token
    FROM public.linked_accounts
    WHERE plaid_access_token IS NOT NULL
      AND plaid_access_token != ''
  LOOP
    BEGIN
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

-- Fix search_path for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)), 
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$;