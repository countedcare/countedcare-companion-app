-- Add triage status to expenses table
ALTER TABLE public.expenses 
ADD COLUMN triage_status TEXT DEFAULT 'pending';

-- Add index for better performance on triage status queries
CREATE INDEX idx_expenses_triage_status ON public.expenses(triage_status);

-- Update existing expenses to have pending status
UPDATE public.expenses 
SET triage_status = 'pending' 
WHERE triage_status IS NULL;