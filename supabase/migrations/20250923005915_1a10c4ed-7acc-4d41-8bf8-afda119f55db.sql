-- First drop all existing policies and constraints
DROP POLICY IF EXISTS "Users can create their own resources" ON public.resources;
DROP POLICY IF EXISTS "Users can delete their own resources" ON public.resources;  
DROP POLICY IF EXISTS "Users can update their own resources" ON public.resources;
DROP POLICY IF EXISTS "Users can view their own resources" ON public.resources;

-- Drop the foreign key constraint and columns
ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS resources_user_id_fkey CASCADE;
ALTER TABLE public.resources DROP COLUMN IF EXISTS user_id CASCADE;
ALTER TABLE public.resources DROP COLUMN IF EXISTS is_favorited CASCADE;

-- Add new columns for public resources
ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS content text DEFAULT '',
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS estimated_benefit text,
ADD COLUMN IF NOT EXISTS eligibility_requirements text[],
ADD COLUMN IF NOT EXISTS application_process text,
ADD COLUMN IF NOT EXISTS contact_info jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS external_links jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Update description to be NOT NULL with default
UPDATE public.resources SET description = '' WHERE description IS NULL;
ALTER TABLE public.resources ALTER COLUMN description SET NOT NULL;
ALTER TABLE public.resources ALTER COLUMN description SET DEFAULT '';

-- Add category constraint
DO $$
BEGIN
    -- First drop existing constraint if it exists
    ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS resources_category_check;
    
    -- Add the new constraint
    ALTER TABLE public.resources ADD CONSTRAINT resources_category_check 
    CHECK (category IN ('Federal', 'California', 'Los Angeles County', 'Nonprofit'));
EXCEPTION WHEN OTHERS THEN
    -- If there's any error, just continue
    NULL;
END $$;

-- Create new policy for public access to resources
CREATE POLICY "Resources are viewable by everyone" 
ON public.resources 
FOR SELECT 
USING (is_active = true);