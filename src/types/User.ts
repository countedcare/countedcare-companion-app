export interface User {
  id?: string;
  name: string;
  email: string;
  isCaregiver: boolean;
  caregivingFor?: string[];
  householdAGI?: number;
  onboardingComplete?: boolean;
  zipCode?: string;
  // New comprehensive profile fields
  state?: string;
  county?: string;
  caregiverRole?: string[];
  numberOfDependents?: number;
  employmentStatus?: string;
  taxFilingStatus?: string;
  healthCoverageType?: string[];
  primaryCaregivingExpenses?: string[];
  preferredNotificationMethod?: string[];
}

export interface CareRecipient {
  id: string;
  name: string;
  relationship: string;
  conditions?: string[];
  insuranceInfo?: string;
}

export const RELATIONSHIP_TYPES = [
  "Parent",
  "Spouse",
  "Child",
  "Sibling",
  "Grandparent",
  "Other Relative",
  "Friend",
  "Other",
];

export const CAREGIVER_ROLES = [
  "Primary caregiver for parent(s)",
  "Primary caregiver for child with special needs",
  "Primary caregiver for spouse/partner",
  "Primary caregiver for grandparent(s)",
  "Secondary/backup caregiver",
  "Managing care from a distance",
  "Caring for multiple people",
  "Other"
];

export const EMPLOYMENT_STATUS_OPTIONS = [
  "Full-time employed",
  "Part-time employed", 
  "Self-employed",
  "Unemployed",
  "Retired",
  "Student",
  "Stay-at-home caregiver",
  "Other"
];

export const TAX_FILING_STATUS_OPTIONS = [
  "Single",
  "Married Filing Jointly",
  "Married Filing Separately", 
  "Head of Household",
  "Qualifying Widow(er)"
];

export const HEALTH_COVERAGE_OPTIONS = [
  "Private/Employer Insurance",
  "Medicare",
  "Medicaid",
  "Marketplace/ACA Plan",
  "TRICARE",
  "Uninsured",
  "Other"
];

export const PRIMARY_CAREGIVING_EXPENSES = [
  "Transportation (gas, parking, rides)",
  "Medical expenses not covered by insurance",
  "Prescription medications",
  "Home modifications/accessibility",
  "Professional home care services",
  "Adult day care",
  "Respite care",
  "Food and nutrition",
  "Clothing and personal items",
  "Technology/monitoring devices",
  "Legal services",
  "Other"
];

export const NOTIFICATION_PREFERENCES = [
  "Push notifications",
  "Email",
  "SMS/Text",
  "None"
];

export const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", 
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", 
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", 
  "Wisconsin", "Wyoming"
];

export const EXPENSE_CATEGORIES = [
  "🧑‍⚕️ Medical Services & Treatment",
  "🦷 Dental & Vision Care", 
  "💊 Prescriptions & Equipment",
  "🧍‍♀️ Supportive Services & Nursing Care",
  "🚘 Transportation & Travel for Medical Care",
  "🏠 Home & Living Modifications",
  "🏥 Hospital & Long-Term Care",
  "📄 Health Insurance Premiums",
  "🧳 Special Situations"
];

export const EXPENSE_SUBCATEGORIES: Record<string, string[]> = {
  '🏥 Medical & Healthcare Services': [
    'Doctor visits and consultations',
    'Specialist appointments',
    'Hospital stays and emergency care',
    'Physical therapy and rehabilitation',
    'Mental health counseling',
    'Alternative medicine treatments'
  ],
  '💊 Medications & Medical Supplies': [
    'Prescription medications',
    'Over-the-counter medications',
    'Medical equipment and devices',
    'Mobility aids (wheelchair, walker, etc.)',
    'Wound care supplies',
    'Diabetic supplies and monitoring equipment'
  ],
  '🚘 Transportation & Travel for Medical Care': [
    'Mileage for car travel (21 cents/mile in 2024)',
    'Public transportation fares',
    'Taxi or rideshare services',
    'Parking fees at medical facilities',
    'Lodging for out-of-town medical care',
    'Meals during medical travel'
  ],
  '🏠 Home Modifications & Safety Equipment': [
    'Wheelchair ramps and accessibility modifications',
    'Bathroom safety equipment (grab bars, shower seats)',
    'Stairlifts and mobility equipment',
    'Medical alert systems',
    'Home safety modifications',
    'Adaptive furniture and equipment'
  ],
  '👨‍⚕️ Professional Care Services': [
    'Home health aide services',
    'Nursing care',
    'Respite care services',
    'Adult day care programs',
    'Companion care services',
    'Specialized therapy services'
  ],
  '🍽️ Nutrition & Special Diet Requirements': [
    'Special dietary foods and supplements',
    'Meal delivery services',
    'Nutrition counseling',
    'Feeding equipment and supplies',
    'Weight management programs',
    'Dietary consultation fees'
  ],
  '📋 Administrative & Legal Services': [
    'Legal consultation and document preparation',
    'Care coordination services',
    'Medical record management',
    'Insurance claim assistance',
    'Financial planning for care',
    'Estate planning related to care needs'
  ],
  '🛡️ Insurance & Benefits Management': [
    'Long-term care insurance premiums',
    'Medicare supplement insurance',
    'Health insurance premiums',
    'Disability insurance premiums',
    'Insurance deductibles and co-payments',
    'Benefits coordination services'
  ]
};

export interface Expense {
  id: string;
  amount: number;
  date: string;
  category: string;
  subcategory?: string;
  description?: string;
  vendor?: string;
  careRecipientId?: string;
  careRecipientName?: string;
  receiptUrl?: string;
  expense_tags?: string[];
  is_tax_deductible?: boolean;
  is_reimbursed?: boolean;
  is_potentially_deductible?: boolean | null;
  reimbursement_source?: string;
  synced_transaction_id?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  care_recipient_id?: string;
  receipt_url?: string;
  notes?: string;
}

export interface Resource {
  id: string;
  title: string;
  category: string;
  description: string;
  link?: string;
  isFavorite?: boolean;
  type?: "Discount" | "Government Program" | "Local Support" | "Tax Prep" | "Product"; 
  partnerName?: string;
  tags?: string[];
  zipRegions?: string[]; // ZIP code regions (can be prefixes like "90", "941", or "all")
}

export const RESOURCE_TAGS = [
  "Transportation",
  "Home Aid",
  "Food",
  "Medical",
  "Tax Relief",
  "Respite Care",
  "Financial Assistance"
];

export const RESOURCE_TYPES = [
  "Discount", 
  "Government Program", 
  "Local Support", 
  "Tax Prep", 
  "Product"
];
