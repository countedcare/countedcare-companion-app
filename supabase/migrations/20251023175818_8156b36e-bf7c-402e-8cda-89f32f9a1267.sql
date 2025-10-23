-- Create rate limiting table for API usage tracking
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  identifier TEXT NOT NULL, -- IP address or user_id
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(endpoint, identifier, window_start)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup 
ON public.api_rate_limits(endpoint, identifier, window_start);

-- Enable RLS
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Service role can manage rate limits
CREATE POLICY "Service role manages rate limits"
ON public.api_rate_limits FOR ALL
USING (true);

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_endpoint TEXT,
  p_identifier TEXT,
  p_max_requests INTEGER DEFAULT 10,
  p_window_minutes INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_count INTEGER;
BEGIN
  -- Calculate current window start (round down to nearest window)
  v_window_start := date_trunc('minute', now()) - 
    (EXTRACT(MINUTE FROM now())::INTEGER % p_window_minutes || ' minutes')::INTERVAL;
  
  -- Try to increment existing record
  UPDATE public.api_rate_limits
  SET request_count = request_count + 1,
      updated_at = now()
  WHERE endpoint = p_endpoint
    AND identifier = p_identifier
    AND window_start = v_window_start
  RETURNING request_count INTO v_count;
  
  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.api_rate_limits (endpoint, identifier, window_start, request_count)
    VALUES (p_endpoint, p_identifier, v_window_start, 1)
    RETURNING request_count INTO v_count;
  END IF;
  
  -- Return true if under limit, false if over
  RETURN v_count <= p_max_requests;
END;
$$;

-- Cleanup function to remove old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.api_rate_limits
  WHERE window_start < now() - INTERVAL '1 hour';
END;
$$;