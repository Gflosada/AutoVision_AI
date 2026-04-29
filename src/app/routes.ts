import { createElement } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { NewBuild } from "./pages/NewBuild";
import { AILoading } from "./pages/AILoading";
import { Results } from "./pages/Results";
import { MyGarage } from "./pages/MyGarage";
import { AIGallery } from "./pages/AIGallery";
import { Pricing } from "./pages/Pricing";
import { ShopMode } from "./pages/ShopMode";
import { AppLayout } from "./components/AppLayout";
import { LoginPage } from "../features/auth/LoginPage";
import { SignupPage } from "../features/auth/SignupPage";
import { AuthCallbackPage } from "../features/auth/AuthCallbackPage";
import { ProtectedRoute, PublicRoute } from "../features/auth/AuthGuard";
import { BillingPage } from "../features/billing/BillingPage";
import { Settings } from "./pages/Settings";
import { Demo } from "./pages/Demo";
import { ErrorPage } from "./pages/ErrorPage";
import { NotFound } from "./pages/NotFound";

function LegacyAppRedirect() {
  const path = window.location.pathname.replace(/^\/app/, "/dashboard");
  return createElement(Navigate, { to: `${path}${window.location.search}`, replace: true });
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
    ErrorBoundary: ErrorPage,
  },
  {
    path: "/pricing",
    Component: Pricing,
    ErrorBoundary: ErrorPage,
  },
  {
    path: "/demo",
    Component: Demo,
    ErrorBoundary: ErrorPage,
  },
  {
    Component: PublicRoute,
    ErrorBoundary: ErrorPage,
    children: [
      { path: "/login", Component: LoginPage },
      { path: "/signup", Component: SignupPage },
    ],
  },
  {
    path: "/auth/callback",
    Component: AuthCallbackPage,
    ErrorBoundary: ErrorPage,
  },
  {
    path: "/app/*",
    Component: LegacyAppRedirect,
  },
  {
    Component: ProtectedRoute,
    ErrorBoundary: ErrorPage,
    children: [
      {
        path: "/dashboard",
        Component: AppLayout,
        children: [
          { index: true, Component: Dashboard },
          { path: "new-build", Component: NewBuild },
          { path: "ai-loading", Component: AILoading },
          { path: "results/:generationId", Component: Results },
          { path: "garage", Component: MyGarage },
          { path: "gallery", Component: AIGallery },
          { path: "pricing", Component: Pricing },
          { path: "shop-mode", Component: ShopMode },
          { path: "settings", Component: Settings },
          { path: "billing", Component: BillingPage },
        ],
      },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
