import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useAuthStore } from "./auth.store";

const signupSchema = z.object({
  fullName: z.string().min(2, "Enter your name."),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type SignupValues = z.infer<typeof signupSchema>;

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading, error } = useAuthStore();
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const onSubmit = async (values: SignupValues) => {
    await signup(values);
    const authError = useAuthStore.getState().error;
    if (authError) {
      if (authError.toLowerCase().includes("confirm")) {
        toast.info(authError);
        navigate("/login", { replace: true });
        return;
      }
      toast.error(authError);
      return;
    }
    toast.success("Account ready.");
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md glass-panel rounded-2xl p-8 space-y-6">
        <div>
          <Link to="/" className="chrome-text text-2xl">AutoVision AI</Link>
          <h1 className="text-3xl mt-8 mb-2">Create your studio</h1>
          <p className="text-muted-foreground">Start generating vehicle customization concepts.</p>
        </div>

        <label className="block space-y-2">
          <span className="text-sm">Full name</span>
          <input className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary outline-none" {...form.register("fullName")} />
          {form.formState.errors.fullName && <span className="text-sm text-destructive">{form.formState.errors.fullName.message}</span>}
        </label>

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
          {isLoading ? "Creating account..." : "Create account"}
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-sm text-muted-foreground text-center">
          Already have an account? <Link className="text-primary" to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
