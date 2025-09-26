import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const plaidClient = {
  client_id: Deno.env.get('PLAID_CLIENT_ID'),
  secret: Deno.env.get('PLAID_SECRET'),
  env: Deno.env.get('PLAID_ENV') || 'sandbox'
};

function isLikelyMedicalExpense(description: string, merchantName?: string): boolean {
  const text = `${description} ${merchantName || ''}`.toLowerCase();
  
  const medicalKeywords = [
    'pharmacy', 'cvs', 'walgreens', 'rite aid', 'medical', 'doctor', 'hospital',
    'clinic', 'dentist', 'dental', 'urgent care', 'health', 'prescription',
    'medicare', 'medicaid', 'insurance', 'copay', 'deductible', 'therapy',
    'physical therapy', 'mental health', 'counseling', 'nursing', 'care',
    'assisted living', 'home care', 'caregiver', 'optometry', 'vision',
    'orthodontist', 'ortho', 'dermatology', 'cardiology'
  ];
  
  return medicalKeywords.some(keyword => text.includes(keyword));
}

function categorizeTransaction(description: string, merchantName?: string): string | null {
  const text = `${description} ${merchantName || ''}`.toLowerCase();
  
  if (text.includes('pharmacy') || text.includes('cvs') || text.includes('walgreens') || text.includes('prescription')) {
    return 'Prescriptions';
  }
  if (text.includes('dentist') || text.includes('dental') || text.includes('orthodontist') || text.includes('ortho')) {
    return 'Dental';
  }
  if (text.includes('doctor') || text.includes('physician') || text.includes('clinic') || text.includes('medical')) {
    return 'Medical Visits';
  }
  if (text.includes('vision') || text.includes('optometry') || text.includes('eye')) {
    return 'Vision';
  }
  if (text.includes('therapy') || text.includes('counseling') || text.includes('mental health')) {
    return 'Therapy';
  }
  if (text.includes('hospital') || text.includes('emergency') || text.includes('urgent care')) {
    return 'Hospital/Emergency';
  }
  
  return 'Healthcare';
}

async function fetchPlaidTransactions(accessToken: string, days: number = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  
  const response = await fetch('https://sandbox.plaid.com/transactions/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: plaidClient.client_id,
      secret: plaidClient.secret,
      access_token: accessToken,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      options: {
        count: 500,
        offset: 0
      }
    })
  });
  
  const data = await response.json();
  if (!response.ok) {
    console.error('Plaid API error:', data);
    throw new Error(data.error_message || 'Failed to fetch transactions');
  }
  
  return data.transactions;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    const { days = 30 } = await req.json().catch(() => ({}));
    
    console.log(`Syncing transactions for user ${user.id}, last ${days} days`);

    // Get all active linked accounts for the user
    const { data: accounts, error: accountsError } = await supabaseClient
      .from('linked_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (accountsError) {
      console.error('Error fetching accounts:', accountsError);
      throw new Error('Failed to fetch linked accounts');
    }

    if (!accounts || accounts.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No linked accounts found',
        inserted: 0,
        updated: 0,
        total: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let totalInserted = 0;
    let totalUpdated = 0;
    let totalProcessed = 0;

    for (const account of accounts) {
      if (!account.plaid_access_token) {
        console.log(`Skipping account ${account.id} - no Plaid access token`);
        continue;
      }

      try {
        console.log(`Fetching transactions for account ${account.id}`);
        const transactions = await fetchPlaidTransactions(account.plaid_access_token, days);
        
        for (const tx of transactions) {
          const isMedical = isLikelyMedicalExpense(tx.name, tx.merchant_name);
          const categoryGuess = isMedical ? categorizeTransaction(tx.name, tx.merchant_name) : null;
          
          // Upsert transaction
          const { data: existingTx } = await supabaseClient
            .from('synced_transactions')
            .select('id')
            .eq('transaction_id', tx.transaction_id)
            .eq('user_id', user.id)
            .single();

          const transactionData = {
            user_id: user.id,
            linked_account_id: account.id,
            transaction_id: tx.transaction_id,
            amount: Math.abs(tx.amount), // Store as positive number
            date: tx.date,
            description: tx.name,
            merchant_name: tx.merchant_name,
            category: categoryGuess,
            is_potential_medical: isMedical,
            review_status: 'pending'
          };

          if (existingTx) {
            const { error: updateError } = await supabaseClient
              .from('synced_transactions')
              .update(transactionData)
              .eq('id', existingTx.id);
            
            if (updateError) {
              console.error('Error updating transaction:', updateError);
            } else {
              totalUpdated++;
            }
          } else {
            const { error: insertError } = await supabaseClient
              .from('synced_transactions')
              .insert(transactionData);
            
            if (insertError) {
              console.error('Error inserting transaction:', insertError);
            } else {
              totalInserted++;
            }
          }
          totalProcessed++;
        }

        // Update last sync timestamp
        await supabaseClient
          .from('linked_accounts')
          .update({ last_sync_at: new Date().toISOString() })
          .eq('id', account.id);

      } catch (error) {
        console.error(`Error processing account ${account.id}:`, error);
        // Continue with other accounts
      }
    }

    console.log(`Sync complete: ${totalInserted} inserted, ${totalUpdated} updated, ${totalProcessed} total processed`);

    return new Response(JSON.stringify({
      message: 'Transactions synced successfully',
      inserted: totalInserted,
      updated: totalUpdated,
      total: totalProcessed
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in plaid-sync-transactions:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});