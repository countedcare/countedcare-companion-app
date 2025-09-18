-- Add fields needed for transaction review workflow
ALTER TABLE public.synced_transactions 
ADD COLUMN IF NOT EXISTS review_status text DEFAULT 'pending' CHECK (review_status IN ('pending', 'kept', 'skipped')),
ADD COLUMN IF NOT EXISTS matched_expense_id uuid REFERENCES public.expenses(id);

-- Add index for better performance on review queries
CREATE INDEX IF NOT EXISTS idx_synced_transactions_user_review 
ON public.synced_transactions (user_id, review_status, date DESC);

-- Add index for medical candidate filtering
CREATE INDEX IF NOT EXISTS idx_synced_transactions_medical_candidates
ON public.synced_transactions (user_id, is_potential_medical, review_status) 
WHERE is_potential_medical = true;

-- Update existing transactions to have pending review status if null
UPDATE public.synced_transactions 
SET review_status = 'pending' 
WHERE review_status IS NULL;