import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { createGeneration } from "../../features/ai/aiGeneration.service";
import { buildVehicleCustomizationPrompt } from "../../features/ai/vehiclePromptBuilder";
import { useAuthStore } from "../../features/auth/auth.store";
import { uploadVehicleOriginal } from "../../lib/supabase/storage.service";
import { appConfig } from "../../lib/env";
import { useGarageStore } from "../../store/garage.store";
import { useProjectDraftStore } from "../../store/projectDraft.store";
import { useUsageStore } from "../../store/usage.store";
import type {
  AnglePreference,
  BackgroundPreference,
  CustomizationType,
  FinishType,
  VehicleProject,
  VehicleStyle,
} from "../../types/app";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const detailSchema = z.object({
  title: z.string().min(2, "Project title is required."),
  vehicleMake: z.string().min(1, "Vehicle make is required."),
  vehicleModel: z.string().min(1, "Vehicle model is required."),
  vehicleYear: z.string().regex(/^(19|20)\d{2}$/, "Enter a valid year."),
  trim: z.string().optional(),
  bodyType: z.string().optional(),
  currentColor: z.string().optional(),
  notes: z.string().optional(),
});

type DetailValues = z.infer<typeof detailSchema>;

const steps = [
  "Upload Vehicle",
  "Vehicle Details",
  "Choose Customizations",
  "Prompt Builder",
  "Review & Generate",
];

const customizationOptions: Array<{ id: CustomizationType; name: string; description: string }> = [
  { id: "paint", name: "Paint color change", description: "Change the factory paint with realistic reflections." },
  { id: "vinyl-wrap", name: "Vinyl wrap", description: "Preview premium full or partial wrap concepts." },
  { id: "racing-stripes", name: "Racing stripes", description: "Add clean, body-line-aware stripe layouts." },
  { id: "decals-livery", name: "Decals/livery", description: "Build motorsport graphics without fake text." },
  { id: "rims-wheels", name: "Rims/wheels", description: "Swap wheel style while preserving scale and fitment." },
  { id: "window-tint", name: "Window tint", description: "Apply glass tint with believable transparency." },
  { id: "headlights", name: "Headlights", description: "Preview lighting accents and lens treatments." },
  { id: "taillights", name: "Taillights", description: "Adjust rear lighting style." },
  { id: "spoiler", name: "Spoiler", description: "Add a realistic aero spoiler." },
  { id: "bumper", name: "Bumper", description: "Preview sport bumper styling." },
  { id: "hood", name: "Hood", description: "Change hood material or venting." },
  { id: "roof-wrap", name: "Roof wrap", description: "Apply contrast roof treatments." },
  { id: "carbon-fiber", name: "Carbon fiber parts", description: "Add woven carbon accents and panels." },
  { id: "body-kit", name: "Full body kit", description: "Preview broader body and aero changes." },
  { id: "lowered-suspension", name: "Lowered suspension look", description: "Visualize a lower stance and fitment." },
];

const promptChips = [
  "Matte black wrap with gloss black rims",
  "Satin emerald green with carbon fiber hood",
  "JDM racing livery with white wheels",
  "Luxury pearl white with chrome delete",
  "Aggressive street build with lowered look",
];

const finishOptions: FinishType[] = ["gloss", "matte", "satin", "metallic", "chrome", "pearl", "carbon-fiber"];
const styleOptions: VehicleStyle[] = ["luxury", "racing", "jdm", "exotic", "off-road", "futuristic", "minimal", "aggressive", "oem-plus"];
const backgroundOptions: BackgroundPreference[] = ["keep-original", "studio", "street", "garage", "neutral"];
const angleOptions: AnglePreference[] = ["keep-original", "front", "side", "rear", "three-quarter"];

