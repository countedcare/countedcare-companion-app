-- Insert California and Los Angeles County caregiver resources

INSERT INTO public.resources (
  title,
  description,
  category,
  state_code,
  county_name,
  source_url,
  apply_url,
  tags,
  is_active
) VALUES
(
  'California State Disability Insurance',
  'State disability insurance program providing short-term wage replacement benefits to eligible California workers who are unable to work due to a non-work-related illness, injury, or pregnancy.',
  'state',
  'CA',
  NULL,
  'https://edd.ca.gov/en/disability',
  'https://edd.ca.gov/en/disability',
  ARRAY['disability', 'income support', 'state benefits'],
  true
),
(
  'California Caregiver Resource Center',
  'Comprehensive resource center providing information, support, and services for family caregivers throughout California.',
  'nonprofit',
  'CA',
  NULL,
  'https://www.caregivercalifornia.org/',
  'https://www.caregivercalifornia.org/',
  ARRAY['caregiver support', 'respite care', 'education'],
  true
),
(
  'California Department of Aging - Family Caregiver Services',
  'State-funded programs and services designed to support family caregivers, including respite care, counseling, and training.',
  'state',
  'CA',
  NULL,
  'https://aging.ca.gov/Programs_and_Services/Family_Caregiver_Services/',
  'https://aging.ca.gov/Programs_and_Services/Family_Caregiver_Services/',
  ARRAY['caregiver support', 'respite care', 'senior services'],
  true
),
(
  'California Department of Social Services - Adult Services',
  'Programs and services for adults including In-Home Supportive Services (IHSS), Adult Protective Services, and other support programs.',
  'state',
  'CA',
  NULL,
  'https://www.cdss.ca.gov/Benefits-Services/Adult-Services',
  'https://www.cdss.ca.gov/Benefits-Services/Adult-Services',
  ARRAY['adult services', 'IHSS', 'protective services'],
  true
),
(
  'California Department of Social Services - Child Services',
  'Child welfare services including foster care, adoption services, and family support programs for families caring for children.',
  'state',
  'CA',
  NULL,
  'https://www.cdss.ca.gov/benefits-services/child-services',
  'https://www.cdss.ca.gov/benefits-services/child-services',
  ARRAY['child services', 'foster care', 'adoption'],
  true
),
(
  'CalFresh Food Assistance Program',
  'California''s food stamp program (SNAP) providing nutrition assistance benefits to eligible low-income individuals and families.',
  'state',
  'CA',
  NULL,
  'https://www.cdss.ca.gov/benefits-services/food-nutrition',
  'https://www.cdss.ca.gov/benefits-services/food-nutrition',
  ARRAY['food assistance', 'SNAP', 'nutrition'],
  true
),
(
  'Los Angeles County Resources for Family Caregivers',
  'USC-affiliated Caregiver Resource Center serving Los Angeles County with resources, support groups, and assistance for family caregivers.',
  'county',
  'CA',
  'Los Angeles',
  'https://losangelescrc.usc.edu/',
  'https://losangelescrc.usc.edu/',
  ARRAY['caregiver support', 'support groups', 'local resources'],
  true
),
(
  'LA County Department of Children and Family Services - Caregiver Resources',
  'Resources and support for caregivers including kinship care, foster care, and relative caregiver programs in Los Angeles County.',
  'county',
  'CA',
  'Los Angeles',
  'https://dcfs.lacounty.gov/caregivers/',
  'https://dcfs.lacounty.gov/caregivers/',
  ARRAY['kinship care', 'foster care', 'child welfare'],
  true
);