-- Update expenses table with Plaid integration fields
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS linked_account_id uuid;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS is_refund boolean DEFAULT false;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS memo text;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS category_raw jsonb;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS category_guess text;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS payment_channel text;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS status text DEFAULT 'posted';
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS location jsonb;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS counterparty_id text;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS receipt_urls text[] DEFAULT '{}';
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS receipt_required_at timestamptz;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS irs_reference_tag text;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS irs_description text;

-- Create unique index for external transaction IDs to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_expenses_external_id_user ON public.expenses(external_id, user_id) WHERE external_id IS NOT NULL;

-- Create table for tracking transaction triage decisions
CREATE TABLE IF NOT EXISTS public.transaction_triage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  transaction_id text NOT NULL,
  decision text NOT NULL CHECK (decision IN ('keep', 'skip')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, transaction_id)
);

-- Enable RLS on transaction_triage
ALTER TABLE public.transaction_triage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for transaction_triage
CREATE POLICY "Users can view their own triage decisions" 
ON public.transaction_triage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own triage decisions" 
ON public.transaction_triage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own triage decisions" 
ON public.transaction_triage 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create table for tracking user triage progress
CREATE TABLE IF NOT EXISTS public.user_triage_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  reviewed_today integer DEFAULT 0,
  total_to_review integer DEFAULT 0,
  last_reset_date date DEFAULT CURRENT_DATE,
  tips_shown integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on user_triage_stats
ALTER TABLE public.user_triage_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_triage_stats
CREATE POLICY "Users can view their own triage stats" 
ON public.user_triage_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own triage stats" 
ON public.user_triage_stats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own triage stats" 
ON public.user_triage_stats 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Function to update triage stats
CREATE OR REPLACE FUNCTION public.update_triage_stats(p_user_id uuid, p_decision text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to get pending transactions for triage
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