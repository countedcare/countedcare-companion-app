export interface User {
  id: string;
  name: string;
  email: string;
  isCaregiver: boolean;
  caregivingFor?: string[];
  householdAGI?: number;
}

export interface CareRecipient {
  id: string;
  name: string;
  relationship: string;
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

// Add Expense type if it doesn't exist
export interface Expense {
  id: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  careRecipientId: string;
  careRecipientName?: string;
}
