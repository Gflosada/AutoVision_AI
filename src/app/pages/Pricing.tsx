import { Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { startCheckout } from "../../features/billing/billing.service";
import { PLAN_DEFINITIONS } from "../../features/billing/subscription.constants";
import { useAuthStore } from "../../features/auth/auth.store";
import type { BillingInterval, SubscriptionPlan } from "../../types/subscription";

export function Pricing() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  const handlePlan = async (plan: SubscriptionPlan) => {
    if (!user) {
      navigate("/signup");
      return;
    }
    const result = await startCheckout({ plan, interval, userId: user.id });
    toast.info(result.message);
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-4">
          <Sparkles className="w-10 h-10 text-primary mx-auto" />
          <h1 className="text-4xl">Choose your plan</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Scale from mock concepts to high-volume shop workflows.</p>
          <div className="inline-flex glass-panel rounded-lg p-1">
            {(["monthly", "yearly"] as BillingInterval[]).map((item) => (
              <button key={item} onClick={() => setInterval(item)} className={`px-5 py-2 rounded-md capitalize ${interval === item ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{item}</button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLAN_DEFINITIONS.map((plan) => {
            const price = interval === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            return (
              <article key={plan.id} className={`glass-panel rounded-2xl p-8 ${plan.highlighted ? "border-2 border-primary" : ""}`}>
                <h2 className="text-2xl mb-2">{plan.name}</h2>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                <p className="text-5xl chrome-text mb-6">${price}<span className="text-sm text-muted-foreground">/{interval === "monthly" ? "mo" : "yr"}</span></p>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handlePlan(plan.id)} className={`w-full px-6 py-4 rounded-lg ${plan.highlighted ? "bg-primary text-primary-foreground neon-glow" : "glass-panel"}`}>
                  {plan.cta}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
