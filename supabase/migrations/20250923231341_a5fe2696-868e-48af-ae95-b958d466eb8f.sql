-- Fix security issues: Enable RLS and create policies

-- 1) Enable RLS on all tables
alter table public.resources enable row level security;
alter table public.resource_bookmarks enable row level security;
alter table public.resource_events enable row level security;
alter table public.resource_suggestions enable row level security;

-- 2) Fix function search paths
create or replace function public.resources_tsvector_update() 
returns trigger 
language plpgsql 
security definer
set search_path = public
as $$
begin
  new.search_tsv :=
    setweight(to_tsvector('english', coalesce(unaccent(new.title),'')), 'A') ||
    setweight(to_tsvector('english', coalesce(unaccent(new.description),'')), 'B') ||
    setweight(to_tsvector('english', coalesce(unaccent(new.eligibility_summary),'')), 'C') ||
    setweight(to_tsvector('english', coalesce(unaccent(new.application_steps),'')), 'C') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.documents_required,'{}'), ' ')), 'D') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.tags,'{}'), ' ')), 'D');
  return new;
end $$;

create or replace function public.search_resources(
  q text,
  p_state text default null,
  p_county text default null,
  p_category resource_category default null,
  p_tags text[] default null
)
returns table (
  id uuid,
  title text,
  description text,
  category resource_category,
  state_code text,
  county_name text,
  tags text[],
  estimated_benefit_min numeric,
  estimated_benefit_max numeric,
  rank real
) 
language sql 
stable 
security definer
set search_path = public
as $$
  select
    r.id, r.title, r.description, r.category, r.state_code, r.county_name, r.tags,
    r.estimated_benefit_min, r.estimated_benefit_max,
    (ts_rank(r.search_tsv, plainto_tsquery('english', unaccent(coalesce(q,'')))) +
     similarity(r.title, q)) as rank
  from public.resources r
  where r.is_active = true
    and (q is null or q = '' or r.search_tsv @@ plainto_tsquery('english', unaccent(q)) or r.title % q)
    and (p_category is null or r.category = p_category)
    and (p_state is null or r.state_code = p_state)
    and (p_county is null or r.county_name = p_county)
    and (p_tags is null or p_tags = '{}'::text[] or r.tags && p_tags)
  order by rank desc nulls last, r.title asc
  limit 100;
$$;

-- 3) Create RLS policies

-- Public read for resources (no auth required)
create policy "resources are readable by all"
on public.resources
for select
using (true);

-- Bookmarks: only owners can manage their rows; must be authenticated
create policy "bookmarks select own"
on public.resource_bookmarks
for select
using (auth.uid() = user_id);

create policy "bookmarks insert own"
on public.resource_bookmarks
for insert
with check (auth.uid() = user_id);

create policy "bookmarks delete own"
on public.resource_bookmarks
for delete
using (auth.uid() = user_id);

-- Events: insert only by logged-in users (optional: allow anonymous)
create policy "events insert (logged-in)"
on public.resource_events
for insert
with check (auth.uid() = user_id or user_id is null);

-- Suggestions: logged-in users can insert their own suggestions
create policy "suggestions insert (logged-in)"
on public.resource_suggestions
for insert
with check (auth.uid() = user_id);