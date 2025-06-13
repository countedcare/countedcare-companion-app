
export interface LinkedAccount {
  id: string;
  user_id: string;
  account_type: 'bank' | 'fsa' | 'hsa' | 'credit_card';
  account_name: string;
  institution_name?: string;
  plaid_access_token?: string;
  plaid_account_id?: string;
  stripe_account_id?: string;
  access_token?: string;
  refresh_token?: string;
  is_active: boolean;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SyncedTransaction {
  id: string;
  user_id: string;
  linked_account_id?: string;
  transaction_id: string;
  amount: number;
  date: string;
  description: string;
  merchant_name?: string;
  category?: string;
  is_potential_medical?: boolean;
  is_confirmed_medical?: boolean;
  is_tax_deductible?: boolean;
  is_reimbursed?: boolean;
  reimbursement_source?: string;
  expense_id?: string;
  created_at: string;
  updated_at: string;
}

export const ACCOUNT_TYPES = [
  { value: 'bank', label: 'Bank Account' },
  { value: 'fsa', label: 'FSA Account' },
  { value: 'hsa', label: 'HSA Account' },
  { value: 'credit_card', label: 'Credit Card' }
] as const;

export const REIMBURSEMENT_SOURCES = [
  { value: 'fsa', label: 'FSA' },
  { value: 'hsa', label: 'HSA' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'employer', label: 'Employer' },
  { value: 'other', label: 'Other' }
] as const;

export const EXPENSE_TAGS = [
  'transportation',
  'prescriptions',
  'medical_equipment',
  'home_modifications',
  'nursing_care',
  'therapy',
  'dental',
  'vision',
  'mental_health',
  'emergency',
  'other_medical'
] as const;
