-- Add vendor column to expenses table
ALTER TABLE public.expenses
ADD COLUMN IF NOT EXISTS vendor TEXT;