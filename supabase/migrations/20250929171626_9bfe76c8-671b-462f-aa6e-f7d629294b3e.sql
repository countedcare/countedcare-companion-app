-- Address security concerns from scan

-- 1. Move extensions from public schema to extensions schema
-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_trgm extension to extensions schema
DROP EXTENSION IF EXISTS pg_trgm CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;

-- Move unaccent extension to extensions schema  
DROP EXTENSION IF EXISTS unaccent CASCADE;
CREATE EXTENSION IF NOT EXISTS unaccent SCHEMA extensions;

-- Update search path to include extensions schema
ALTER DATABASE postgres SET search_path = public, extensions;

-- 2. Restrict resources table access to authenticated users only
-- Drop the current public policy
DROP POLICY IF EXISTS "resources are readable by all" ON public.resources;

-- Create new policy that requires authentication
CREATE POLICY "resources are readable by authenticated users" 
ON public.resources 
FOR SELECT 
TO authenticated
USING (true);

-- Recreate the resources search function with proper schema references
CREATE OR REPLACE FUNCTION public.search_resources(q text, p_state text DEFAULT NULL::text, p_county text DEFAULT NULL::text, p_category resource_category DEFAULT NULL::resource_category, p_tags text[] DEFAULT NULL::text[])
 RETURNS TABLE(id uuid, title text, description text, category resource_category, state_code text, county_name text, tags text[], estimated_benefit_min numeric, estimated_benefit_max numeric, rank real)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
  select
    r.id, r.title, r.description, r.category, r.state_code, r.county_name, r.tags,
    r.estimated_benefit_min, r.estimated_benefit_max,
    (ts_rank(r.search_tsv, plainto_tsquery('english', extensions.unaccent(coalesce(q,'')))) +
     extensions.similarity(r.title, q)) as rank
  from public.resources r
  where r.is_active = true
    and (q is null or q = '' or r.search_tsv @@ plainto_tsquery('english', extensions.unaccent(q)) or r.title % q)
    and (p_category is null or r.category = p_category)
    and (p_state is null or r.state_code = p_state)
    and (p_county is null or r.county_name = p_county)
    and (p_tags is null or p_tags = '{}'::text[] or r.tags && p_tags)
  order by rank desc nulls last, r.title asc
  limit 100;
$function$;

-- Update the resources tsvector trigger function to use extensions schema
CREATE OR REPLACE FUNCTION public.resources_tsvector_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
begin
  new.search_tsv :=
    setweight(to_tsvector('english', coalesce(extensions.unaccent(new.title),'')), 'A') ||
    setweight(to_tsvector('english', coalesce(extensions.unaccent(new.description),'')), 'B') ||
    setweight(to_tsvector('english', coalesce(extensions.unaccent(new.eligibility_summary),'')), 'C') ||
    setweight(to_tsvector('english', coalesce(extensions.unaccent(new.application_steps),'')), 'C') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.documents_required,'{}'), ' ')), 'D') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.tags,'{}'), ' ')), 'D');
  return new;
end $function$;