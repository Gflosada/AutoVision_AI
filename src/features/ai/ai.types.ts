import type {
  AnglePreference,
  BackgroundPreference,
  CustomizationGeneration,
  CustomizationType,
  FinishType,
  VehicleStyle,
} from "../../types/app";

export interface VehiclePromptInput {
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  trim?: string;
  customizationTypes: CustomizationType[];
  userPrompt: string;
  desiredColor?: string;
  finish?: FinishType | "";
  style?: VehicleStyle | "";
  backgroundPreference: BackgroundPreference;
  anglePreference: AnglePreference;
  realismLevel: number;
}

export interface CreateGenerationInput extends VehiclePromptInput {
  projectId: string;
  userId: string;
  title: string;
  originalImageUrl?: string;
}

export interface GenerationServiceResult {
  generation: CustomizationGeneration;
  message?: string;
}
