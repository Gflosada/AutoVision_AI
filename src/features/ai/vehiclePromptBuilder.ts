import type { CustomizationType } from "../../types/app";
import type { VehiclePromptInput } from "./ai.types";

const customizationTemplates: Record<CustomizationType, string> = {
  paint: "paint color change with realistic automotive paint behavior",
  "vinyl-wrap": "premium vinyl wrap with accurate panel seams and natural reflections",
  "racing-stripes": "clean racing stripes aligned to the vehicle body lines",
  "decals-livery": "professional racing livery and decal placement without fake text",
  "rims-wheels": "realistic wheel and rim replacement with correct alignment and scale",
  "window-tint": "window tint with realistic glass transparency and reflections",
  headlights: "headlight styling update while preserving factory geometry",
  taillights: "taillight styling update while preserving factory geometry",
  spoiler: "spoiler addition with believable mounting points and perspective",
  bumper: "bumper styling update that matches the vehicle proportions",
  hood: "hood treatment that preserves body gaps and reflections",
  "roof-wrap": "roof wrap with clean edge handling and realistic material finish",
  "carbon-fiber": "carbon fiber parts with woven texture, clearcoat, and natural highlights",
  "body-kit": "full body kit with realistic fitment, panel gaps, and stance",
  "lowered-suspension": "lowered suspension look with plausible tire clearance and stance",
};

const styleTemplates = {
  luxury: "Use restrained luxury tuning, premium materials, and showroom-level finish.",
  racing: "Use motorsport-inspired details, functional contrast, and track-ready composition.",
  jdm: "Use tasteful JDM styling cues, clean livery options, and performance stance.",
  exotic: "Use high-end exotic styling, sharp contrast, and premium aerodynamic details.",
  "off-road": "Use rugged off-road styling, protective parts, and durable materials.",
  futuristic: "Use modern futuristic accents while keeping the vehicle photorealistic.",
  minimal: "Use minimal OEM-like modifications with clean surfaces and subtle contrast.",
  aggressive: "Use aggressive street performance styling without distorting the vehicle.",
  "oem-plus": "Use OEM+ modifications that look factory-quality and realistic.",
};

export function buildVehicleCustomizationPrompt(input: VehiclePromptInput) {
  const vehicle = [input.vehicleYear, input.vehicleMake, input.vehicleModel, input.trim].filter(Boolean).join(" ");
  const modifications = input.customizationTypes.map((type) => customizationTemplates[type]).join("; ");
  const finish = input.finish ? `Use a ${input.finish.replace("-", " ")} finish.` : "";
  const color = input.desiredColor ? `Desired color direction: ${input.desiredColor}.` : "";
  const style = input.style ? styleTemplates[input.style] : "";
  const background =
    input.backgroundPreference === "keep-original"
      ? "Preserve the original background."
      : `Place the vehicle in a realistic ${input.backgroundPreference} background if the backend supports background changes.`;
  const angle =
    input.anglePreference === "keep-original"
      ? "Preserve the original camera angle."
      : `Use a ${input.anglePreference.replace("-", " ")} view only if the backend supports angle changes without identity loss.`;

  return [
    `Edit the uploaded ${vehicle || "vehicle"} image realistically.`,
    "Preserve the exact vehicle make/model identity, body shape, camera angle, perspective, lighting, reflections, shadows, background, proportions, wheel alignment, and all original geometry unless specifically requested.",
    `Apply only the requested modifications: ${modifications || "subtle premium customization"}.`,
    color,
    finish,
    style,
    background,
    angle,
    `Realism target: ${input.realismLevel}/10, high-detail commercial automotive photography quality.`,
    "Avoid distortion, fake text, extra cars, unrealistic wheels, melted panels, incorrect perspective, cartoon style, bad reflections, and changed vehicle identity.",
    input.userPrompt ? `User creative direction: ${input.userPrompt}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}
