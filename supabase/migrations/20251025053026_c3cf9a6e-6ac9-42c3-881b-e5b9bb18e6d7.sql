-- Add missing columns to profiles table for onboarding
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS is_caregiver BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS caregiving_for TEXT[],
  ADD COLUMN IF NOT EXISTS zip_code TEXT,
  ADD COLUMN IF NOT EXISTS household_agi NUMERIC,
  ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false;

-- Create index on onboarding_complete for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_complete 
  ON public.profiles(onboarding_complete);

-- Update the trigger to populate profile fields from auth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    username, 
    full_name,
    name,
    email,
    onboarding_complete
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.email,
    false
  );
  RETURN NEW;
END;
$$;