import { createClient } from "@supabase/supabase-js";
import { appConfig, env } from "../env";
import type { Database } from "../../types/database";

let client: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (!appConfig.hasSupabase) {
    return null;
  }

  if (!client) {
    if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
      return null;
    }

    client = createClient<Database>(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return client;
}
