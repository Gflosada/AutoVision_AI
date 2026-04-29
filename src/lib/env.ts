import { z } from "zod";

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  VITE_SUPABASE_ANON_KEY: z.string().optional().or(z.literal("")),
  VITE_APP_URL: z.string().url().default("http://localhost:5173"),
  VITE_STRIPE_PUBLISHABLE_KEY: z.string().optional().or(z.literal("")),
  VITE_AI_GENERATION_FUNCTION_URL: z.string().url().optional().or(z.literal("")),
});

const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  console.warn("[AutoVision] Invalid frontend environment variables", parsedEnv.error.flatten().fieldErrors);
}

const fallbackEnv = {
  VITE_SUPABASE_URL: "",
  VITE_SUPABASE_ANON_KEY: "",
  VITE_APP_URL: "http://localhost:5173",
  VITE_STRIPE_PUBLISHABLE_KEY: "",
  VITE_AI_GENERATION_FUNCTION_URL: "",
};

export const env = parsedEnv.success ? parsedEnv.data : fallbackEnv;

export const appConfig = {
  appUrl: env.VITE_APP_URL,
  hasSupabase:
    Boolean(env.VITE_SUPABASE_URL) && Boolean(env.VITE_SUPABASE_ANON_KEY),
  hasStripe: Boolean(env.VITE_STRIPE_PUBLISHABLE_KEY),
  hasAiGenerationEndpoint: Boolean(env.VITE_AI_GENERATION_FUNCTION_URL),
  isMockMode:
    !env.VITE_SUPABASE_URL ||
    !env.VITE_SUPABASE_ANON_KEY ||
    !env.VITE_AI_GENERATION_FUNCTION_URL,
};

if (!appConfig.hasSupabase) {
  console.info("[AutoVision] Supabase env vars missing. Using mock auth and local app data.");
}

if (!appConfig.hasStripe) {
  console.info("[AutoVision] Stripe publishable key missing. Checkout will use development messaging.");
}

if (!appConfig.hasAiGenerationEndpoint) {
  console.info("[AutoVision] AI generation endpoint missing. Using mock AI generation.");
}
