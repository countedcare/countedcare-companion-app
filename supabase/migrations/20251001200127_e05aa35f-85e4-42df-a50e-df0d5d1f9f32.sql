-- Insert California state resources
INSERT INTO public.resources (title, description, category, state_code, source_url, is_active)
VALUES 
  ('California State Disability Insurance', 'State disability insurance program providing short-term wage replacement benefits to eligible California workers', 'state', 'CA', 'https://edd.ca.gov/en/disability', true),
  ('California Caregiver Resource Center', 'Statewide system of resource centers providing support, education, and services to family caregivers', 'state', 'CA', 'https://www.caregivercalifornia.org/', true),
  ('California Department of Aging - Family Caregiver Services', 'Family caregiver programs and resources from the California Department of Aging', 'state', 'CA', 'https://aging.ca.gov/Programs_and_Services/Family_Caregiver_Services/', true),
  ('California Adult Services', 'Adult protective services, in-home supportive services, and programs for older adults and people with disabilities', 'state', 'CA', 'https://www.cdss.ca.gov/Benefits-Services/Adult-Services', true),
  ('California Child Services', 'Child welfare services including foster care, adoption assistance, and child protective services', 'state', 'CA', 'https://www.cdss.ca.gov/benefits-services/child-services', true),
  ('CalFresh Food Assistance', 'California food assistance program (SNAP) providing nutrition benefits to eligible low-income individuals and families', 'state', 'CA', 'https://www.cdss.ca.gov/benefits-services/food-nutrition', true);

-- Insert Los Angeles County resources
INSERT INTO public.resources (title, description, category, state_code, county_name, source_url, is_active)
VALUES 
  ('LA County Family Caregiver Resources', 'Comprehensive caregiver support services, education, and resources from USC Caregiver Resource Center', 'county', 'CA', 'Los Angeles', 'https://losangelescrc.usc.edu/', true),
  ('LA County Children and Family Services for Caregivers', 'Support and resources for kinship caregivers and foster families caring for children in LA County', 'county', 'CA', 'Los Angeles', 'https://dcfs.lacounty.gov/caregivers/', true),
  ('LA County Senior and Disabled Transportation', 'Dial-A-Ride and paratransit services for seniors and people with disabilities in LA County', 'county', 'CA', 'Los Angeles', 'https://pw.lacounty.gov/transit/DAR.aspx', true),
  ('LA County Older Adult Resources', 'County programs and services for older adults including health, housing, and social services', 'county', 'CA', 'Los Angeles', 'https://lacounty.gov/residents/older-adults/', true);

-- Insert UCLA resources
INSERT INTO public.resources (title, description, category, state_code, tags, source_url, is_active)
VALUES 
  ('UCLA Health Caregiver Education', 'Educational resources and support for dementia caregivers from UCLA Health', 'state', 'CA', ARRAY['UCLA', 'education', 'dementia'], 'https://www.uclahealth.org/medical-services/geriatrics/dementia/caregiver-education', true),
  ('UCLA Students with Dependents', 'Support services and resources for UCLA students who are parents or caregivers', 'state', 'CA', ARRAY['UCLA', 'students', 'parents'], 'https://swd.ucla.edu/', true);