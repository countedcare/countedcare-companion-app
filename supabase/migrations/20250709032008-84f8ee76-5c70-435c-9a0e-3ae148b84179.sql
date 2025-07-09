-- Update the RLS policy for linked_accounts to improve performance
-- by using subquery approach to evaluate auth.uid() once per query instead of once per row

-- Drop the existing policy
DROP POLICY "Users can create their own linked accounts" ON public.linked_accounts;

-- Recreate the policy with improved performance using subquery
CREATE POLICY "Users can create their own linked accounts" 
ON public.linked_accounts 
FOR INSERT 
WITH CHECK ( (select auth.uid()) = user_id );