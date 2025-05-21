
export interface User {
  id?: string;
  name: string;
  email: string;
  isCaregiver: boolean;
  caregivingFor?: string[];
  yearlyExpenses?: number;
  onboardingComplete: boolean;
  zipCode?: string;
  householdAGI?: number;
}

export interface CareRecipient {
  id: string;
  name: string;
  relationship: string;
  conditions?: string[];
  insuranceInfo?: string;
}

export interface Expense {
  id: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
  receiptUrl?: string;
  careRecipientId: string;
  careRecipientName?: string;
}

export interface Resource {
  id: string;
  title: string;
  category: string; // article, product, support
  description: string;
  link?: string;
  isFavorite?: boolean;
  type?: "Discount" | "Government Program" | "Local Support" | "Tax Prep" | "Product"; 
  partnerName?: string;
  tags?: string[];
}

export type RelationshipType = 
  | "Parent" 
  | "Child" 
  | "Spouse" 
  | "Grandparent" 
  | "Sibling" 
  | "Friend" 
  | "Other";

export const RELATIONSHIP_TYPES: RelationshipType[] = [
  "Parent",
  "Child",
  "Spouse",
  "Grandparent",
  "Sibling",
  "Friend",
  "Other"
];

export const EXPENSE_CATEGORIES = [
  "Medical",
  "Transportation",
  "Home Care",
  "Supplies",
  "Insurance Premium",
  "Other"
];

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
