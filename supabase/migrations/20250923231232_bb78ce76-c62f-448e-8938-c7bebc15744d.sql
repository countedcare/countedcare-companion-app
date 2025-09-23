-- Enable extensions for search/ranking
create extension if not exists pg_trgm;
create extension if not exists unaccent;

-- 1) Enums
do $$ begin
  create type resource_category as enum ('federal', 'state', 'county', 'nonprofit');
exception when duplicate_object then null; end $$;

-- 2) Resources table - drop existing table first
drop table if exists public.resources cascade;

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category resource_category not null,
  state_code text,                 -- e.g., 'CA' for state/county items
  county_name text,                -- e.g., 'Los Angeles'
  tags text[] default '{}',        -- e.g., '{tax,transportation,respite}'
  eligibility_summary text,
  application_steps text,
  documents_required text[],
  estimated_benefit_min numeric,   -- nullable
  estimated_benefit_max numeric,   -- nullable
  source_url text,                 -- info page
  apply_url text,                  -- direct application link
  contact_phone text,
  contact_email text,
  contact_hours text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index resources_state_idx on public.resources(state_code);
create index resources_county_idx on public.resources(county_name);
create index resources_category_idx on public.resources(category);
create index resources_tags_idx on public.resources using gin (tags);

-- Full-text search materialized field
alter table public.resources add column search_tsv tsvector;
create index resources_search_idx on public.resources using gin (search_tsv);

create or replace function public.resources_tsvector_update() returns trigger language plpgsql as $$
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

create trigger trg_resources_tsvector
before insert or update on public.resources
for each row execute function public.resources_tsvector_update();

-- 3) Bookmarks
create table public.resource_bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, resource_id)
);

create index resource_bookmarks_user_idx on public.resource_bookmarks(user_id);

-- 4) Analytics (simple event log)
create table public.resource_events (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  resource_id uuid references public.resources(id) on delete cascade,
  event_type text not null,  -- 'view', 'click_apply', 'click_source', 'save', 'unsave'
  context jsonb,             -- { "route": "/resources/:id" }
  created_at timestamptz default now()
);

-- Resource suggestions table
create table public.resource_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  link text,
  note text,
  created_at timestamptz default now()
);

-- 5) Search RPC with ranking
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
) language sql stable as $$
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