function pretty(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function NewBuild() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { draft, setStep, updateDraft, toggleCustomization, resetDraft } = useProjectDraftStore();
  const addProject = useGarageStore((state) => state.addProject);
  const addGeneration = useGarageStore((state) => state.addGeneration);
  const setActiveGeneration = useGarageStore((state) => state.setActiveGeneration);
  const consumeGeneration = useUsageStore((state) => state.consumeGeneration);
  const canGenerate = useUsageStore((state) => state.canGenerate);
  const loadUsage = useUsageStore((state) => state.loadForUser);
  const usage = useUsageStore((state) => state.usage);

  const form = useForm<DetailValues>({
    resolver: zodResolver(detailSchema),
    values: {
      title: draft.title,
      vehicleMake: draft.vehicleMake,
      vehicleModel: draft.vehicleModel,
      vehicleYear: draft.vehicleYear,
      trim: draft.trim,
      bodyType: draft.bodyType,
      currentColor: draft.currentColor,
      notes: draft.notes,
    },
  });

  const aiPrompt = useMemo(
    () =>
      buildVehicleCustomizationPrompt({
        vehicleMake: draft.vehicleMake,
        vehicleModel: draft.vehicleModel,
        vehicleYear: draft.vehicleYear,
        trim: draft.trim,
        customizationTypes: draft.customizationTypes,
        userPrompt: draft.prompt,
        desiredColor: draft.desiredColor,
        finish: draft.finish,
        style: draft.style,
        backgroundPreference: draft.backgroundPreference,
        anglePreference: draft.anglePreference,
        realismLevel: draft.realismLevel,
      }),
    [draft],
  );

  const readImage = (file: File) => {
    setUploadError("");
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      setUploadError("Upload a JPG, PNG, or WebP image. HEIC/AVIF images are not supported by the AI backend.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setUploadError("Image must be 10MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImageFile(file);
      updateDraft({ imagePreviewUrl: reader.result as string, imageFileName: file.name });
    };
    reader.readAsDataURL(file);
  };

  const nextStep = async () => {
    if (draft.step === 1 && !draft.imagePreviewUrl) {
      setUploadError("Upload a vehicle image before continuing.");
      return;
    }
    if (draft.step === 2) {
      const valid = await form.trigger();
      if (!valid) return;
      updateDraft(form.getValues());
    }
    if (draft.step === 3 && draft.customizationTypes.length === 0) {
      toast.error("Choose at least one customization type.");
      return;
    }
    setStep(Math.min(5, draft.step + 1));
  };

  const handleGenerate = async () => {
    if (!user) {
      toast.error("Sign in before generating.");
      navigate("/login");
      return;
    }
    await loadUsage(user.id, user.subscriptionPlan);
    if (appConfig.hasSupabase && draft.imagePreviewUrl?.startsWith("data:") && !selectedImageFile) {
      toast.error("Re-upload the vehicle image so it can be saved to Supabase Storage.");
      setStep(1);
      return;
    }

    if (!canGenerate()) {
      toast.error("You have reached your monthly generation limit.");
      navigate("/dashboard/billing");
      return;
    }

    const serverWillConsumeUsage = appConfig.hasSupabase && appConfig.hasAiGenerationEndpoint;
    if (!serverWillConsumeUsage && !(await consumeGeneration())) {
      toast.error("You have reached your monthly generation limit.");
      navigate("/dashboard/billing");
      return;
    }

    setIsGenerating(true);
    try {
      const now = new Date().toISOString();
      const uploadedImageUrl = selectedImageFile
        ? await uploadVehicleOriginal({ userId: user.id, file: selectedImageFile })
        : null;
      const originalImageUrl = uploadedImageUrl ?? draft.imagePreviewUrl;
      const project: VehicleProject = {
        id: crypto.randomUUID(),
        userId: user.id,
        title: draft.title,
        vehicleMake: draft.vehicleMake,
        vehicleModel: draft.vehicleModel,
        vehicleYear: draft.vehicleYear,
        trim: draft.trim,
        bodyType: draft.bodyType,
        currentColor: draft.currentColor,
        originalImageUrl,
        notes: draft.notes,
        createdAt: now,
        updatedAt: now,
      };

      const savedProject = await addProject(project);
      const result = await createGeneration({
        projectId: savedProject.id,
        userId: user.id,
        title: draft.title,
        originalImageUrl,
        vehicleMake: draft.vehicleMake,
        vehicleModel: draft.vehicleModel,
        vehicleYear: draft.vehicleYear,
        trim: draft.trim,
        customizationTypes: draft.customizationTypes,
        userPrompt: draft.prompt,
        desiredColor: draft.desiredColor,
        finish: draft.finish,
        style: draft.style,
        backgroundPreference: draft.backgroundPreference,
        anglePreference: draft.anglePreference,
        realismLevel: draft.realismLevel,
      });
      const serverPersistedGeneration = appConfig.hasSupabase && appConfig.hasAiGenerationEndpoint;
      const savedGeneration = await addGeneration(
        { ...result.generation, projectId: savedProject.id, originalImageUrl },
        { persistRemote: !serverPersistedGeneration },
      );
      setActiveGeneration(savedGeneration.id);
      if (serverWillConsumeUsage) {
        void loadUsage(user.id, user.subscriptionPlan);
      }
      toast.success(result.message ?? "Generation queued.");
      navigate(`/dashboard/ai-loading?generationId=${savedGeneration.id}`);
    } catch (error) {
      if (user) {
        void loadUsage(user.id, user.subscriptionPlan);
      }
      toast.error(error instanceof Error ? error.message : "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartOver = () => {
    setSelectedImageFile(null);
    setUploadError("");
    resetDraft();
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl mb-2">New AI build</h1>
          <p className="text-muted-foreground">Upload a vehicle, define the build, and generate a realistic AI concept.</p>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {steps.map((label, index) => {
            const stepNumber = index + 1;
            const active = draft.step === stepNumber;
            const complete = draft.step > stepNumber;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${active || complete ? "bg-primary text-primary-foreground" : "glass-panel text-muted-foreground"}`}>
                  {complete ? <Check className="w-4 h-4" /> : stepNumber}
                </div>
                <span className="hidden lg:block text-xs text-muted-foreground">{label}</span>
              </div>
            );
          })}
        </div>

        <section className="glass-panel rounded-2xl p-6 md:p-8 min-h-[540px]">
          {draft.step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl mb-2">Upload vehicle</h2>
                <p className="text-muted-foreground">Use a clear photo with the full vehicle visible. JPG, PNG, or WebP up to 10MB.</p>
              </div>
              <div
                onDrop={(event) => {
                  event.preventDefault();
                  const file = event.dataTransfer.files[0];
                  if (file) readImage(file);
                }}
                onDragOver={(event) => event.preventDefault()}
                className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) readImage(file);
                  }}
                />
                {draft.imagePreviewUrl ? (
                  <div className="space-y-4">
                    <img src={draft.imagePreviewUrl} alt="Uploaded vehicle" className="max-h-[420px] mx-auto rounded-xl object-contain" />
                    <div className="flex justify-center gap-3">
                      <button onClick={() => fileInputRef.current?.click()} className="px-5 py-3 bg-primary text-primary-foreground rounded-lg">Replace image</button>
                      <button onClick={() => { setSelectedImageFile(null); updateDraft({ imagePreviewUrl: "", imageFileName: "" }); }} className="px-5 py-3 glass-panel rounded-lg flex items-center gap-2">
                        <X className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} className="mx-auto flex flex-col items-center gap-4">
                    <span className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-primary" />
                    </span>
                    <span className="text-lg">Drop your vehicle image here or browse</span>
                    <span className="text-sm text-muted-foreground">Side or 3/4 view photos usually work best.</span>
                  </button>
                )}
              </div>
              {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
            </div>
          )}

          {draft.step === 2 && (
            <form className="space-y-6" onChange={() => updateDraft(form.getValues())}>
              <div>
                <h2 className="text-2xl mb-2">Vehicle details</h2>
                <p className="text-muted-foreground">These details help the AI preserve the vehicle identity.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                {[
                  ["title", "Project title", "Satin green M4"],
                  ["vehicleMake", "Vehicle make", "BMW"],
                  ["vehicleModel", "Vehicle model", "M4"],
                  ["vehicleYear", "Year", "2024"],
                  ["trim", "Trim", "Competition"],
                  ["currentColor", "Current color", "Black"],
                ].map(([name, label, placeholder]) => (
                  <label key={name} className="block space-y-2">
                    <span className="text-sm">{label}</span>
                    <input className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary outline-none" placeholder={placeholder} {...form.register(name as keyof DetailValues)} />
                    {form.formState.errors[name as keyof DetailValues] && <span className="text-sm text-destructive">{form.formState.errors[name as keyof DetailValues]?.message}</span>}
                  </label>
                ))}
                <label className="block space-y-2">
                  <span className="text-sm">Body type</span>
                  <select className="app-select" {...form.register("bodyType")}>
                    <option value="">Select body type</option>
                    <option>Coupe</option>
                    <option>Sedan</option>
                    <option>SUV</option>
                    <option>Truck</option>
                    <option>Hatchback</option>
                    <option>Convertible</option>
                  </select>
                </label>
                <label className="block md:col-span-2 space-y-2">
                  <span className="text-sm">Notes</span>
                  <textarea rows={4} className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary outline-none resize-none" placeholder="Anything the AI or future shop should know." {...form.register("notes")} />
                </label>
              </div>
            </form>
          )}

          {draft.step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl mb-2">Choose customizations</h2>
                <p className="text-muted-foreground">Select every modification the AI should apply.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {customizationOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => toggleCustomization(option.id)}
                    className={`text-left p-5 rounded-xl transition-all ${draft.customizationTypes.includes(option.id) ? "border-2 border-primary bg-primary/10" : "glass-panel hover:border-primary/40"}`}
                  >
                    <ImagePlus className="w-5 h-5 text-primary mb-3" />
                    <h3>{option.name}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {draft.step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl mb-2">Prompt builder</h2>
                <p className="text-muted-foreground">Dial in style, finish, background, and realism.</p>
              </div>
              <label className="block space-y-2">
                <span className="text-sm">User prompt</span>
                <textarea value={draft.prompt} onChange={(event) => updateDraft({ prompt: event.target.value })} rows={4} className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary outline-none resize-none" placeholder="Describe the build..." />
              </label>
              <div className="flex flex-wrap gap-2">
                {promptChips.map((chip) => (
                  <button key={chip} onClick={() => updateDraft({ prompt: chip })} className="px-3 py-2 glass-panel rounded-lg text-sm hover:bg-muted/60">{chip}</button>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <label className="block space-y-2">
                  <span className="text-sm">Desired color</span>
                  <input value={draft.desiredColor} onChange={(event) => updateDraft({ desiredColor: event.target.value })} className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary outline-none" placeholder="Satin emerald green" />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm">Realism level: {draft.realismLevel}/10</span>
                  <input type="range" min={1} max={10} value={draft.realismLevel} onChange={(event) => updateDraft({ realismLevel: Number(event.target.value) })} className="w-full accent-cyan-400" />
                </label>
                <SelectField label="Finish" value={draft.finish} options={finishOptions} onChange={(value) => updateDraft({ finish: value as FinishType })} />
                <SelectField label="Style" value={draft.style} options={styleOptions} onChange={(value) => updateDraft({ style: value as VehicleStyle })} />
                <SelectField label="Background" value={draft.backgroundPreference} options={backgroundOptions} onChange={(value) => updateDraft({ backgroundPreference: value as BackgroundPreference })} />
                <SelectField label="Angle" value={draft.anglePreference} options={angleOptions} onChange={(value) => updateDraft({ anglePreference: value as AnglePreference })} />
              </div>
            </div>
          )}

          {draft.step === 5 && (
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
              <div className="space-y-5">
                <h2 className="text-2xl">Review & generate</h2>
                {draft.imagePreviewUrl && <img src={draft.imagePreviewUrl} alt="Vehicle preview" className="w-full max-h-[420px] object-contain rounded-2xl bg-black/30" />}
                <div className="glass-panel rounded-xl p-5">
                  <p className="text-sm text-muted-foreground mb-2">Internal AI prompt</p>
                  <p className="text-sm leading-6">{aiPrompt}</p>
                </div>
              </div>
              <aside className="space-y-5">
                <SummaryRow label="Project" value={draft.title} />
                <SummaryRow label="Vehicle" value={`${draft.vehicleYear} ${draft.vehicleMake} ${draft.vehicleModel} ${draft.trim}`.trim()} />
                <SummaryRow label="Customizations" value={draft.customizationTypes.map(pretty).join(", ")} />
                <SummaryRow label="Finish" value={draft.finish ? pretty(draft.finish) : "Not specified"} />
                <SummaryRow label="Style" value={draft.style ? pretty(draft.style) : "Not specified"} />
                <div className="glass-panel rounded-xl p-5 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Usage</p>
                  <p className="text-2xl text-primary">{Math.max(0, usage.monthlyLimit - usage.monthlyUsed)} generations left</p>
                </div>
              </aside>
            </div>
          )}
        </section>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => setStep(Math.max(1, draft.step - 1))} disabled={draft.step === 1 || isGenerating} className="px-5 py-3 glass-panel rounded-lg flex items-center justify-center gap-2 disabled:opacity-50">
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            <button onClick={handleStartOver} disabled={isGenerating} className="px-5 py-3 glass-panel rounded-lg flex items-center justify-center gap-2 disabled:opacity-50">
              <ImagePlus className="w-5 h-5" />
              New image
            </button>
          </div>
          {draft.step < 5 ? (
            <button onClick={nextStep} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg flex items-center gap-2">
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={handleGenerate} disabled={isGenerating} className="px-8 py-3 bg-primary text-primary-foreground rounded-lg neon-glow flex items-center gap-2 disabled:opacity-60">
              <Sparkles className="w-5 h-5" />
              {isGenerating ? "Queueing..." : "Generate AI Design"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="app-select">
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>{pretty(option)}</option>
        ))}
      </select>
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel rounded-xl p-5">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p>{value || "Not specified"}</p>
    </div>
  );
}
