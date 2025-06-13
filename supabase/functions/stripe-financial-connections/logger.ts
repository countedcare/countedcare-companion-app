
export const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-FINANCIAL-CONNECTIONS] ${step}${detailsStr}`);
};
