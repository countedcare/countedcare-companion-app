
import { logStep } from './logger.ts';
import { retrieveStripeSession } from './stripe-service.ts';
import type { LinkAccountBody } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export async function handleLinkAccount(body: LinkAccountBody, userId: string, supabaseClient: any) {
  const { sessionId, accountName } = body
  
  const stripeSecretKey = Deno.env.get('Stripe_Key')
  if (!stripeSecretKey) {
    throw new Error('Stripe secret key not configured')
  }

  // Retrieve the session to get the connected accounts
  const session = await retrieveStripeSession(stripeSecretKey, sessionId);

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
