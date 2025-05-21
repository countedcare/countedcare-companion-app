
export interface User {
  id?: string;
  name: string;
  email: string;
  isCaregiver: boolean;
  caregivingFor?: string[];
  householdAGI?: number;
  onboardingComplete?: boolean;
  zipCode?: string;
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
