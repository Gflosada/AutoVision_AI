import type { CustomizationGeneration } from "../types/app";

export const mockGenerations: CustomizationGeneration[] = [
  {
    id: "generation_bmw_emerald",
    projectId: "project_bmw_m4",
    userId: "mock-user",
    prompt: "Satin emerald green with carbon fiber hood and gloss black rims.",
    aiPrompt: "Edit the uploaded vehicle image realistically. Preserve the exact vehicle identity, body shape, camera angle, lighting, reflections, shadows, background, proportions, wheel alignment, and original geometry unless specifically requested. Apply satin emerald green paint, carbon fiber hood, and gloss black rims.",
    customizationTypes: ["paint", "carbon-fiber", "rims-wheels"],
    style: "luxury",
    finish: "satin",
    originalImageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
    generatedImageUrl: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1200&q=80",
    status: "completed",
    createdAt: "2026-04-27T16:30:00.000Z",
  },
  {
    id: "generation_911_chrome_delete",
    projectId: "project_porsche_911",
    userId: "mock-user",
    prompt: "Luxury pearl white with chrome delete and satin black wheels.",
    aiPrompt: "Realistic luxury chrome delete concept preserving the original Porsche shape and lighting.",
    customizationTypes: ["paint", "rims-wheels", "window-tint"],
    style: "oem-plus",
    finish: "pearl",
    originalImageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    generatedImageUrl: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80",
    status: "completed",
    createdAt: "2026-04-22T12:00:00.000Z",
  },
];
