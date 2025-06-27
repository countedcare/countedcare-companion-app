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

export const EXPENSE_SUBCATEGORIES = {
  "🧑‍⚕️ Medical Services & Treatment": [
    "Doctor visits (including specialists)",
    "Surgeon and anesthesiologist fees", 
    "Mental health professionals (psychiatrists, psychologists, counselors)",
    "Chiropractor treatments",
    "Acupuncture",
    "Christian Science practitioner fees",
    "In-patient treatment for alcoholism or drug addiction (including meals/lodging)",
    "Fertility treatments (e.g., IVF, egg/sperm storage)",
    "Therapy (physical, occupational, or speech)"
  ],
  "🦷 Dental & Vision Care": [
    "Routine and preventive dental visits",
    "Dental procedures (fillings, root canals, braces, dentures)",
    "Eye exams",
    "Eyeglasses and contact lenses (including saline/cleaning supplies)",
    "Vision correction surgery (LASIK, etc.)"
  ],
  "💊 Prescriptions & Equipment": [
    "Prescription medications and insulin",
    "Breast pumps and lactation supplies",
    "Diagnostic devices (blood pressure monitors, blood sugar test kits)",
    "Durable medical equipment (wheelchairs, crutches, oxygen equipment)",
    "Prosthetics (artificial limbs, teeth, etc.)",
    "Hearing aids and batteries",
    "Pregnancy test kits"
  ],
  "🧍‍♀️ Supportive Services & Nursing Care": [
    "In-home nursing care (including for bathing, medication, wound care)",
    "Attendant care if part of medical treatment",
    "Adult day care for Alzheimer's or dementia",
    "Special schooling for children with learning disabilities (if recommended by a doctor)",
    "Service animals (purchase, training, food, and vet care)"
  ],
  "🚘 Transportation & Travel for Medical Care": [
    "Mileage for car travel (21 cents/mile in 2024)",
    "Public transit, taxis, rideshares, plane fare to treatment",
    "Parking and tolls",
    "Lodging up to $50/night per person (e.g., for hospital visits, cancer treatment out-of-town)"
  ],
  "🏠 Home & Living Modifications": [
    "Wheelchair ramps",
    "Widened doorways", 
    "Grab bars and handrails",
    "Bathroom modifications",
    "Lowered cabinets for accessibility",
    "Medically necessary air filters or humidifiers",
    "Special plumbing for medical reasons in rented homes"
  ],
  "🏥 Hospital & Long-Term Care": [
    "Hospital stays (room, meals, and medical care)",
    "Skilled nursing facilities (if primary reason is medical care)",
    "Hospice care",
    "Qualified long-term care services",
    "Premiums for long-term care insurance (limits apply by age)"
  ],
  "📄 Health Insurance Premiums": [
    "Medical, dental, and vision plan premiums (not employer-paid)",
    "Medicare Part B and D premiums",
    "COBRA premiums", 
    "Prepaid future medical insurance (only in some cases)",
    "Qualified long-term care insurance premiums (limits apply)"
  ],
  "🧳 Special Situations": [
    "Medical conferences related to a dependent's chronic condition (transportation/admission only)",
    "Guide dogs or service animals (purchase, training, and maintenance)",
    "Legal fees to authorize mental health treatment",
    "Lifetime care advance payments (for care of disabled dependents)"
  ]
};

export interface Expense {
  id: string;
  amount: number;
  date: string;
  category: string;
  subcategory?: string;
  description: string;
  careRecipientId: string;
  careRecipientName?: string;
  receiptUrl?: string;
  expense_tags?: string[];
  is_tax_deductible?: boolean;
  is_reimbursed?: boolean;
  reimbursement_source?: string;
  synced_transaction_id?: string;
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
