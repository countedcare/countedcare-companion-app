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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check expense count first - allow up to 10 free expenses
    const { data: expenseData, error: expenseError } = await supabaseClient
      .from('expenses')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id);
    
    if (expenseError) {
      logStep("Error checking expense count", { error: expenseError.message });
    } else {
      const expenseCount = expenseData?.length || 0;
      logStep("Expense count checked", { count: expenseCount });
      
      if (expenseCount < 10) {
        logStep("Under expense limit, granting access");
        return new Response(JSON.stringify({ 
          hasBetaAccess: true,
          freeTrialExpenses: expenseCount,
          freeTrialLimit: 10
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Check for successful payments for beta access
    const payments = await stripe.paymentIntents.list({
      customer: undefined, // We'll search by metadata instead
      limit: 100,
    });

    // Look for successful payments with our beta access price and user
    const betaPayment = payments.data.find(payment => 
      payment.status === 'succeeded' &&
      payment.metadata?.user_id === user.id &&
      payment.metadata?.product_type === 'beta_access'
    );

    if (betaPayment) {
      logStep("Beta access payment found", { paymentId: betaPayment.id });
      return new Response(JSON.stringify({ 
        hasBetaAccess: true,
        paymentDate: new Date(betaPayment.created * 1000).toISOString(),
        isPaid: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Also check checkout sessions as backup
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
    });

    const betaSession = sessions.data.find(session =>
      session.payment_status === 'paid' &&
      session.metadata?.user_id === user.id &&
      session.metadata?.product_type === 'beta_access'
    );

    if (betaSession) {
      logStep("Beta access session found", { sessionId: betaSession.id });
      return new Response(JSON.stringify({ 
        hasBetaAccess: true,
        paymentDate: new Date(betaSession.created * 1000).toISOString(),
        isPaid: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("No beta access found");
    
    // Get expense count for payment wall display
    const { data: expenseData } = await supabaseClient
      .from('expenses')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id);
    
    const expenseCount = expenseData?.length || 0;
    
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