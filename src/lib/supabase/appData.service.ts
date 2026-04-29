import { appConfig } from "../env";
import { getSupabaseClient } from "./client";
import type {
  CustomizationGeneration,
  CustomizationType,
  FinishType,
  GenerationStatus,
  ShopProfile,
  UsageLimit,
  UserProfile,
  VehicleProject,
  VehicleStyle,
} from "../../types/app";
import type { SubscriptionPlan } from "../../types/subscription";

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_plan: SubscriptionPlan | null;
  stripe_customer_id: string | null;
  created_at: string;
};

type ProjectRow = {
  id: string;
  user_id: string;
  title: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: string;
  trim: string | null;
  body_type: string | null;
  current_color: string | null;
  original_image_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type GenerationRow = {
  id: string;
  project_id: string;
  user_id: string;
  prompt: string;
  ai_prompt: string;
  customization_types: CustomizationType[];
  style: VehicleStyle | null;
  finish: FinishType | null;
  generated_image_url: string | null;
  original_image_url: string | null;
  is_saved?: boolean | null;
  status: GenerationStatus;
  created_at: string;
};

type UsageRow = {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  monthly_limit: number;
  monthly_used: number;
  reset_date: string;
};

type ShopRow = {
  id: string;
  user_id: string;
  business_name: string;
  logo_url: string | null;
  website: string | null;
  contact_email: string;
  phone: string | null;
  location: string | null;
  created_at: string;
};

export function hasSupabaseData() {
  return appConfig.hasSupabase && Boolean(getSupabaseClient());
}

function mapProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name ?? "",
    avatarUrl: row.avatar_url,
    subscriptionPlan: row.subscription_plan ?? "free",
    stripeCustomerId: row.stripe_customer_id,
    createdAt: row.created_at,
  };
}

