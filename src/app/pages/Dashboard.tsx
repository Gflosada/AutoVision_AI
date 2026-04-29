import { Car, CreditCard, Images, Plus, Sparkles, Store, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router";
import { PLAN_DEFINITIONS } from "../../features/billing/subscription.constants";
import { useAuthStore } from "../../features/auth/auth.store";
import { useGarageStore } from "../../store/garage.store";
import { useUsageStore } from "../../store/usage.store";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const usage = useUsageStore((state) => state.usage);
  const projects = useGarageStore((state) => state.projects);
  const generations = useGarageStore((state) => state.generations);
  const plan = PLAN_DEFINITIONS.find((item) => item.id === usage.plan) ?? PLAN_DEFINITIONS[0];
  const creditsLeft = Math.max(0, usage.monthlyLimit - usage.monthlyUsed);

  const recentProjects = projects.slice(0, 3);
  const recentGenerations = generations.filter((item) => item.status === "completed").slice(0, 3);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl mb-2">Welcome back, {user?.fullName?.split(" ")[0] ?? "driver"}</h1>
            <p className="text-muted-foreground">Design, manage, and share premium AI vehicle concepts.</p>
          </div>
          <button onClick={() => navigate("/dashboard/new-build")} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg neon-glow flex items-center gap-2 w-fit">
            <Plus className="w-5 h-5" />
            Create new build
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-5">
          <Metric label="Current plan" value={plan.name} icon={CreditCard} />
          <Metric label="Usage this month" value={`${usage.monthlyUsed}/${usage.monthlyLimit}`} icon={TrendingUp} />
          <Metric label="Credits left" value={String(creditsLeft)} icon={Sparkles} />
          <Metric label="Saved projects" value={String(projects.length)} icon={Car} />
        </div>

        <div className="grid lg:grid-cols-[1.4fr_0.8fr] gap-6">
          <section className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl">Recent projects</h2>
              <button onClick={() => navigate("/dashboard/garage")} className="text-primary text-sm">View garage</button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {recentProjects.map((project) => (
                <button key={project.id} onClick={() => navigate(`/dashboard/results/${generations.find((item) => item.projectId === project.id)?.id ?? generations[0]?.id}`)} className="text-left rounded-xl overflow-hidden glass-panel hover:border-primary/40">
                  <ImageWithFallback src={project.originalImageUrl} alt={project.title} className="w-full aspect-video object-cover" />
                  <div className="p-4">
                    <h3>{project.title}</h3>
                    <p className="text-sm text-muted-foreground">{project.vehicleYear} {project.vehicleMake} {project.vehicleModel}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="glass-panel rounded-2xl p-6 border border-primary/20">
              <Sparkles className="w-8 h-8 text-primary mb-4" />
              <h2 className="text-xl mb-2">Prompt tip</h2>
              <p className="text-sm text-muted-foreground">Name materials, finish, wheel color, and style. Ask the AI to preserve angle, lighting, and vehicle geometry.</p>
            </div>
            <button onClick={() => navigate("/dashboard/billing")} className="w-full text-left glass-panel rounded-2xl p-6 hover:border-primary/40">
              <CreditCard className="w-8 h-8 text-primary mb-4" />
              <h2 className="text-xl mb-2">Upgrade for HD exports</h2>
              <p className="text-sm text-muted-foreground">Pro unlocks 100 monthly generations, no watermark, and full history.</p>
            </button>
            <button onClick={() => navigate("/dashboard/shop-mode")} className="w-full text-left glass-panel rounded-2xl p-6 hover:border-primary/40">
              <Store className="w-8 h-8 text-primary mb-4" />
              <h2 className="text-xl mb-2">Shop mode</h2>
              <p className="text-sm text-muted-foreground">Prepare client concepts, quotes, and branded gallery workflows.</p>
            </button>
          </aside>
        </div>

        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl">Recent AI designs</h2>
            <button onClick={() => navigate("/dashboard/gallery")} className="text-primary text-sm">Browse gallery</button>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {recentGenerations.map((generation) => (
              <button key={generation.id} onClick={() => navigate(`/dashboard/results/${generation.id}`)} className="text-left glass-panel rounded-xl overflow-hidden hover:border-primary/40">
                <ImageWithFallback src={generation.generatedImageUrl ?? generation.originalImageUrl} alt={generation.prompt} className="w-full aspect-video object-cover" />
                <div className="p-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{generation.prompt}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Car }) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <Icon className="w-5 h-5 text-primary mb-4" />
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl chrome-text">{value}</p>
    </div>
  );
}
