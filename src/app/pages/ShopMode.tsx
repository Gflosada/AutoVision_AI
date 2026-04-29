import { DollarSign, Plus, Share2, Store, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuthStore } from "../../features/auth/auth.store";
import { useGarageStore } from "../../store/garage.store";
import { useUsageStore } from "../../store/usage.store";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function ShopMode() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const usage = useUsageStore((state) => state.usage);
  const generations = useGarageStore((state) => state.generations);
  const projects = useGarageStore((state) => state.projects);
  const [clientName, setClientName] = useState("");
  const [requestedMods, setRequestedMods] = useState("");
  const isBusiness = usage.plan === "business" || user?.subscriptionPlan === "business";

  if (!isBusiness) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-8">
        <div className="max-w-4xl mx-auto glass-panel rounded-2xl p-10 text-center space-y-5">
          <Store className="w-12 h-12 text-primary mx-auto" />
          <h1 className="text-4xl">Shop mode is for Business plans</h1>
          <p className="text-muted-foreground">Create client projects, branded galleries, and quote summaries after upgrading.</p>
          <button onClick={() => navigate("/dashboard/billing")} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg">Upgrade to Business</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl mb-2">Shop mode</h1>
            <p className="text-muted-foreground">Prepare client concepts, quotes, and branded galleries.</p>
          </div>
          <button onClick={() => navigate("/dashboard/new-build")} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 w-fit">
            <Plus className="w-5 h-5" />
            New client build
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-5">
          <Metric icon={Users} label="Active clients" value="24" />
          <Metric icon={Store} label="Concepts" value={String(generations.length)} />
          <Metric icon={DollarSign} label="Avg quote" value="$3.4K" />
          <Metric icon={Share2} label="Share rate" value="68%" />
        </div>

        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-6">
          <section className="glass-panel rounded-2xl p-6 space-y-5">
            <h2 className="text-2xl">Create client project</h2>
            <label className="block space-y-2">
              <span className="text-sm">Client name</span>
              <input value={clientName} onChange={(event) => setClientName(event.target.value)} className="w-full px-4 py-3 bg-input-background rounded-lg border border-border" placeholder="Alex Rivera" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm">Requested modifications</span>
              <textarea value={requestedMods} onChange={(event) => setRequestedMods(event.target.value)} rows={5} className="w-full px-4 py-3 bg-input-background rounded-lg border border-border resize-none" placeholder="Matte wrap, wheel color change, window tint..." />
            </label>
            <div className="glass-panel rounded-xl p-4">
              <p className="text-sm text-muted-foreground">Quote summary placeholder</p>
              <p className="text-2xl text-primary">$2,500 - $4,800</p>
            </div>
            <button onClick={() => toast.success("Client project draft saved in development mode.")} className="w-full px-5 py-3 bg-primary text-primary-foreground rounded-lg">Save client draft</button>
          </section>

          <section className="glass-panel rounded-2xl p-6">
            <h2 className="text-2xl mb-5">Generated concepts</h2>
            <div className="space-y-4">
              {generations.slice(0, 4).map((generation) => {
                const project = projects.find((item) => item.id === generation.projectId);
                return (
                  <button key={generation.id} onClick={() => navigate(`/dashboard/results/${generation.id}`)} className="w-full text-left glass-panel rounded-xl p-4 flex gap-4 hover:border-primary/40">
                    <ImageWithFallback src={generation.generatedImageUrl ?? generation.originalImageUrl} alt={generation.prompt} className="w-32 h-20 rounded-lg object-cover" />
                    <div>
                      <h3>{project?.title ?? "Client concept"}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{generation.prompt}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Store; label: string; value: string }) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <Icon className="w-5 h-5 text-primary mb-4" />
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl chrome-text">{value}</p>
    </div>
  );
}
