import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FirebaseError } from "firebase/app";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { AuthShell } from "@/components/auth-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — Portfolio" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
      toast.success("Check your inbox for a reset link.");
    } catch (err) {
      if (err instanceof FirebaseError && err.code === "auth/user-not-found") {
        toast.error("No account with that email.");
      } else {
        toast.error("Could not send reset email.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Reset password"
      subtitle="We'll email you a secure reset link."
      footer={
        <Link to="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-xl border border-border bg-secondary/40 p-4 text-sm">
          A reset link was sent to <span className="font-medium">{email}</span>. It may take a minute to arrive.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <button type="submit" disabled={loading} className="btn-aurora w-full rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-60">
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

