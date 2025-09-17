import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PlaidLinkTokenRequest {
  user_id: string;
}

interface PlaidExchangeTokenRequest {
  public_token: string;
  account_name?: string;
}

interface PlaidSyncTransactionsRequest {
  account_id: string;
  user_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Plaid function started');

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
      console.log('User not authenticated');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('User authenticated:', user.id);

    const { action, ...body } = await req.json()
    console.log('Action received:', action);

    switch (action) {
      case 'create_link_token':
        return await handleCreateLinkToken(body as PlaidLinkTokenRequest, user)
      case 'exchange_public_token':
        return await handleExchangePublicToken(body as PlaidExchangeTokenRequest, user.id, supabaseClient)
      case 'sync_transactions':
        return await handleSyncTransactions(body as PlaidSyncTransactionsRequest, user.id, supabaseClient)
      default:
        console.log('Invalid action:', action);
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
  } catch (error) {
    console.error('Plaid Financial Connections error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function handleCreateLinkToken(body: PlaidLinkTokenRequest, user: any) {
  console.log('Creating Plaid Link token');
  
  const plaidClientId = Deno.env.get('PLAID_CLIENT_ID')
  const plaidSecret = Deno.env.get('PLAID_SECRET')
  
  if (!plaidClientId || !plaidSecret) {
    throw new Error('Plaid credentials not configured')
  }

  const response = await fetch('https://sandbox.plaid.com/link/token/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: plaidClientId,
      secret: plaidSecret,
      client_name: "Medical Expense Tracker",
      country_codes: ['US'],
      language: 'en',
      user: {
        client_user_id: user.id
      },
      products: ['transactions'],
      account_filters: {
        depository: {
          account_subtypes: ['checking', 'savings']
        }
      }
    }),
  });

  const data = await response.json();
  console.log('Link token response:', response.status);
  
  if (!response.ok) {
    console.error('Plaid API error:', data);
    throw new Error(`Plaid API error: ${data.error?.error_message || 'Unknown error'}`)
  }

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function handleExchangePublicToken(body: PlaidExchangeTokenRequest, userId: string, supabaseClient: any) {
  console.log('Exchanging public token for access token');
  
  const plaidClientId = Deno.env.get('PLAID_CLIENT_ID')
  const plaidSecret = Deno.env.get('PLAID_SECRET')
  
  if (!plaidClientId || !plaidSecret) {
    throw new Error('Plaid credentials not configured')
  }

  // Exchange public token for access token
  const tokenResponse = await fetch('https://sandbox.plaid.com/item/public_token/exchange', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: plaidClientId,
      secret: plaidSecret,
      public_token: body.public_token,
    }),
  });

  const tokenData = await tokenResponse.json();
  
  if (!tokenResponse.ok) {
    console.error('Token exchange error:', tokenData);
    throw new Error(`Token exchange failed: ${tokenData.error?.error_message || 'Unknown error'}`)
  }

  // Get account information
  const accountsResponse = await fetch('https://sandbox.plaid.com/accounts/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: plaidClientId,
      secret: plaidSecret,
      access_token: tokenData.access_token,
    }),
  });

  const accountsData = await accountsResponse.json();
  
  if (!accountsResponse.ok) {
    console.error('Accounts fetch error:', accountsData);
    throw new Error(`Failed to fetch accounts: ${accountsData.error?.error_message || 'Unknown error'}`)
  }

  // Store each account in our database
  const accounts = [];
  for (const account of accountsData.accounts) {
    const { data, error } = await supabaseClient
      .from('linked_accounts')
      .insert({
        user_id: userId,
        account_name: body.account_name || account.name,
        account_type: account.subtype === 'checking' || account.subtype === 'savings' ? 'bank' : 'credit_card',
        institution_name: accountsData.item?.institution_id || 'Bank',
        plaid_access_token: tokenData.access_token,
        plaid_account_id: account.account_id,
        is_active: true,
        last_sync_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to save account: ${error.message}`)
    }

    accounts.push(data);
  }

  return new Response(JSON.stringify({ success: true, accounts }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function handleSyncTransactions(body: PlaidSyncTransactionsRequest, userId: string, supabaseClient: any) {
  console.log('Syncing transactions for account:', body.account_id);
  
  // Get the account details to fetch access token
  const { data: account, error: accountError } = await supabaseClient
    .from('linked_accounts')
    .select('*')
    .eq('id', body.account_id)
    .eq('user_id', userId)
    .single();

  if (accountError || !account) {
    throw new Error('Account not found or access denied');
  }

  if (!account.plaid_access_token) {
    throw new Error('No Plaid access token found for this account');
  }

  const plaidClientId = Deno.env.get('PLAID_CLIENT_ID')
  const plaidSecret = Deno.env.get('PLAID_SECRET')
  
  if (!plaidClientId || !plaidSecret) {
    throw new Error('Plaid credentials not configured')
  }

  // Get transactions from the last 30 days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
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
    throw new Error(`Failed to fetch transactions: ${transactionsData.error?.error_message || 'Unknown error'}`)
  }

  // Filter transactions for the specific account and store in database
  const accountTransactions = transactionsData.transactions.filter(
    (tx: any) => tx.account_id === account.plaid_account_id
  );

  let syncedCount = 0;
  
  for (const transaction of accountTransactions) {
    // Check if transaction already exists
    const { data: existingTx } = await supabaseClient
      .from('synced_transactions')
      .select('id')
      .eq('transaction_id', transaction.transaction_id)
      .single();

    if (existingTx) continue; // Skip if already exists

    // Determine if transaction might be medical
    const isMedical = transaction.category?.some((cat: string) => 
      ['Healthcare', 'Medical', 'Pharmacy', 'Hospitals'].includes(cat)
    ) || false;

    const { error: insertError } = await supabaseClient
      .from('synced_transactions')
      .insert({
        user_id: userId,
        linked_account_id: account.id,
        transaction_id: transaction.transaction_id,
        amount: Math.abs(transaction.amount), // Plaid uses negative for debits
        date: transaction.date,
        description: transaction.name,
        merchant_name: transaction.merchant_name,
        category: transaction.category?.[0],
        is_potential_medical: isMedical,
      });

    if (!insertError) {
      syncedCount++;
    }
  }

  // Update last sync time
  await supabaseClient
    .from('linked_accounts')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('id', body.account_id);

  return new Response(JSON.stringify({ success: true, synced_count: syncedCount }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}