-- Add university support to resources table
ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS university_ids text[] DEFAULT '{}';

-- Create universities lookup table
CREATE TABLE IF NOT EXISTS public.universities (
  id text PRIMARY KEY,
  name text NOT NULL,
  state_code text,
  county text,
  created_at timestamptz DEFAULT now()
);

-- Add performance indexes for filtering
CREATE INDEX IF NOT EXISTS resources_state_code_idx ON public.resources (state_code);
CREATE INDEX IF NOT EXISTS resources_county_idx ON public.resources (county_name);
CREATE INDEX IF NOT EXISTS resources_univ_ids_idx ON public.resources USING gin (university_ids);
CREATE INDEX IF NOT EXISTS resources_tags_idx ON public.resources USING gin (tags);
CREATE INDEX IF NOT EXISTS resources_category_idx ON public.resources (category);

-- Enable RLS on universities table
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;

-- Public read access for universities
CREATE POLICY "universities are readable by everyone"
ON public.universities FOR SELECT
USING (true);

-- Insert sample California universities
INSERT INTO public.universities (id, name, state_code, county) VALUES
  ('ucla', 'UCLA', 'CA', 'Los Angeles'),
  ('ucsd', 'UC San Diego', 'CA', 'San Diego'),
  ('ucsf', 'UCSF', 'CA', 'San Francisco'),
  ('uci', 'UC Irvine', 'CA', 'Orange'),
  ('ucb', 'UC Berkeley', 'CA', 'Alameda'),
  ('usc', 'USC', 'CA', 'Los Angeles'),
  ('stanford', 'Stanford', 'CA', 'Santa Clara'),
  ('caltech', 'Caltech', 'CA', 'Los Angeles')
ON CONFLICT (id) DO NOTHING;