-- Required for gen_random_uuid()
create extension if not exists pgcrypto;

-- 1) Session table (without generated column)
create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_session_id text not null,
  device_id text,
  started_at timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  ended_at timestamptz,
  display_name text,
  email text,
  user_agent text,
  ip text,
  constraint user_sessions_user_session_unique unique (user_id, client_session_id)
);

create index if not exists user_sessions_active_idx
  on public.user_sessions (ended_at, last_seen)
  where ended_at is null;

create index if not exists user_sessions_last_seen_idx
  on public.user_sessions (last_seen);

-- 2) RLS
alter table public.user_sessions enable row level security;

-- user can create their own session rows
create policy "own session insert"
on public.user_sessions
for insert
to authenticated
with check (auth.uid() = user_id);

-- user can update only their own session rows
create policy "own session update"
on public.user_sessions
for update
to authenticated
using (auth.uid() = user_id);

-- 3) Helper function to check if session is active
create or replace function public.is_session_active(session_row public.user_sessions)
returns boolean
language sql
immutable
as $$
  select session_row.ended_at is null and session_row.last_seen > now() - interval '2 minutes';
$$;

-- 4) Aggregation RPCs (safe to call from client)
create or replace function public.get_online_user_count()
returns integer
language sql
security definer
set search_path = public
as $$
  select count(distinct user_id)
  from public.user_sessions
  where ended_at is null
    and last_seen > now() - interval '2 minutes';
$$;

grant execute on function public.get_online_user_count() to anon, authenticated;

create or replace function public.get_online_users()
returns table(user_id uuid, display_name text, email text, last_seen timestamptz)
language sql
security definer
set search_path = public
as $$
  select user_id, display_name, email, last_seen
  from public.user_sessions
  where ended_at is null
    and last_seen > now() - interval '2 minutes';
$$;

grant execute on function public.get_online_users() to authenticated;