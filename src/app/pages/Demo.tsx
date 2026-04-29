import { useNavigate } from "react-router";
import { Sparkles } from "lucide-react";
import { mockGallery } from "../../data/mockGallery";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Demo() {
  const navigate = useNavigate();
  const featured = mockGallery[0];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto py-16 space-y-10">
        <div className="text-center space-y-4">
          <Sparkles className="w-10 h-10 text-primary mx-auto" />
          <h1 className="text-5xl">AutoVision AI demo</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore the mock AI vehicle customization flow. The production backend can later replace this local demo mode.
          </p>
          <button onClick={() => navigate("/dashboard/new-build")} className="px-8 py-4 bg-primary text-primary-foreground rounded-lg neon-glow">
            Try the build flow
          </button>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden">
          <ImageWithFallback src={featured.imageUrl} alt={featured.title} className="w-full aspect-video object-cover" />
          <div className="p-6">
            <h2 className="text-2xl">{featured.title}</h2>
            <p className="text-muted-foreground">{featured.vehicle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
