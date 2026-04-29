import { Outlet, NavLink } from "react-router";
import { LayoutDashboard, Plus, Car, Images, CreditCard, Store, Settings, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "../../features/auth/auth.store";
import { useUsageStore } from "../../store/usage.store";

export function AppLayout() {
  const { user, logout, isMockAuth } = useAuthStore();
  const usage = useUsageStore((state) => state.usage);
  const creditsLeft = Math.max(0, usage.monthlyLimit - usage.monthlyUsed);
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Plus, label: "New Build", path: "/dashboard/new-build" },
    { icon: Car, label: "My Garage", path: "/dashboard/garage" },
    { icon: Images, label: "AI Gallery", path: "/dashboard/gallery" },
    { icon: CreditCard, label: "Billing", path: "/dashboard/billing" },
    { icon: Store, label: "Shop Mode", path: "/dashboard/shop-mode" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  ];

  const mobileNavItems = [
    { icon: LayoutDashboard, label: "Home", path: "/dashboard" },
    { icon: Car, label: "Garage", path: "/dashboard/garage" },
    { icon: Plus, label: "New", path: "/dashboard/new-build" },
    { icon: Images, label: "Gallery", path: "/dashboard/gallery" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out.");
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="hidden md:flex w-64 bg-sidebar border-r border-sidebar-border flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="chrome-text tracking-tight">AutoVision AI</h1>
          <p className="text-xs text-muted-foreground mt-1">AI Vehicle Design Studio</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-sidebar-accent text-primary neon-glow"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-3">
          <div className="flex items-center gap-3 px-4 py-3 glass-panel rounded-lg">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-glow flex items-center justify-center">
              <span>{user?.fullName?.charAt(0) ?? "U"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{user?.fullName ?? "User Account"}</p>
              <p className="text-xs text-muted-foreground">{creditsLeft} generations left</p>
            </div>
          </div>
          {isMockAuth && <p className="text-xs text-muted-foreground px-2">Mock mode active</p>}
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border z-50">
        <div className="flex items-center justify-around px-2 py-3">
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[64px] ${
                  isActive
                    ? "text-primary"
                    : "text-sidebar-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive ? "bg-primary/20" : ""
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
