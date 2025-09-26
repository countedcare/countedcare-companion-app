
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { logStep } from './logger.ts';
import { handleCreateSession } from './session-handler.ts';
import { handleLinkAccount } from './account-handler.ts';
import { handleSyncTransactions } from './transactions-handler.ts';

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
    logStep('Function started');

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
      logStep('User not authenticated');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    logStep('User authenticated', { userId: user.id, email: user.email });

    const { action, ...body } = await req.json()
    logStep('Action received', { action, body });

    switch (action) {
      case 'create_session':
        return await handleCreateSession(body, user)
      case 'link_account':
        return await handleLinkAccount(body, user.id, supabaseClient)
      case 'sync_transactions':
        return await handleSyncTransactions(body, user.id, supabaseClient)
      default:
        logStep('Invalid action', { action });
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR in main function', { error: errorMessage });
    console.error('Stripe Financial Connections error:', error)
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
