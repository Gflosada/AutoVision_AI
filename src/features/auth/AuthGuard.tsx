import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "./auth.store";

export function ProtectedRoute() {
  const location = useLocation();
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Loading your studio...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function PublicRoute() {
  const { user } = useAuthStore();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
