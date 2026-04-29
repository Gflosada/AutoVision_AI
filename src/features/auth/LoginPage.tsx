import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { appConfig } from "../../lib/env";
import { useAuthStore } from "./auth.store";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error } = useAuthStore();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "driver@autovision.dev", password: "password" },
  });

  const onSubmit = async (values: LoginValues) => {
    await login(values);
    const authError = useAuthStore.getState().error;
    if (authError) {
      toast.error(authError);
      return;
    }
    toast.success(appConfig.hasSupabase ? "Signed in." : "Mock mode signed in.");
    const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-2">
      <section className="hidden lg:flex flex-col justify-between p-10 bg-charcoal">
        <Link to="/" className="chrome-text text-2xl">AutoVision AI</Link>
        <div className="space-y-6 max-w-xl">
          <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-5xl leading-tight">Your premium AI vehicle studio.</h1>
          <p className="text-muted-foreground text-lg">
            Manage projects, generate realistic customization concepts, and prepare client-ready previews.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {appConfig.hasSupabase ? "Supabase auth enabled." : "Development mock auth is active."}
        </p>
      </section>

      <section className="flex items-center justify-center p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md glass-panel rounded-2xl p-8 space-y-6">
          <div>
            <h1 className="text-3xl mb-2">Sign in</h1>
            <p className="text-muted-foreground">Continue to your AutoVision dashboard.</p>
          </div>

          <label className="block space-y-2">
            <span className="text-sm">Email</span>
            <input className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary outline-none" {...form.register("email")} />
            {form.formState.errors.email && <span className="text-sm text-destructive">{form.formState.errors.email.message}</span>}
          </label>

          <label className="block space-y-2">
            <span className="text-sm">Password</span>
            <input type="password" className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary outline-none" {...form.register("password")} />
            {form.formState.errors.password && <span className="text-sm text-destructive">{form.formState.errors.password.message}</span>}
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button disabled={isLoading} className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg neon-glow hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
            {isLoading ? "Signing in..." : "Sign in"}
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-sm text-muted-foreground text-center">
            New to AutoVision? <Link className="text-primary" to="/signup">Create an account</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
