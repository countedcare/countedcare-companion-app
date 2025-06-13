
import { logStep } from './logger.ts';
import { fetchStripeTransactions } from './stripe-service.ts';
import { isLikelyMedicalExpense } from './medical-classifier.ts';
import type { SyncTransactionsBody } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export async function handleSyncTransactions(body: SyncTransactionsBody, userId: string, supabaseClient: any) {
  const { accountId } = body
  
  const stripeSecretKey = Deno.env.get('Stripe_Key')
  if (!stripeSecretKey) {
    throw new Error('Stripe secret key not configured')
  }

  // Get the linked account
  const { data: account, error: accountError } = await supabaseClient
    .from('linked_accounts')
    .select('*')
    .eq('id', accountId)
    .eq('user_id', userId)
    .single()

  if (accountError || !account) {
    throw new Error('Account not found')
  }

  // Fetch transactions from Stripe
  const transactions = await fetchStripeTransactions(stripeSecretKey, account.stripe_account_id);
  const syncedTransactions = []

  for (const transaction of transactions) {
    // Check if transaction already exists
    const { data: existingTransaction } = await supabaseClient
      .from('synced_transactions')
      .select('id')
      .eq('transaction_id', transaction.id)
      .eq('user_id', userId)
      .single()

    if (existingTransaction) {
      continue // Skip if already synced
    }

    // Determine if this might be a medical expense
    const isPotentialMedical = isLikelyMedicalExpense(transaction.description, transaction.merchant_name)
    
    // Insert the transaction
    const { data: syncedTransaction, error } = await supabaseClient
      .from('synced_transactions')
      .insert({
        user_id: userId,
        linked_account_id: accountId,
        transaction_id: transaction.id,
        amount: Math.abs(transaction.amount / 100), // Convert from cents and make positive
        date: transaction.created,
        description: transaction.description || 'Transaction',
        merchant_name: transaction.merchant_name,
        category: transaction.category,
        is_potential_medical: isPotentialMedical,
        is_tax_deductible: isPotentialMedical, // Default to true if likely medical
      })
      .select()
      .single()

    if (!error && syncedTransaction) {
      syncedTransactions.push(syncedTransaction)
    }
  }

  // Update last sync time
  await supabaseClient
    .from('linked_accounts')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('id', accountId)

  return new Response(JSON.stringify({ 
    success: true, 
    synced_count: syncedTransactions.length,
    transactions: syncedTransactions 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
