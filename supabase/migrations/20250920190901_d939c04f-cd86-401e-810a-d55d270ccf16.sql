-- Create function to get all transactions for a user with their triage status
CREATE OR REPLACE FUNCTION public.get_all_user_transactions(
  p_user_id uuid,
  p_limit integer DEFAULT 100,
  p_offset integer DEFAULT 0,
  p_filter text DEFAULT 'all'
)
RETURNS TABLE(
  transaction_id text,
  account_id text,
  amount numeric,
  iso_currency_code text,
  date date,
  authorized_date date,
  name text,
  merchant_name text,
  category text,
  subcategory text,
  payment_channel text,
  location jsonb,
  pending boolean,
  merchant_entity_id text,
  personal_finance_category jsonb,
  triage_decision text,
  triage_created_at timestamp with time zone,
  expense_id uuid,
  expense_category text,
  is_potential_medical boolean,
  is_confirmed_medical boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    st.transaction_id::text,
    st.linked_account_id::text as account_id,
    st.amount,
    'USD'::text as iso_currency_code,
    st.date,
    st.date as authorized_date,
    st.description as name,
    st.merchant_name,
    st.category,
    st.category as subcategory,
    'online'::text as payment_channel,
    '{}'::jsonb as location,
    (st.review_status = 'pending')::boolean as pending,
    st.merchant_name as merchant_entity_id,
    '{}'::jsonb as personal_finance_category,
    tt.decision as triage_decision,
    tt.created_at as triage_created_at,
    e.id as expense_id,
    e.category as expense_category,
    st.is_potential_medical,
    st.is_confirmed_medical
  FROM public.synced_transactions st
  LEFT JOIN public.transaction_triage tt ON st.transaction_id = tt.transaction_id AND tt.user_id = p_user_id
  LEFT JOIN public.expenses e ON st.transaction_id = e.external_id AND e.user_id = p_user_id
  WHERE st.user_id = p_user_id
    AND (
      p_filter = 'all' OR
      (p_filter = 'pending' AND tt.transaction_id IS NULL) OR
      (p_filter = 'kept' AND tt.decision = 'keep') OR
      (p_filter = 'skipped' AND tt.decision = 'skip') OR
      (p_filter = 'medical' AND (st.is_potential_medical = true OR st.is_confirmed_medical = true))
    )
  ORDER BY st.date DESC, st.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$function$;