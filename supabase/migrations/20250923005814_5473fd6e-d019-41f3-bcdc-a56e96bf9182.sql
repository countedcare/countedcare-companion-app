-- Create resources table
CREATE TABLE public.resources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  category text NOT NULL CHECK (category IN ('Federal', 'California', 'Los Angeles County', 'Nonprofit')),
  tags text[] DEFAULT '{}',
  estimated_benefit text,
  eligibility_requirements text[],
  application_process text,
  contact_info jsonb,
  external_links jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user saved resources table
CREATE TABLE public.user_saved_resources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_resources ENABLE ROW LEVEL SECURITY;

-- Resources policies (public read access)
CREATE POLICY "Resources are viewable by everyone" 
ON public.resources 
FOR SELECT 
USING (is_active = true);

-- User saved resources policies
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

-- Add updated_at trigger for resources
CREATE TRIGGER update_resources_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample resources data
INSERT INTO public.resources (title, description, content, category, tags, estimated_benefit, eligibility_requirements, application_process, contact_info, external_links) VALUES
(
  'California Paid Family Leave (PFL)',
  'Get paid time off to care for a seriously ill family member or bond with a new child.',
  'California Paid Family Leave provides partial wage replacement benefits to eligible workers who need time off work to care for a seriously ill family member or bond with a new child. Benefits are funded through employee payroll deductions.',
  'California',
  '{"caregiver support", "elderly", "disability"}',
  'Up to $1,540/week',
  '{"Must be employed in California", "Must have paid into the State Disability Insurance program", "Family member must have serious health condition"}',
  'Apply online through the EDD website or by mail. You will need medical certification from a healthcare provider.',
  '{"phone": "1-877-238-4373", "website": "edd.ca.gov"}',
  '{"application": "https://edd.ca.gov/en/disability/paid-family-leave/", "info": "https://edd.ca.gov/en/disability/paid-family-leave/pfl-benefits-and-eligibility/"}'
),
(
  'In-Home Supportive Services (IHSS)',
  'California program providing assistance with daily living activities for elderly and disabled individuals.',
  'IHSS helps pay for services that allow eligible individuals to remain safely in their own homes. Services include housekeeping, meal preparation, laundry, grocery shopping, personal care services, accompaniment to medical appointments, and protective supervision.',
  'California', 
  '{"home care", "elderly", "disability", "caregiver support"}',
  'Up to $17.75/hour',
  '{"Must be 65+ or disabled", "Must meet income requirements", "Must need assistance with daily activities", "Must live in own home"}',
  'Contact your local IHSS office or apply through the California Department of Social Services.',
  '{"phone": "1-866-613-3777", "website": "cdss.ca.gov"}',
  '{"application": "https://www.cdss.ca.gov/inforesources/ihss", "eligibility": "https://www.cdss.ca.gov/inforesources/ihss/eligibility"}'
),
(
  'Family Caregiver Support Program',
  'Federal program providing support services to family caregivers of older adults.',
  'This federal program funded through the Older Americans Act provides information, assistance, counseling, respite care, and supplemental services to family caregivers. Services are available through local Area Agencies on Aging.',
  'Federal',
  '{"caregiver support", "elderly", "respite"}',
  'Varies by location',
  '{"Must be caring for adult 60+ years old", "Or caring for adult 18+ with Alzheimer''s or related disorder", "Some programs have income guidelines"}',
  'Contact your local Area Agency on Aging to access services.',
  '{"phone": "1-800-677-1116", "website": "acl.gov"}',
  '{"locator": "https://eldercare.acl.gov/Public/Index.aspx", "info": "https://acl.gov/programs/support-caregivers/national-family-caregiver-support-program"}'
),
(
  'Los Angeles County CareMore',
  'Comprehensive care management services for LA County residents caring for elderly family members.',
  'CareMore provides care coordination, respite services, caregiver training, and financial assistance for eligible Los Angeles County residents. The program connects families with local resources and provides direct support services.',
  'Los Angeles County',
  '{"caregiver support", "elderly", "respite", "transportation"}',
  'Up to $2,000/year',
  '{"Must be LA County resident", "Must be caring for adult 60+ or disabled family member", "Income requirements may apply"}',
  'Apply through the LA County Department of Health Services or call the CareMore hotline.',
  '{"phone": "(213) 240-8117", "email": "caremore@dhs.lacounty.gov"}',
  '{"application": "http://dhs.lacounty.gov/wps/portal/dhs/caremore", "resources": "http://dhs.lacounty.gov/caregiver-resources"}'
),
(
  'National Respite Network',
  'Nonprofit organization helping families find and pay for respite care services.',
  'The National Respite Network and Resource Center helps family caregivers locate respite services in their community. They provide grants, training, and resources to make respite care more accessible and affordable.',
  'Nonprofit',
  '{"respite", "caregiver support", "elderly", "disability"}',
  'Varies by program',
  '{"Must be primary caregiver", "Care recipient must have chronic condition or disability", "Some programs have geographic restrictions"}',
  'Use their online respite locator or call their helpline for assistance finding local programs.',
  '{"phone": "1-800-773-5433", "website": "archrespite.org"}',
  '{"locator": "https://archrespite.org/respitelocator", "grants": "https://archrespite.org/consumer-information/help-paying-for-respite"}'
);