export type SubscriptionPlan = "free" | "pro" | "business";

export type BillingInterval = "monthly" | "yearly";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "none";

export interface PlanDefinition {
  id: SubscriptionPlan;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyLimit: number;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  stripeMonthlyPriceEnvKey?: string;
  stripeYearlyPriceEnvKey?: string;
}
