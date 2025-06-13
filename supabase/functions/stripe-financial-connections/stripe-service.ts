
import { logStep } from './logger.ts';

export async function createStripeCustomer(stripeSecretKey: string, user: any): Promise<string> {
  logStep('Creating Stripe customer');
  const customerResponse = await fetch('https://api.stripe.com/v1/customers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'email': user.email,
      'name': user.user_metadata?.name || user.email,
    }),
  });

  const customer = await customerResponse.json();
  logStep('Customer creation response', { status: customerResponse.status, customer });
  
  if (!customerResponse.ok) {
    logStep('ERROR: Failed to create customer', { error: customer.error });
    throw new Error(`Failed to create customer: ${customer.error?.message || 'Unknown error'}`)
  }
  
  logStep('Customer created', { customerId: customer.id });
  return customer.id;
}

export async function createFinancialConnectionsSession(stripeSecretKey: string, customerId: string) {
  const response = await fetch('https://api.stripe.com/v1/financial_connections/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'account_holder[type]': 'customer',
      'account_holder[customer]': customerId,
      'permissions[]': 'balances',
      'permissions[]': 'transactions',
      'filters[countries][]': 'US',
    }),
  });

  const session = await response.json();
  logStep('Stripe API response', { status: response.status, session });
  
  if (!response.ok) {
    logStep('ERROR: Stripe API error', { error: session.error });
    throw new Error(`Stripe API error: ${session.error?.message || 'Unknown error'}`)
  }

  return session;
}

export async function retrieveStripeSession(stripeSecretKey: string, sessionId: string) {
  const sessionResponse = await fetch(`https://api.stripe.com/v1/financial_connections/sessions/${sessionId}`, {
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
    },
  });

  const session = await sessionResponse.json();
  
  if (!sessionResponse.ok) {
    throw new Error(`Failed to retrieve session: ${session.error?.message}`)
  }

  return session;
}

export async function fetchStripeTransactions(stripeSecretKey: string, accountId: string) {
  const transactionsResponse = await fetch(`https://api.stripe.com/v1/financial_connections/transactions?account=${accountId}&limit=100`, {
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
    },
  });

  const transactionsData = await transactionsResponse.json();
  
  if (!transactionsResponse.ok) {
    throw new Error(`Failed to fetch transactions: ${transactionsData.error?.message}`)
  }

  return transactionsData.data || [];
}
