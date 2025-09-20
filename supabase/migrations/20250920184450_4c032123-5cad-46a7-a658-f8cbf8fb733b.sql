-- Fix search path security warnings for functions
CREATE OR REPLACE FUNCTION public.update_triage_stats(p_user_id uuid, p_decision text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_triage_stats (user_id, reviewed_today, total_to_review, last_reset_date)
  VALUES (p_user_id, 1, 0, CURRENT_DATE)
  ON CONFLICT (user_id) DO UPDATE SET
    reviewed_today = CASE 
      WHEN user_triage_stats.last_reset_date < CURRENT_DATE THEN 1
      ELSE user_triage_stats.reviewed_today + 1
    END,
    last_reset_date = CURRENT_DATE,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_pending_triage_transactions(p_user_id uuid, p_limit integer DEFAULT 50)
RETURNS TABLE (
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
  personal_finance_category jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    '{}'::jsonb as personal_finance_category
  FROM public.synced_transactions st
  LEFT JOIN public.transaction_triage tt ON st.transaction_id = tt.transaction_id AND tt.user_id = p_user_id
  WHERE st.user_id = p_user_id
    AND tt.transaction_id IS NULL  -- Not yet triaged
    AND st.review_status = 'pending'
  ORDER BY st.date DESC, st.created_at DESC
  LIMIT p_limit;
END;
$$;