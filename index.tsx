import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/auth-context";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass rounded-xl px-6 py-3 text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }
  return <Navigate to={user ? "/dashboard" : "/login"} />;
}

