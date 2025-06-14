
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
  "Medical Care",
  "In-Home Care",
  "Transportation",
  "Assistive Devices",
  "Home Modifications",
  "Other",
];

export interface Expense {
  id: string;
  amount: number;
  date: string;
  category: string;
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
