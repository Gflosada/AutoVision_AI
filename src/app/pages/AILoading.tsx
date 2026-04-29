import { Check, ChevronLeft, Sparkles, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { useGarageStore } from "../../store/garage.store";

const progressSteps = [
  "Analyzing vehicle image",
  "Preserving vehicle structure",
  "Applying customization",
  "Enhancing realism",
  "Preparing final render",
];

export function AILoading() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryGenerationId = searchParams.get("generationId");
  const activeGenerationId = useGarageStore((state) => state.activeGenerationId);
  const generationId = queryGenerationId ?? activeGenerationId;
  const generation = useGarageStore((state) => (generationId ? state.getGenerationById(generationId) : undefined));
  const project = useGarageStore((state) => (generation ? state.getProjectById(generation.projectId) : undefined));
  const updateGeneration = useGarageStore((state) => state.updateGeneration);
  const [progress, setProgress] = useState(0);
  const [hasError, setHasError] = useState(false);

  const currentStep = useMemo(() => Math.min(progressSteps.length - 1, Math.floor((progress / 100) * progressSteps.length)), [progress]);

  useEffect(() => {
    if (!generationId || !generation) {
      setHasError(true);
      return;
    }

    void updateGeneration(generationId, { status: "processing" }, { persistRemote: false });
    const interval = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 100) {
          window.clearInterval(interval);
          void updateGeneration(generationId, {
            status: "completed",
            generatedImageUrl: generation.generatedImageUrl ?? generation.originalImageUrl,
          }, { persistRemote: false });
          window.setTimeout(() => navigate(`/dashboard/results/${generationId}`), 500);
          return 100;
        }
        return value + 4;
      });
    }, 160);

    return () => window.clearInterval(interval);
  }, [generation, generationId, navigate, updateGeneration]);

  const cancel = () => {
    if (generationId) void updateGeneration(generationId, { status: "cancelled" }, { persistRemote: false });
    toast.info("Generation cancelled.");
    navigate("/dashboard/new-build");
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="glass-panel rounded-2xl p-8 max-w-lg text-center space-y-4">
          <XCircle className="w-12 h-12 text-destructive mx-auto" />
          <h1 className="text-3xl">Generation not found</h1>
          <p className="text-muted-foreground">Return to the wizard and queue a new AI design.</p>
          <button onClick={() => navigate("/dashboard/new-build")} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg">
            Back to wizard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 md:p-8">
      <div className="max-w-3xl w-full space-y-8">
        <button onClick={cancel} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" />
          Cancel and return to edit
        </button>

        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-primary/20 mx-auto flex items-center justify-center neon-glow">
            <Sparkles className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl">Generating {project?.title ?? "your build"}</h1>
          <p className="text-muted-foreground text-lg">Creating a photorealistic customization preview in mock mode or through your configured backend.</p>
        </div>

        <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimated status</span>
            <span className="text-primary">{progress}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-purple-glow transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="space-y-4">
            {progressSteps.map((step, index) => (
              <div key={step} className={`flex items-center gap-4 ${index <= currentStep ? "opacity-100" : "opacity-35"}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${index < currentStep ? "bg-primary text-primary-foreground" : index === currentStep ? "bg-primary/50" : "bg-muted"}`}>
                  {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
