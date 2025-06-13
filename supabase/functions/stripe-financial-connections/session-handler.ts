
import { logStep } from './logger.ts';
import { createStripeCustomer, createFinancialConnectionsSession } from './stripe-service.ts';
import type { CreateSessionBody } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export async function handleCreateSession(body: CreateSessionBody, user: any) {
  logStep('Creating Financial Connections session');
  
  const stripeSecretKey = Deno.env.get('Stripe_Key')
  if (!stripeSecretKey) {
    logStep('ERROR: Stripe secret key not configured');
    throw new Error('Stripe secret key not configured')
  }

  logStep('Stripe key found, making API request');

  // First, create a customer if we don't have one
  let customerId = user.user_metadata?.stripe_customer_id;
  
  if (!customerId) {
    customerId = await createStripeCustomer(stripeSecretKey, user);
  }

  const session = await createFinancialConnectionsSession(stripeSecretKey, customerId);
  logStep('Session created successfully', { sessionId: session.id });

  return new Response(JSON.stringify(session), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
