-- Fix search path for security
create or replace function public.is_session_active(session_row public.user_sessions)
returns boolean
language sql
immutable
security definer
set search_path = public
as $$
  select session_row.ended_at is null and session_row.last_seen > now() - interval '2 minutes';
$$;