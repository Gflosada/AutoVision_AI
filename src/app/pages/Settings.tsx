import { LogOut, Save, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuthStore } from "../../features/auth/auth.store";

export function Settings() {
  const navigate = useNavigate();
  const { user, updateProfile, logout, isMockAuth } = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email] = useState(user?.email ?? "");
  const [defaultStyle, setDefaultStyle] = useState("oem-plus");
  const [notify, setNotify] = useState(true);

  const save = () => {
    updateProfile({ fullName });
    toast.success("Settings saved.");
  };

  const signOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage profile, vehicle defaults, and notifications.</p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <aside className="glass-panel rounded-2xl p-6 text-center h-fit">
            <div className="w-24 h-24 rounded-full bg-primary/15 mx-auto flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl">{user?.fullName ?? "AutoVision User"}</h2>
            <p className="text-sm text-muted-foreground">{user?.subscriptionPlan ?? "free"} plan</p>
            {isMockAuth && <p className="text-xs text-primary mt-4">Mock auth mode</p>}
          </aside>

          <section className="glass-panel rounded-2xl p-6 space-y-6">
            <label className="block space-y-2">
              <span className="text-sm">Full name</span>
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full px-4 py-3 bg-input-background rounded-lg border border-border" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm">Email</span>
              <input value={email} disabled className="w-full px-4 py-3 bg-input-background rounded-lg border border-border opacity-70" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm">Default vehicle style</span>
              <select value={defaultStyle} onChange={(event) => setDefaultStyle(event.target.value)} className="app-select">
                <option value="oem-plus">OEM+</option>
                <option value="luxury">Luxury</option>
                <option value="racing">Racing</option>
                <option value="jdm">JDM</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </label>
            <label className="flex items-center justify-between glass-panel rounded-xl p-4">
              <span>
                <span className="block">Generation notifications</span>
                <span className="text-sm text-muted-foreground">Notify me when renders finish.</span>
              </span>
              <input type="checkbox" checked={notify} onChange={(event) => setNotify(event.target.checked)} className="w-5 h-5 accent-cyan-400" />
            </label>
            <div className="flex flex-wrap gap-3">
              <button onClick={save} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg flex items-center gap-2">
                <Save className="w-5 h-5" />
                Save settings
              </button>
              <button onClick={signOut} className="px-6 py-3 glass-panel rounded-lg flex items-center gap-2">
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
