import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-BETA-ACCESS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use service role key for database operations
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Rate limiting check - 5 requests per minute per user
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const { data: canProceed, error: rateLimitError } = await supabaseClient.rpc(
      'check_rate_limit',
      { 
        p_endpoint: 'check-beta-access',
        p_identifier: `${user.id}-${clientIp}`,
        p_max_requests: 5,
        p_window_minutes: 1
      }
    );

    if (rateLimitError) {
      logStep("Rate limit check failed", { error: rateLimitError.message });
    } else if (!canProceed) {
      logStep("Rate limit exceeded", { userId: user.id });
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again in a minute.' }),
        { status: 429, headers: corsHeaders }
      );
    }
    logStep("Rate limit check passed");

    // Check cache first (5 minute TTL)
    const { data: cached, error: cacheError } = await supabaseClient
      .from('user_beta_access')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (cacheError) {
      logStep("Cache check error", { error: cacheError.message });
    } else if (cached && new Date(cached.checked_at) > new Date(Date.now() - 5 * 60 * 1000)) {
      logStep("Returning cached result", { 
        hasAccess: cached.has_access, 
        cacheAge: Math.round((Date.now() - new Date(cached.checked_at).getTime()) / 1000) 
      });
      return new Response(JSON.stringify({ 
        hasBetaAccess: cached.has_access,
        freeTrialExpenses: cached.free_trial_expenses,
        freeTrialLimit: cached.free_trial_limit,
        isPaid: cached.is_paid || false,
        paymentDate: cached.payment_date || undefined,
        cached: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    logStep("Cache miss or stale, checking live data");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Check expense count first - allow up to 10 free expenses
    const { data: expenseData, error: expenseError } = await supabaseClient
      .from('expenses')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id);
    
    const expenseCount = expenseData?.length || 0;
    logStep("Expense count checked", { count: expenseCount });
    
    if (expenseError) {
      logStep("Error checking expense count", { error: expenseError.message });
    }
    
    if (expenseCount < 10) {
      logStep("Under expense limit, granting access");
      
      // Update cache with free trial status
      await supabaseClient
        .from('user_beta_access')
        .upsert({
          user_id: user.id,
          has_access: true,
          is_paid: false,
          free_trial_expenses: expenseCount,
          free_trial_limit: 10,
          checked_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      return new Response(JSON.stringify({ 
        hasBetaAccess: true,
        freeTrialExpenses: expenseCount,
        freeTrialLimit: 10
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Get user's Stripe customer ID if available to filter queries more efficiently
    const customerId = user.user_metadata?.stripe_customer_id;
    logStep("Checking for Stripe customer", { hasCustomerId: !!customerId });
    
    let betaPayment = null;
    let betaSession = null;

    if (customerId) {
      // More efficient: filter by customer ID (much smaller result set)
      logStep("Filtering Stripe queries by customer ID");
      
      const payments = await stripe.paymentIntents.list({
        customer: customerId,
        limit: 10, // Much smaller limit since filtered by customer
      });

      betaPayment = payments.data.find((payment: any) => 
        payment.status === 'succeeded' &&
        payment.metadata?.product_type === 'beta_access'
      );

      if (!betaPayment) {
        const sessions = await stripe.checkout.sessions.list({
          customer: customerId,
          limit: 10,
        });

        betaSession = sessions.data.find((session: any) =>
          session.payment_status === 'paid' &&
          session.metadata?.product_type === 'beta_access'
        );
      }
    } else {
      // Fallback: search by metadata (less efficient but works for new users)
      logStep("Searching by metadata (no customer ID available)");
      
      const payments = await stripe.paymentIntents.list({
        limit: 100,
      });

      betaPayment = payments.data.find((payment: any) => 
        payment.status === 'succeeded' &&
        payment.metadata?.user_id === user.id &&
        payment.metadata?.product_type === 'beta_access'
      );

      if (!betaPayment) {
        const sessions = await stripe.checkout.sessions.list({
          limit: 100,
        });

        betaSession = sessions.data.find((session: any) =>
          session.payment_status === 'paid' &&
          session.metadata?.user_id === user.id &&
          session.metadata?.product_type === 'beta_access'
        );
      }
    }

    if (betaPayment) {
      logStep("Beta access payment found", { paymentId: betaPayment.id });
      
      const paymentDate = new Date(betaPayment.created * 1000).toISOString();
      
      // Update cache with paid status
      await supabaseClient
        .from('user_beta_access')
        .upsert({
          user_id: user.id,
          has_access: true,
          is_paid: true,
          payment_date: paymentDate,
          free_trial_expenses: expenseCount,
          free_trial_limit: 10,
          checked_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      return new Response(JSON.stringify({ 
        hasBetaAccess: true,
        paymentDate,
        isPaid: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (betaSession) {
      logStep("Beta access session found", { sessionId: betaSession.id });
      
      const paymentDate = new Date(betaSession.created * 1000).toISOString();
      
      // Update cache with paid status
      await supabaseClient
        .from('user_beta_access')
        .upsert({
          user_id: user.id,
          has_access: true,
          is_paid: true,
          payment_date: paymentDate,
          free_trial_expenses: expenseCount,
          free_trial_limit: 10,
          checked_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      return new Response(JSON.stringify({ 
        hasBetaAccess: true,
        paymentDate,
        isPaid: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("No beta access found");
    
    // Update cache with no access status
    await supabaseClient
      .from('user_beta_access')
      .upsert({
        user_id: user.id,
        has_access: false,
        is_paid: false,
        free_trial_expenses: expenseCount,
        free_trial_limit: 10,
        checked_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    
    return new Response(JSON.stringify({ 
      hasBetaAccess: false,
      freeTrialExpenses: expenseCount,
      freeTrialLimit: 10
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-beta-access", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});