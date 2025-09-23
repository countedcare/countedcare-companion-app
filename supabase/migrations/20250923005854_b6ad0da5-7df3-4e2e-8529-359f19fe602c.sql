-- Update resources table structure for public caregiver resources
ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS resources_user_id_fkey;
ALTER TABLE public.resources DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.resources DROP COLUMN IF EXISTS is_favorited;

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

-- Update description column to be NOT NULL
ALTER TABLE public.resources ALTER COLUMN description SET NOT NULL;
ALTER TABLE public.resources ALTER COLUMN description SET DEFAULT '';

-- Add category constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'resources_category_check' 
        AND conrelid = 'public.resources'::regclass
    ) THEN
        ALTER TABLE public.resources ADD CONSTRAINT resources_category_check 
        CHECK (category IN ('Federal', 'California', 'Los Angeles County', 'Nonprofit'));
    END IF;
END $$;

-- Update RLS policy for public resources
DROP POLICY IF EXISTS "Users can create their own resources" ON public.resources;
DROP POLICY IF EXISTS "Users can delete their own resources" ON public.resources;  
DROP POLICY IF EXISTS "Users can update their own resources" ON public.resources;
DROP POLICY IF EXISTS "Users can view their own resources" ON public.resources;

-- Create new policy for public access to resources
CREATE POLICY "Resources are viewable by everyone" 
ON public.resources 
FOR SELECT 
USING (is_active = true);

-- Create user saved resources table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_saved_resources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

-- Enable RLS on user_saved_resources
ALTER TABLE public.user_saved_resources ENABLE ROW LEVEL SECURITY;

-- User saved resources policies
DROP POLICY IF EXISTS "Users can view their own saved resources" ON public.user_saved_resources;
DROP POLICY IF EXISTS "Users can save resources" ON public.user_saved_resources;
DROP POLICY IF EXISTS "Users can unsave resources" ON public.user_saved_resources;

CREATE POLICY "Users can view their own saved resources" 
ON public.user_saved_resources 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save resources" 
ON public.user_saved_resources 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave resources" 
ON public.user_saved_resources 
FOR DELETE 
USING (auth.uid() = user_id);