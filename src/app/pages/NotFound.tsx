import { Link } from "react-router";

export function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="glass-panel rounded-2xl p-8 max-w-lg text-center space-y-4">
        <p className="text-primary text-sm">404</p>
        <h1 className="text-3xl">Page not found</h1>
        <p className="text-muted-foreground">The requested AutoVision page does not exist.</p>
        <Link to="/dashboard" className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-lg">
          Open dashboard
        </Link>
      </div>
    </div>
  );
}
