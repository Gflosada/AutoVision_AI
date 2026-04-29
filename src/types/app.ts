import type { SubscriptionPlan } from "./subscription";

export type GenerationStatus = "draft" | "queued" | "processing" | "completed" | "failed" | "cancelled";

export type CustomizationType =
  | "paint"
  | "vinyl-wrap"
  | "racing-stripes"
  | "decals-livery"
  | "rims-wheels"
  | "window-tint"
  | "headlights"
  | "taillights"
  | "spoiler"
  | "bumper"
  | "hood"
  | "roof-wrap"
  | "carbon-fiber"
  | "body-kit"
  | "lowered-suspension";

export type FinishType = "gloss" | "matte" | "satin" | "metallic" | "chrome" | "pearl" | "carbon-fiber";

export type VehicleStyle =
  | "luxury"
  | "racing"
  | "jdm"
  | "exotic"
  | "off-road"
  | "futuristic"
  | "minimal"
  | "aggressive"
  | "oem-plus";

export type BackgroundPreference = "keep-original" | "studio" | "street" | "garage" | "neutral";

export type AnglePreference = "keep-original" | "front" | "side" | "rear" | "three-quarter";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  subscriptionPlan: SubscriptionPlan;
  stripeCustomerId?: string | null;
  createdAt: string;
}

export interface VehicleProject {
  id: string;
  userId: string;
  title: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  trim?: string;
  bodyType?: string;
  currentColor?: string;
  originalImageUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomizationGeneration {
  id: string;
  projectId: string;
  userId: string;
  prompt: string;
  aiPrompt: string;
  customizationTypes: CustomizationType[];
  style?: VehicleStyle;
  finish?: FinishType;
  generatedImageUrl?: string;
  originalImageUrl?: string;
  isSaved?: boolean;
  status: GenerationStatus;
  createdAt: string;
}

export interface UsageLimit {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  monthlyLimit: number;
  monthlyUsed: number;
  resetDate: string;
}

export interface ShopProfile {
  id: string;
  userId: string;
  businessName: string;
  logoUrl?: string | null;
  website?: string | null;
  contactEmail: string;
  phone?: string | null;
  location?: string | null;
  createdAt: string;
}

export interface ProjectDraft {
  step: number;
  imageFileName?: string;
  imagePreviewUrl?: string;
  title: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  trim: string;
  bodyType: string;
  currentColor: string;
  notes: string;
  customizationTypes: CustomizationType[];
  prompt: string;
  desiredColor: string;
  finish: FinishType | "";
  style: VehicleStyle | "";
  backgroundPreference: BackgroundPreference;
  anglePreference: AnglePreference;
  realismLevel: number;
}
