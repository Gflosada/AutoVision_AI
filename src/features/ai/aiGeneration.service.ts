import { appConfig, env } from "../../lib/env";
import { getSupabaseClient } from "../../lib/supabase/client";
import { buildVehicleCustomizationPrompt } from "./vehiclePromptBuilder";
import { createMockGeneration } from "./mockAiGeneration.service";
import type { CreateGenerationInput, GenerationServiceResult } from "./ai.types";

export async function createGeneration(input: CreateGenerationInput): Promise<GenerationServiceResult> {
  if (!appConfig.hasAiGenerationEndpoint) {
    return createMockGeneration(input);
  }

  const endpoint = env.VITE_AI_GENERATION_FUNCTION_URL;
  if (!endpoint) {
    return createMockGeneration(input);
  }

  const supabase = getSupabaseClient();
  const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (data.session?.access_token) {
    headers.Authorization = `Bearer ${data.session.access_token}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...input,
      aiPrompt: buildVehicleCustomizationPrompt(input),
    }),
  });

  if (!response.ok) {
    let message = `AI generation request failed with status ${response.status}.`;
    try {
      const body = await response.json() as { error?: string; detail?: unknown };
      const detail = typeof body.detail === "string" ? body.detail : "";
      message = [body.error, detail].filter(Boolean).join(": ") || message;
    } catch {
      const text = await response.text();
      message = text || message;
    }
    throw new Error(message);
  }

  return response.json() as Promise<GenerationServiceResult>;
}
