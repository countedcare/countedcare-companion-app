-- Update the RLS policy for linked_accounts to improve performance
-- by using subquery approach to evaluate auth.uid() once per query instead of once per row

ALTER POLICY "Users can create their own linked accounts" 
ON public.linked_accounts 
FOR INSERT 
USING ( (select auth.uid()) = user_id ) 
WITH CHECK ( (select auth.uid()) = user_id );