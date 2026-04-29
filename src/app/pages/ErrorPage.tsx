import { isRouteErrorResponse, Link, useRouteError } from "react-router";

export function ErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Something went wrong.";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="glass-panel rounded-2xl p-8 max-w-lg text-center space-y-4">
        <h1 className="text-3xl">Studio error</h1>
        <p className="text-muted-foreground">{message}</p>
        <Link to="/dashboard" className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-lg">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