function mapProject(row: ProjectRow): VehicleProject {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    vehicleMake: row.vehicle_make,
    vehicleModel: row.vehicle_model,
    vehicleYear: row.vehicle_year,
    trim: row.trim ?? "",
    bodyType: row.body_type ?? "",
    currentColor: row.current_color ?? "",
    originalImageUrl: row.original_image_url ?? "",
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapGeneration(row: GenerationRow): CustomizationGeneration {
  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id,
    prompt: row.prompt,
    aiPrompt: row.ai_prompt,
    customizationTypes: row.customization_types ?? [],
    style: row.style ?? undefined,
    finish: row.finish ?? undefined,
    generatedImageUrl: row.generated_image_url ?? undefined,
    originalImageUrl: row.original_image_url ?? undefined,
    isSaved: row.is_saved ?? false,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapUsage(row: UsageRow): UsageLimit {
  return {
    id: row.id,
    userId: row.user_id,
    plan: row.plan,
    monthlyLimit: row.monthly_limit,
    monthlyUsed: row.monthly_used,
    resetDate: row.reset_date,
  };
}

function getMonthlyLimit(plan: SubscriptionPlan) {
  return plan === "business" ? 500 : plan === "pro" ? 100 : 3;
}

function getNextResetDate() {
  return new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString();
}

async function normalizeUsageRow(row: UsageRow, plan: SubscriptionPlan) {
  const supabase = getSupabaseClient();
  if (!supabase) return row;

  const monthlyLimit = getMonthlyLimit(plan);
  const shouldReset = new Date(row.reset_date).getTime() <= Date.now();
  const needsPlanSync = row.plan !== plan || row.monthly_limit !== monthlyLimit;

  if (!shouldReset && !needsPlanSync) return row;

  const update = {
    plan,
    monthly_limit: monthlyLimit,
    monthly_used: shouldReset ? 0 : row.monthly_used,
    reset_date: shouldReset ? getNextResetDate() : row.reset_date,
  };
  const { data, error } = await supabase
    .from("usage_limits")
    .update(update)
    .eq("id", row.id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as UsageRow;
}

function mapShop(row: ShopRow): ShopProfile {
  return {
    id: row.id,
    userId: row.user_id,
    businessName: row.business_name,
    logoUrl: row.logo_url,
    website: row.website,
    contactEmail: row.contact_email,
    phone: row.phone,
    location: row.location,
    createdAt: row.created_at,
  };
}

export async function getOrCreateProfile(input: { id: string; email: string; fullName?: string }) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", input.id).maybeSingle();
  if (data) return mapProfile(data as ProfileRow);

  const insert = {
    id: input.id,
    email: input.email,
    full_name: input.fullName ?? input.email.split("@")[0] ?? "AutoVision User",
    subscription_plan: "free" as SubscriptionPlan,
  };
  const { data: created, error } = await supabase.from("profiles").insert(insert).select("*").single();
  if (error) throw new Error(error.message);
  return mapProfile(created as ProfileRow);
}

export async function updateProfileRow(userId: string, profile: Partial<UserProfile>) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const update = {
    full_name: profile.fullName,
    avatar_url: profile.avatarUrl,
    subscription_plan: profile.subscriptionPlan,
    stripe_customer_id: profile.stripeCustomerId,
  };
  const { data, error } = await supabase.from("profiles").update(update).eq("id", userId).select("*").single();
  if (error) throw new Error(error.message);
  return mapProfile(data as ProfileRow);
}

export async function loadProjectsAndGenerations(userId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const [{ data: projects, error: projectsError }, { data: generations, error: generationsError }] = await Promise.all([
    supabase.from("vehicle_projects").select("*").eq("user_id", userId).order("updated_at", { ascending: false }),
    supabase.from("customization_generations").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
  ]);

  if (projectsError) throw new Error(projectsError.message);
  if (generationsError) throw new Error(generationsError.message);

  return {
    projects: (projects as ProjectRow[] | null ?? []).map(mapProject),
    generations: (generations as GenerationRow[] | null ?? []).map(mapGeneration),
  };
}

export async function saveVehicleProject(project: VehicleProject) {
  const supabase = getSupabaseClient();
  if (!supabase) return project;

  const { data: sessionData } = await supabase.auth.getSession();
  const authUserId = sessionData.session?.user.id;
  if (!authUserId) {
    throw new Error("You are not signed in with a valid Supabase session. Log out and log back in.");
  }
  if (authUserId !== project.userId) {
    throw new Error("Project user does not match the signed-in Supabase user.");
  }

  const payload = {
    id: project.id,
    user_id: project.userId,
    title: project.title,
    vehicle_make: project.vehicleMake,
    vehicle_model: project.vehicleModel,
    vehicle_year: project.vehicleYear,
    trim: project.trim,
    body_type: project.bodyType,
    current_color: project.currentColor,
    original_image_url: project.originalImageUrl,
    notes: project.notes,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  };

  const { data, error } = await supabase.from("vehicle_projects").insert(payload).select("*").single();
  if (error) {
    const hint = error.message.toLowerCase().includes("row-level security")
      ? " Run the vehicle_projects RLS policies from docs/SUPABASE_SETUP.md, then log out and log back in."
      : "";
    throw new Error(`${error.message}.${hint}`);
  }
  return mapProject(data as ProjectRow);
}

export async function saveCustomizationGeneration(generation: CustomizationGeneration) {
  const supabase = getSupabaseClient();
  if (!supabase) return generation;

  const payload = {
    id: generation.id,
    project_id: generation.projectId,
    user_id: generation.userId,
    prompt: generation.prompt,
    ai_prompt: generation.aiPrompt,
    customization_types: generation.customizationTypes,
    style: generation.style,
    finish: generation.finish,
    generated_image_url: generation.generatedImageUrl,
    original_image_url: generation.originalImageUrl,
    is_saved: generation.isSaved ?? false,
    status: generation.status,
    created_at: generation.createdAt,
  };

  const { data, error } = await supabase.from("customization_generations").upsert(payload).select("*").single();
  if (error) throw new Error(error.message);
  return mapGeneration(data as GenerationRow);
}

export async function updateCustomizationGeneration(id: string, generation: Partial<CustomizationGeneration>) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const payload = {
    prompt: generation.prompt,
    ai_prompt: generation.aiPrompt,
    customization_types: generation.customizationTypes,
    style: generation.style,
    finish: generation.finish,
    generated_image_url: generation.generatedImageUrl,
    original_image_url: generation.originalImageUrl,
    is_saved: generation.isSaved,
    status: generation.status,
  };

  const { data, error } = await supabase.from("customization_generations").update(payload).eq("id", id).select("*").maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapGeneration(data as GenerationRow) : null;
}

export async function getOrCreateUsageLimit(userId: string, plan: SubscriptionPlan = "free") {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase.from("usage_limits").select("*").eq("user_id", userId).maybeSingle();
  if (data) return mapUsage(await normalizeUsageRow(data as UsageRow, plan));

  const monthlyLimit = getMonthlyLimit(plan);
  const resetDate = getNextResetDate();
  const { data: created, error } = await supabase
    .from("usage_limits")
    .insert({ user_id: userId, plan, monthly_limit: monthlyLimit, monthly_used: 0, reset_date: resetDate })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapUsage(created as UsageRow);
}

export async function incrementUsageLimit(usage: UsageLimit) {
  const supabase = getSupabaseClient();
  if (!supabase) return usage;

  const { data, error } = await supabase
    .from("usage_limits")
    .update({ monthly_used: usage.monthlyUsed + 1 })
    .eq("id", usage.id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapUsage(data as UsageRow);
}

export async function loadShopProfile(userId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from("shop_profiles").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapShop(data as ShopRow) : null;
}
