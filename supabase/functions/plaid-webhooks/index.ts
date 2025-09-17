import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PlaidWebhook {
  webhook_type: string;
  webhook_code: string;
  item_id: string;
  error?: any;
  new_transactions?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Plaid webhook received');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const webhook: PlaidWebhook = await req.json()
    console.log('Webhook data:', webhook);

    // Handle different webhook types
    switch (webhook.webhook_type) {
      case 'TRANSACTIONS':
        return await handleTransactionWebhook(webhook, supabaseClient)
      case 'ITEM':
        return await handleItemWebhook(webhook, supabaseClient)
      default:
        console.log('Unhandled webhook type:', webhook.webhook_type);
        return new Response(JSON.stringify({ status: 'ignored' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function handleTransactionWebhook(webhook: PlaidWebhook, supabaseClient: any) {
  console.log('Processing transaction webhook:', webhook.webhook_code);
  
  if (webhook.webhook_code === 'SYNC_UPDATES_AVAILABLE' || 
      webhook.webhook_code === 'DEFAULT_UPDATE') {
    
    // Find all accounts for this item_id
    const { data: accounts, error: accountsError } = await supabaseClient
      .from('linked_accounts')
      .select('*')
      .eq('plaid_item_id', webhook.item_id)
      .eq('is_active', true);

    if (accountsError) {
      console.error('Error fetching accounts:', accountsError);
      throw new Error('Failed to fetch accounts for item');
    }

    // Sync transactions for each account
    for (const account of accounts || []) {
      await syncAccountTransactions(account, supabaseClient);
    }
  }

  return new Response(JSON.stringify({ status: 'processed' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function handleItemWebhook(webhook: PlaidWebhook, supabaseClient: any) {
  console.log('Processing item webhook:', webhook.webhook_code);
  
  if (webhook.webhook_code === 'ERROR' && webhook.error) {
    // Update account status to inactive if there's an error
    await supabaseClient
      .from('linked_accounts')
      .update({ 
        is_active: false,
        error_message: webhook.error.error_message 
      })
      .eq('plaid_item_id', webhook.item_id);
  }

  return new Response(JSON.stringify({ status: 'processed' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function syncAccountTransactions(account: any, supabaseClient: any) {
  console.log('Syncing transactions for account:', account.id);
  
  const plaidClientId = Deno.env.get('PLAID_CLIENT_ID')
  const plaidSecret = Deno.env.get('PLAID_SECRET')
  
  if (!plaidClientId || !plaidSecret || !account.plaid_access_token) {
    console.error('Missing Plaid credentials or access token');
    return;
  }

  // Get transactions from the last 7 days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const endDate = new Date();

  const transactionsResponse = await fetch('https://sandbox.plaid.com/transactions/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: plaidClientId,
      secret: plaidSecret,
      access_token: account.plaid_access_token,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      count: 100,
    }),
  });

  const transactionsData = await transactionsResponse.json();
  
  if (!transactionsResponse.ok) {
    console.error('Transactions fetch error:', transactionsData);
    return;
  }

  // Filter transactions for this specific account
  const accountTransactions = transactionsData.transactions.filter(
    (tx: any) => tx.account_id === account.plaid_account_id
  );

  for (const transaction of accountTransactions) {
    // Check if transaction already exists
    const { data: existingTx } = await supabaseClient
      .from('synced_transactions')
      .select('id')
      .eq('transaction_id', transaction.transaction_id)
      .maybeSingle();

    if (existingTx) continue; // Skip if already exists

    // Classify if transaction is medical
    const isMedical = await classifyMedicalTransaction(transaction);

    // Insert synced transaction
    const { data: syncedTx, error: syncError } = await supabaseClient
      .from('synced_transactions')
      .insert({
        user_id: account.user_id,
        linked_account_id: account.id,
        transaction_id: transaction.transaction_id,
        amount: Math.abs(transaction.amount),
        date: transaction.date,
        description: transaction.name,
        merchant_name: transaction.merchant_name,
        category: transaction.category?.[0],
        is_potential_medical: isMedical,
        is_confirmed_medical: isMedical
      })
      .select()
      .single();

    if (syncError) {
      console.error('Error inserting synced transaction:', syncError);
      continue;
    }

    // If it's medical, automatically create an expense
    if (isMedical) {
      await createExpenseFromTransaction(syncedTx, account.user_id, supabaseClient);
    }
  }

  // Update last sync time
  await supabaseClient
    .from('linked_accounts')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('id', account.id);
}

async function classifyMedicalTransaction(transaction: any): Promise<boolean> {
  // Enhanced medical classification logic
  const description = (transaction.name || '').toLowerCase();
  const merchantName = (transaction.merchant_name || '').toLowerCase();
  const category = transaction.category?.[0]?.toLowerCase() || '';

  // Medical keywords
  const medicalKeywords = [
    'pharmacy', 'cvs', 'walgreens', 'rite aid', 'hospital', 'medical',
    'doctor', 'dr ', 'clinic', 'dental', 'vision', 'optometry',
    'urgent care', 'emergency', 'lab corp', 'quest diagnostics',
    'radiology', 'mri', 'ct scan', 'x-ray', 'physical therapy',
    'chiropractor', 'dermatology', 'cardiology', 'orthopedic'
  ];

  // Check if any medical keywords are present
  const hasKeyword = medicalKeywords.some(keyword => 
    description.includes(keyword) || merchantName.includes(keyword)
  );

  // Check Plaid category
  const medicalCategories = ['healthcare', 'medical', 'pharmacy'];
  const hasCategory = medicalCategories.some(cat => category.includes(cat));

  return hasKeyword || hasCategory;
}

async function createExpenseFromTransaction(syncedTx: any, userId: string, supabaseClient: any) {
  console.log('Creating expense from transaction:', syncedTx.id);

  const { error: expenseError } = await supabaseClient
    .from('expenses')
    .insert({
      user_id: userId,
      synced_transaction_id: syncedTx.id,
      description: syncedTx.description,
      amount: syncedTx.amount,
      date: syncedTx.date,
      vendor: syncedTx.merchant_name,
      category: 'Medical Services', // Default medical category
      is_potentially_deductible: true,
      is_tax_deductible: false, // User can confirm later
      expense_tags: ['auto_imported']
    });

  if (expenseError) {
    console.error('Error creating expense:', expenseError);
  } else {
    console.log('Successfully created expense from transaction');
  }
}