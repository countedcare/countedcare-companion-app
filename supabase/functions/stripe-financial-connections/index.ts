
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the request
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { action, ...body } = await req.json()

    switch (action) {
      case 'create_session':
        return await createFinancialConnectionsSession(body)
      case 'link_account':
        return await linkBankAccount(body, user.id, supabaseClient)
      case 'sync_transactions':
        return await syncTransactions(body, user.id, supabaseClient)
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
  } catch (error) {
    console.error('Stripe Financial Connections error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function createFinancialConnectionsSession(body: any) {
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
  if (!stripeSecretKey) {
    throw new Error('Stripe secret key not configured')
  }

  const response = await fetch('https://api.stripe.com/v1/financial_connections/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      account_holder: JSON.stringify({
        type: 'consumer',
      }),
      permissions: 'balances,transactions',
      filters: JSON.stringify({
        countries: ['US'],
      }),
    }),
  })

  const session = await response.json()
  
  if (!response.ok) {
    throw new Error(`Stripe API error: ${session.error?.message || 'Unknown error'}`)
  }

  return new Response(JSON.stringify(session), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function linkBankAccount(body: any, userId: string, supabaseClient: any) {
  const { sessionId, accountName } = body
  
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
  if (!stripeSecretKey) {
    throw new Error('Stripe secret key not configured')
  }

  // Retrieve the session to get the connected accounts
  const sessionResponse = await fetch(`https://api.stripe.com/v1/financial_connections/sessions/${sessionId}`, {
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
    },
  })

  const session = await sessionResponse.json()
  
  if (!sessionResponse.ok) {
    throw new Error(`Failed to retrieve session: ${session.error?.message}`)
  }

  // Get the first connected account (in a real app, you might handle multiple accounts)
  const connectedAccount = session.accounts?.data?.[0]
  if (!connectedAccount) {
    throw new Error('No accounts connected')
  }

  // Store the linked account in our database
  const { data, error } = await supabaseClient
    .from('linked_accounts')
    .insert({
      user_id: userId,
      account_name: accountName || connectedAccount.display_name || 'Connected Account',
      account_type: 'bank',
      institution_name: connectedAccount.institution_name,
      stripe_account_id: connectedAccount.id,
      is_active: true,
      last_sync_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save account: ${error.message}`)
  }

  return new Response(JSON.stringify({ success: true, account: data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function syncTransactions(body: any, userId: string, supabaseClient: any) {
  const { accountId } = body
  
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
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
  const transactionsResponse = await fetch(`https://api.stripe.com/v1/financial_connections/transactions?account=${account.stripe_account_id}&limit=100`, {
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
    },
  })

  const transactionsData = await transactionsResponse.json()
  
  if (!transactionsResponse.ok) {
    throw new Error(`Failed to fetch transactions: ${transactionsData.error?.message}`)
  }

  const transactions = transactionsData.data || []
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

function isLikelyMedicalExpense(description: string, merchantName?: string): boolean {
  const text = `${description} ${merchantName || ''}`.toLowerCase()
  
  const medicalKeywords = [
    'pharmacy', 'cvs', 'walgreens', 'rite aid', 'medical', 'doctor', 'hospital',
    'clinic', 'dentist', 'dental', 'urgent care', 'health', 'prescription',
    'medicare', 'medicaid', 'insurance', 'copay', 'deductible', 'therapy',
    'physical therapy', 'mental health', 'counseling', 'nursing', 'care',
    'assisted living', 'home care', 'caregiver'
  ]
  
  return medicalKeywords.some(keyword => text.includes(keyword))
}
