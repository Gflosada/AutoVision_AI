import { Heart, Sparkles, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { mockGallery } from "../../data/mockGallery";
import { useProjectDraftStore } from "../../store/projectDraft.store";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function AIGallery() {
  const navigate = useNavigate();
  const updateDraft = useProjectDraftStore((state) => state.updateDraft);
  const [style, setStyle] = useState("all");
  const [finish, setFinish] = useState("all");
  const [type, setType] = useState("all");
  const [favorites, setFavorites] = useState<string[]>([]);

  const items = useMemo(
    () =>
      mockGallery.filter((item) => {
        const matchesStyle = style === "all" || item.style === style;
        const matchesFinish = finish === "all" || item.finish === finish;
        const matchesType = type === "all" || item.customizationTypes.includes(type as never);
        return matchesStyle && matchesFinish && matchesType;
      }),
    [style, finish, type],
  );

  const useStyle = (id: string) => {
    const item = mockGallery.find((galleryItem) => galleryItem.id === id);
    if (!item) return;
    updateDraft({
      customizationTypes: item.customizationTypes,
      style: item.style,
      finish: item.finish,
      prompt: `${item.title} inspired build for my vehicle.`,
    });
    toast.success("Style loaded into the build wizard.");
    navigate("/dashboard/new-build");
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <Sparkles className="w-10 h-10 text-primary mx-auto" />
          <h1 className="text-4xl">AI gallery</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Explore generated customization concepts and load a style into your own build.</p>
        </div>

        <div className="glass-panel rounded-2xl p-6 grid md:grid-cols-3 gap-3">
          <Filter label="Style" value={style} setValue={setStyle} values={["all", "luxury", "racing", "jdm", "exotic", "off-road", "aggressive", "oem-plus"]} />
          <Filter label="Finish" value={finish} setValue={setFinish} values={["all", "gloss", "matte", "satin", "metallic", "pearl", "carbon-fiber"]} />
          <Filter label="Type" value={type} setValue={setType} values={["all", "paint", "vinyl-wrap", "rims-wheels", "carbon-fiber", "body-kit"]} />
        </div>

        <section className="glass-panel rounded-2xl p-6 border border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-primary text-sm">Featured concept</span>
          </div>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <ImageWithFallback src={mockGallery[1].imageUrl} alt={mockGallery[1].title} className="w-full aspect-video object-cover rounded-xl" />
            <div>
              <h2 className="text-3xl mb-2">{mockGallery[1].title}</h2>
              <p className="text-muted-foreground mb-4">{mockGallery[1].vehicle}</p>
              <button onClick={() => useStyle(mockGallery[1].id)} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg">Use this style</button>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <article key={item.id} className="glass-panel rounded-xl overflow-hidden">
              <div className="relative">
                <ImageWithFallback src={item.imageUrl} alt={item.title} className="w-full aspect-video object-cover" />
                <button onClick={() => setFavorites((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} className="absolute top-3 right-3 p-2 glass-panel rounded-lg">
                  <Heart className={`w-5 h-5 ${favorites.includes(item.id) ? "fill-primary text-primary" : ""}`} />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <h3>{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.vehicle}</p>
                <div className="flex flex-wrap gap-2">
                  {[item.style, item.finish, ...item.customizationTypes.slice(0, 1)].map((tag) => (
                    <span key={tag} className="px-2 py-1 rounded bg-primary/15 text-primary text-xs">{tag.replace("-", " ")}</span>
                  ))}
                </div>
                <button onClick={() => useStyle(item.id)} className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg">Use this style</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function Filter({ label, value, setValue, values }: { label: string; value: string; setValue: (value: string) => void; values: string[] }) {
  return (
    <label className="space-y-2 block">
      <span className="text-sm text-muted-foreground">{label}</span>
      <select value={value} onChange={(event) => setValue(event.target.value)} className="app-select">
        {values.map((item) => <option key={item} value={item}>{item.replace("-", " ")}</option>)}
      </select>
    </label>
  );
}
