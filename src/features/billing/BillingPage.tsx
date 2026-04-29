import { CreditCard, ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "../auth/auth.store";
import { useUsageStore } from "../../store/usage.store";
import { startCheckout } from "./billing.service";
import { PLAN_DEFINITIONS } from "./subscription.constants";

export function BillingPage() {
  const user = useAuthStore((state) => state.user);
  const usage = useUsageStore((state) => state.usage);
  const currentPlan = PLAN_DEFINITIONS.find((plan) => plan.id === usage.plan) ?? PLAN_DEFINITIONS[0];

  const handleCheckout = async (plan: "free" | "pro" | "business") => {
    const result = await startCheckout({ plan, interval: "monthly", userId: user?.id ?? "mock-user" });
    if (!result.ok) {
      toast.info(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl mb-2">Billing</h1>
          <p className="text-muted-foreground">Manage your plan, generation limits, and future Stripe subscription settings.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current plan</p>
                <h2 className="text-3xl chrome-text">{currentPlan.name}</h2>
                <p className="text-muted-foreground mt-2">{currentPlan.description}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
            </div>

            <div className="mt-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Monthly generations</span>
                <span>{usage.monthlyUsed} / {usage.monthlyLimit}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${Math.min(100, (usage.monthlyUsed / usage.monthlyLimit) * 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-primary/20">
            <ShieldCheck className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl mb-2">Backend required</h3>
            <p className="text-sm text-muted-foreground">
              Stripe checkout sessions, customer portal links, and webhooks must be created from a backend or Supabase Edge Function.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLAN_DEFINITIONS.map((plan) => (
            <div key={plan.id} className={`glass-panel rounded-2xl p-6 ${plan.highlighted ? "border-2 border-primary" : ""}`}>
              <h3 className="text-2xl mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
              <p className="text-4xl chrome-text mb-6">${plan.monthlyPrice}<span className="text-sm text-muted-foreground">/mo</span></p>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="text-sm text-muted-foreground">{feature}</li>
                ))}
              </ul>
              <button onClick={() => handleCheckout(plan.id)} className="w-full px-5 py-3 rounded-lg bg-primary text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-60">
                {plan.id === usage.plan ? "Current plan" : plan.cta}
                {plan.id !== usage.plan && <ExternalLink className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
