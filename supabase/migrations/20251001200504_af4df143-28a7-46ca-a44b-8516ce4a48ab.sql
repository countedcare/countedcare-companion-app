-- Update UCLA resources to include the UCLA university ID
UPDATE public.resources
SET university_ids = ARRAY['ucla']
WHERE tags @> ARRAY['UCLA']
  AND university_ids = '{}';
