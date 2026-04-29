import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

type CustomizationGeneration = {
  id: string;
  projectId: string;
  userId: string;
  prompt: string;
  aiPrompt: string;
  customizationTypes: string[];
  style?: string;
  finish?: string;
  generatedImageUrl?: string;
  originalImageUrl?: string;
  isSaved?: boolean;
  status: "completed" | "failed" | "processing" | "queued";
  createdAt: string;
};

type GenerateRequest = {
  projectId: string;
  userId: string;
  userPrompt?: string;
  aiPrompt: string;
  customizationTypes: string[];
  style?: string;
  finish?: string;
  originalImageUrl: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function requiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required secret: ${name}`);
  return value;
}

function toCamelGeneration(row: Record<string, unknown>): CustomizationGeneration {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    userId: String(row.user_id),
    prompt: String(row.prompt),
    aiPrompt: String(row.ai_prompt),
    customizationTypes: Array.isArray(row.customization_types) ? row.customization_types.map(String) : [],
    style: row.style ? String(row.style) : undefined,
    finish: row.finish ? String(row.finish) : undefined,
    generatedImageUrl: row.generated_image_url ? String(row.generated_image_url) : undefined,
    originalImageUrl: row.original_image_url ? String(row.original_image_url) : undefined,
    isSaved: row.is_saved === true,
    status: String(row.status) as CustomizationGeneration["status"],
    createdAt: String(row.created_at),
  };
}

function getMonthlyLimit(plan: string) {
  if (plan === "business") return 500;
  if (plan === "pro") return 100;
  return 3;
}

function getNextResetDate() {
  return new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString();
}

async function imageResponseToBytes(openaiResponse: Record<string, unknown>) {
  const data = Array.isArray(openaiResponse.data) ? openaiResponse.data[0] as Record<string, unknown> | undefined : undefined;
  const b64 = data?.b64_json;
  if (typeof b64 === "string") {
    const binary = atob(b64);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  }

  const url = data?.url;
  if (typeof url === "string") {
    const response = await fetch(url);
    if (!response.ok) throw new Error("OpenAI returned an image URL that could not be downloaded.");
    return new Uint8Array(await response.arrayBuffer());
  }

  throw new Error("OpenAI response did not include an image.");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = requiredEnv("SUPABASE_URL");
    const anonKey = requiredEnv("SUPABASE_ANON_KEY");
    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const openaiApiKey = requiredEnv("OPENAI_API_KEY");
    const imageModel = Deno.env.get("OPENAI_IMAGE_MODEL") ?? "gpt-image-1.5";
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return json({ error: "Missing Authorization header" }, 401);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: authData, error: authError } = await userClient.auth.getUser();
    if (authError || !authData.user) {
      return json({ error: "Invalid Supabase session" }, 401);
    }

    const input = await req.json() as GenerateRequest;
    if (!input.projectId || !input.originalImageUrl || !input.aiPrompt) {
      return json({ error: "Missing projectId, originalImageUrl, or aiPrompt" }, 400);
    }
    if (input.userId !== authData.user.id) {
      return json({ error: "Payload userId does not match authenticated user" }, 403);
    }

    const { data: project, error: projectError } = await userClient
      .from("vehicle_projects")
      .select("id,user_id")
      .eq("id", input.projectId)
      .eq("user_id", authData.user.id)
      .single();

    if (projectError || !project) {
      return json({ error: "Project not found for authenticated user" }, 404);
    }

    const { data: rawUsage, error: usageError } = await serviceClient
      .from("usage_limits")
      .select("*")
      .eq("user_id", authData.user.id)
      .single();

    if (usageError || !rawUsage) {
      return json({ error: "Usage limit row not found" }, 409);
    }

    let usage = rawUsage;
    const plan = String(usage.plan || "free");
    const monthlyLimit = getMonthlyLimit(plan);
    const shouldReset = new Date(String(usage.reset_date)).getTime() <= Date.now();
    const needsLimitSync = Number(usage.monthly_limit) !== monthlyLimit;

    if (shouldReset || needsLimitSync) {
      const { data: normalizedUsage, error: normalizeUsageError } = await serviceClient
        .from("usage_limits")
        .update({
          monthly_limit: monthlyLimit,
          monthly_used: shouldReset ? 0 : usage.monthly_used,
          reset_date: shouldReset ? getNextResetDate() : usage.reset_date,
        })
        .eq("id", usage.id)
        .select("*")
        .single();

      if (normalizeUsageError || !normalizedUsage) {
        return json({ error: "Unable to refresh usage limit" }, 500);
      }
      usage = normalizedUsage;
    }

    if (usage.monthly_used >= usage.monthly_limit) {
      return json({ error: "Monthly generation limit reached" }, 402);
    }

    const originalResponse = await fetch(input.originalImageUrl);
    if (!originalResponse.ok) {
      return json({ error: "Unable to download original vehicle image" }, 400);
    }

    const originalBlob = await originalResponse.blob();
    const originalFile = new File([originalBlob], "vehicle.jpg", {
      type: originalBlob.type || "image/jpeg",
    });

    const formData = new FormData();
    formData.append("model", imageModel);
    formData.append("prompt", input.aiPrompt);
    formData.append("image", originalFile);
    formData.append("size", "1536x1024");

    const openaiResponse = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiApiKey}` },
      body: formData,
    });

    if (!openaiResponse.ok) {
      const detail = await openaiResponse.text();
      console.error("OpenAI image edit failed", {
        status: openaiResponse.status,
        detail,
      });
      return json({ error: "OpenAI image edit failed", detail }, 502);
    }

    const generatedBytes = await imageResponseToBytes(await openaiResponse.json());
    const generationId = crypto.randomUUID();
    const outputPath = `${authData.user.id}/${input.projectId}/${generationId}.png`;

    const { error: uploadError } = await serviceClient.storage
      .from("vehicle-generations")
      .upload(outputPath, generatedBytes, {
        contentType: "image/png",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: signed, error: signedError } = await serviceClient.storage
      .from("vehicle-generations")
      .createSignedUrl(outputPath, 60 * 60 * 24 * 365);

    if (signedError) throw signedError;

    const { data: generationRow, error: generationError } = await serviceClient
      .from("customization_generations")
      .insert({
        id: generationId,
        project_id: input.projectId,
        user_id: authData.user.id,
        prompt: input.userPrompt || "AI vehicle customization",
        ai_prompt: input.aiPrompt,
        customization_types: input.customizationTypes ?? [],
        style: input.style || null,
        finish: input.finish || null,
        original_image_url: input.originalImageUrl,
        generated_image_url: signed.signedUrl,
        is_saved: false,
        status: "completed",
      })
      .select("*")
      .single();

    if (generationError) throw generationError;

    await serviceClient
      .from("usage_limits")
      .update({ monthly_used: usage.monthly_used + 1 })
      .eq("id", usage.id);

    return json({ generation: toCamelGeneration(generationRow) });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown generation error" }, 500);
  }
});
