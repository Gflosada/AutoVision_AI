import { Clock, Heart, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useGarageStore } from "../../store/garage.store";
import type { CustomizationGeneration, VehicleProject } from "../../types/app";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

type GarageRow = {
  generation: CustomizationGeneration & { generatedImageUrl: string };
  project: VehicleProject;
};

export function MyGarage() {
  const navigate = useNavigate();
  const projects = useGarageStore((state) => state.projects);
  const generations = useGarageStore((state) => state.generations);
  const savedGenerationIds = useGarageStore((state) => state.savedGenerationIds);
  const toggleSavedGeneration = useGarageStore((state) => state.toggleSavedGeneration);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  const rows = useMemo(() => {
    return generations
      .map((generation) => ({
        generation,
        project: projects.find((project) => project.id === generation.projectId),
      }))
      .filter((row): row is GarageRow => Boolean(row.project && row.generation.generatedImageUrl))
      .filter(({ generation }) => savedGenerationIds.includes(generation.id))
      .filter(({ project, generation }) => {
        const text = `${project.title} ${project.vehicleMake} ${project.vehicleModel} ${generation.prompt}`.toLowerCase();
        const matchesQuery = text.includes(query.toLowerCase());
        const matchesFilter = filter === "all" || generation.customizationTypes.includes(filter as never);
        return matchesQuery && matchesFilter;
      })
      .sort((a, b) => sort === "newest"
        ? Date.parse(b.generation.createdAt) - Date.parse(a.generation.createdAt)
        : Date.parse(a.generation.createdAt) - Date.parse(b.generation.createdAt));
  }, [projects, generations, savedGenerationIds, query, filter, sort]);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl mb-2">My garage</h1>
            <p className="text-muted-foreground">Saved AI-generated vehicle design concepts.</p>
          </div>
          <button onClick={() => navigate("/dashboard/new-build")} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 w-fit">
            <Plus className="w-5 h-5" />
            New build
          </button>
        </div>

        <div className="grid md:grid-cols-[1fr_220px_180px] gap-3">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search make, model, or title" className="w-full pl-12 pr-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary outline-none" />
          </label>
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="app-select">
            <option value="all">All customization types</option>
            <option value="paint">Paint</option>
            <option value="vinyl-wrap">Vinyl wrap</option>
            <option value="rims-wheels">Rims/wheels</option>
            <option value="carbon-fiber">Carbon fiber</option>
            <option value="body-kit">Body kit</option>
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="app-select">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {rows.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center">
            <CarEmpty />
            <h2 className="text-2xl mb-2">No AI designs found</h2>
            <p className="text-muted-foreground mb-6">Adjust filters or create a new AI build.</p>
            <button onClick={() => navigate("/dashboard/new-build")} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg">Create build</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rows.map(({ project, generation }) => (
              <GarageCard
                key={generation.id}
                project={project}
                generation={generation}
                isSaved={savedGenerationIds.includes(generation.id)}
                onOpen={() => navigate(`/dashboard/results/${generation.id}`)}
                onToggleSaved={() => {
                  const wasSaved = savedGenerationIds.includes(generation.id);
                  void toggleSavedGeneration(generation.id)
                    .then(() => toast.success(wasSaved ? "Removed from saved designs." : "Saved design."))
                    .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Unable to update saved design."));
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GarageCard({
  project,
  generation,
  isSaved,
  onOpen,
  onToggleSaved,
}: {
  project: VehicleProject;
  generation: CustomizationGeneration & { generatedImageUrl: string };
  isSaved: boolean;
  onOpen: () => void;
  onToggleSaved: () => void;
}) {
  return (
    <article className="glass-panel rounded-xl overflow-hidden hover:border-primary/40">
      <button onClick={onOpen} className="w-full text-left">
        <div className="relative">
          <ImageWithFallback src={generation.generatedImageUrl} alt={`${project.title} AI design`} className="w-full aspect-video object-cover" />
          <span className="absolute top-3 left-3 px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs">AI result</span>
          <span className="absolute bottom-3 right-3 px-3 py-1 glass-panel rounded-full text-xs">View before / after</span>
        </div>
      </button>
      <div className="p-4 space-y-3">
        <div className="flex justify-between gap-3">
          <div>
            <h3>{project.title}</h3>
            <p className="text-sm text-muted-foreground">{project.vehicleYear} {project.vehicleMake} {project.vehicleModel}</p>
          </div>
          <button
            onClick={onToggleSaved}
            aria-label={isSaved ? "Remove saved design" : "Save design"}
            title={isSaved ? "Saved" : "Save"}
            className={`flex items-center gap-1.5 text-xs transition-colors ${isSaved ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
          >
            <Heart className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
            {isSaved && <span>Saved</span>}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {generation.customizationTypes.slice(0, 3).map((type) => (
            <span key={type} className="px-2 py-1 bg-primary/15 text-primary rounded text-xs">{type.replace("-", " ")}</span>
          ))}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{generation.prompt}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" /> Generated {new Date(generation.createdAt).toLocaleDateString()}
        </p>
      </div>
    </article>
  );
}

function CarEmpty() {
  return <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4" />;
}
