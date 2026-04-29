import { buildVehicleCustomizationPrompt } from "./vehiclePromptBuilder";
import type { CreateGenerationInput, GenerationServiceResult } from "./ai.types";

export async function createMockGeneration(input: CreateGenerationInput): Promise<GenerationServiceResult> {
  await new Promise((resolve) => window.setTimeout(resolve, 500));

  const generation = {
    id: crypto.randomUUID(),
    projectId: input.projectId,
    userId: input.userId,
    prompt: input.userPrompt || "Premium AI vehicle customization concept.",
    aiPrompt: buildVehicleCustomizationPrompt(input),
    customizationTypes: input.customizationTypes,
    style: input.style || undefined,
    finish: input.finish || undefined,
    originalImageUrl: input.originalImageUrl,
    generatedImageUrl: input.originalImageUrl,
    status: "queued" as const,
    createdAt: new Date().toISOString(),
  };

  return {
    generation,
    message: "Mock AI generation queued. Configure a backend endpoint for real image generation.",
  };
}
