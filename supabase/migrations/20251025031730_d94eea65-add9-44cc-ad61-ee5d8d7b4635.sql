-- Create table to cache beta access checks
CREATE TABLE IF NOT EXISTS public.user_beta_access (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  has_access BOOLEAN NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  payment_date TIMESTAMPTZ,
  free_trial_expenses INTEGER DEFAULT 0,
  free_trial_limit INTEGER DEFAULT 10,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_beta_access ENABLE ROW LEVEL SECURITY;

-- Users can view their own beta access status
CREATE POLICY "Users can view their own beta access"
ON public.user_beta_access FOR SELECT
USING (auth.uid() = user_id);

-- Only the service role can insert/update (edge functions)
CREATE POLICY "Service role can manage beta access"
ON public.user_beta_access FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_beta_access_user_id ON public.user_beta_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_beta_access_checked_at ON public.user_beta_access(checked_at);

-- Add trigger for updated_at
CREATE TRIGGER update_user_beta_access_updated_at
BEFORE UPDATE ON public.user_beta_access
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();