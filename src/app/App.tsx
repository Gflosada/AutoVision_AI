import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { Toaster } from "./components/ui/sonner";
import { useAuthStore } from "../features/auth/auth.store";
import { useGarageStore } from "../store/garage.store";
import { useUsageStore } from "../store/usage.store";
import { router } from "./routes";

export default function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const user = useAuthStore((state) => state.user);
  const loadGarage = useGarageStore((state) => state.loadForUser);
  const loadUsage = useUsageStore((state) => state.loadForUser);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (!user) return;
    void loadGarage(user.id);
    void loadUsage(user.id, user.subscriptionPlan);
  }, [loadGarage, loadUsage, user]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </>
  );
}
