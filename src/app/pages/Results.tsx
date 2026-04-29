import { ChevronLeft, ChevronRight, Download, Edit2, Heart, ImagePlus, RotateCcw, Share2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useGarageStore } from "../../store/garage.store";
import { useProjectDraftStore } from "../../store/projectDraft.store";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Results() {
  const navigate = useNavigate();
  const { generationId } = useParams();
  const generation = useGarageStore((state) => (generationId ? state.getGenerationById(generationId) : undefined));
  const project = useGarageStore((state) => (generation ? state.getProjectById(generation.projectId) : undefined));
  const saveGeneration = useGarageStore((state) => state.saveGeneration);
  const toggleFavorite = useGarageStore((state) => state.toggleFavorite);
  const favoriteIds = useGarageStore((state) => state.favoriteGenerationIds);
  const savedGenerationIds = useGarageStore((state) => state.savedGenerationIds);
  const updateDraft = useProjectDraftStore((state) => state.updateDraft);
  const setStep = useProjectDraftStore((state) => state.setStep);
  const resetDraft = useProjectDraftStore((state) => state.resetDraft);
  const [sliderPosition, setSliderPosition] = useState(50);

  if (!generation || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="glass-panel rounded-2xl p-8 max-w-lg text-center space-y-4">
          <h1 className="text-3xl">Result not found</h1>
          <p className="text-muted-foreground">This generation does not exist in the current mock store.</p>
          <button onClick={() => navigate("/dashboard/new-build")} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg">
            Create a new build
          </button>
        </div>
      </div>
    );
  }

  const original = generation.originalImageUrl ?? project.originalImageUrl ?? "";
  const generated = generation.generatedImageUrl ?? original;
  const isFavorite = favoriteIds.includes(generation.id);
  const isSaved = savedGenerationIds.includes(generation.id);

  const handleEditPrompt = () => {
    updateDraft({
      imagePreviewUrl: original,
      title: project.title,
      vehicleMake: project.vehicleMake,
      vehicleModel: project.vehicleModel,
      vehicleYear: project.vehicleYear,
      trim: project.trim ?? "",
      bodyType: project.bodyType ?? "",
      currentColor: project.currentColor ?? "",
      notes: project.notes ?? "",
      customizationTypes: generation.customizationTypes,
      prompt: generation.prompt,
      finish: generation.finish ?? "",
      style: generation.style ?? "",
    });
    setStep(4);
    navigate("/dashboard/new-build");
  };

  const handleNewImage = () => {
    resetDraft();
    navigate("/dashboard/new-build");
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5" />
            Back to dashboard
          </button>
          <div className="flex gap-3">
            <button onClick={() => { toggleFavorite(generation.id); toast.success(isFavorite ? "Removed favorite." : "Added favorite."); }} className="p-3 glass-panel rounded-lg">
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-primary text-primary" : ""}`} />
            </button>
            <button onClick={() => { void navigator.clipboard?.writeText(window.location.href); toast.success("Share link copied."); }} className="p-3 glass-panel rounded-lg">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden">
          <div
            className="relative aspect-video select-none cursor-ew-resize bg-black"
            onMouseMove={(event) => {
              if (event.buttons !== 1) return;
              const rect = event.currentTarget.getBoundingClientRect();
              setSliderPosition(Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)));
            }}
          >
            <ImageWithFallback src={generated} alt="Generated vehicle design" className="absolute inset-0 w-full h-full object-cover" />
            {generation.generatedImageUrl === generation.originalImageUrl && (
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/25 via-transparent to-purple-glow/20 pointer-events-none" />
            )}
            <div className="absolute top-4 right-4 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm">After AI</div>
            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
              <ImageWithFallback src={original} alt="Original vehicle" className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 px-4 py-2 glass-panel rounded-full text-sm">Before</div>
            </div>
            <div className="absolute top-0 bottom-0 w-1 bg-primary" style={{ left: `${sliderPosition}%` }}>
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-primary text-primary-foreground neon-glow flex items-center justify-center">
                <ChevronLeft className="w-4 h-4" />
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <section className="space-y-6">
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl mb-2">{project.title}</h1>
                  <p className="text-muted-foreground">{project.vehicleYear} {project.vehicleMake} {project.vehicleModel} {project.trim}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">{generation.status}</span>
              </div>
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <Info label="Style" value={generation.style?.replace("-", " ") ?? "Not specified"} />
                <Info label="Finish" value={generation.finish?.replace("-", " ") ?? "Not specified"} />
                <Info label="Generated" value={new Date(generation.createdAt).toLocaleString()} />
                <Info label="Customizations" value={generation.customizationTypes.map((item) => item.replace("-", " ")).join(", ")} />
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6">
              <h2 className="text-xl mb-3">Prompt</h2>
              <p className="text-muted-foreground mb-4">{generation.prompt}</p>
              <p className="text-sm leading-6">{generation.aiPrompt}</p>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-3">
              <a href={generated} download className="px-5 py-4 bg-primary text-primary-foreground rounded-lg flex items-center justify-center gap-2">
                <Download className="w-5 h-5" /> Download
              </a>
              <button
                onClick={() => {
                  void saveGeneration(generation.id)
                    .then(() => toast.success(isSaved ? "Already saved to garage." : "Saved to garage."))
                    .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Unable to save to garage."));
                }}
                className={`px-5 py-4 glass-panel rounded-lg flex items-center justify-center gap-2 transition-colors ${isSaved ? "text-red-500 border-red-500/40" : "hover:text-red-500"}`}
              >
                <Heart className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} /> {isSaved ? "Saved" : "Save"}
              </button>
              <button onClick={handleNewImage} className="px-5 py-4 glass-panel rounded-lg flex items-center justify-center gap-2">
                <ImagePlus className="w-5 h-5" /> New image
              </button>
              <button onClick={() => navigate("/dashboard/new-build")} className="px-5 py-4 glass-panel rounded-lg flex items-center justify-center gap-2">
                <RotateCcw className="w-5 h-5" /> Regenerate
              </button>
              <button onClick={handleEditPrompt} className="px-5 py-4 glass-panel rounded-lg flex items-center justify-center gap-2">
                <Edit2 className="w-5 h-5" /> Edit
              </button>
            </div>
          </section>

          <aside className="glass-panel rounded-2xl p-6 h-fit space-y-4">
            <h2 className="text-xl">Project details</h2>
            <Info label="Current color" value={project.currentColor ?? "Not specified"} />
            <Info label="Body type" value={project.bodyType ?? "Not specified"} />
            <Info label="Notes" value={project.notes ?? "No notes"} />
            <button onClick={() => navigate("/dashboard/garage")} className="w-full px-5 py-3 bg-primary text-primary-foreground rounded-lg">
              Open garage
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="capitalize">{value}</p>
    </div>
  );
}
