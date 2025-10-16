-- Add missing SELECT and DELETE policies for user_sessions table
-- This allows users to view and manage their own session data for presence tracking

CREATE POLICY "Users can view their own sessions"
ON public.user_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
ON public.user_sessions
FOR DELETE
USING (auth.uid() = user_id);