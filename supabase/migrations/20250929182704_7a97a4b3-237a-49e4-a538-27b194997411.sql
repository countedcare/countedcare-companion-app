-- Fix profiles table RLS policies to use standard auth.uid() syntax
-- This addresses the security finding about Customer Personal Information protection

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create improved policies with direct auth.uid() check (no subquery)
-- This is the recommended pattern from Supabase for better performance and clarity

-- Allow users to view only their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow users to insert only their own profile
CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to update only their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Note: DELETE is intentionally not allowed to prevent accidental data loss
-- If deletion is needed, it should be handled through a controlled process