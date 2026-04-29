import { loadStripe } from "@stripe/stripe-js";
import { appConfig, env } from "../../lib/env";
import type { BillingInterval, SubscriptionPlan } from "../../types/subscription";

export interface CheckoutRequest {
  plan: SubscriptionPlan;
  interval: BillingInterval;
  userId: string;
}

export async function startCheckout(request: CheckoutRequest) {
  if (!appConfig.hasStripe) {
    return {
      ok: false,
      message: `Stripe is not configured. Requested ${request.plan} ${request.interval} checkout for user ${request.userId}.`,
    };
  }

  const publishableKey = env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return { ok: false, message: "Stripe publishable key is missing." };
  }

  const stripe = await loadStripe(publishableKey);
  if (!stripe) {
    return { ok: false, message: "Unable to initialize Stripe." };
  }

  return {
    ok: false,
    message: "Stripe publishable key is configured. Add a backend checkout endpoint to create sessions securely.",
  };
}
