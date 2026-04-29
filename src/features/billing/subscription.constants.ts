import type { PlanDefinition } from "../../types/subscription";

export const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyLimit: 3,
    description: "For testing ideas and occasional concepts.",
    cta: "Current Plan",
    features: ["3 AI generations/month", "Standard quality", "Watermark", "Basic project history"],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 29,
    yearlyPrice: 278,
    monthlyLimit: 100,
    description: "For enthusiasts building serious concepts.",
    cta: "Upgrade to Pro",
    highlighted: true,
    features: ["100 AI generations/month", "HD exports", "No watermark", "Full project history", "Before/after comparison"],
  },
  {
    id: "business",
    name: "Business",
    monthlyPrice: 99,
    yearlyPrice: 950,
    monthlyLimit: 500,
    description: "For shops managing client concepts.",
    cta: "Upgrade to Business",
    features: ["500 AI generations/month", "Shop profile", "Client galleries", "Logo branding", "Priority generation"],
  },
];

export function getPlan(planId: string) {
  return PLAN_DEFINITIONS.find((plan) => plan.id === planId) ?? PLAN_DEFINITIONS[0];
}
