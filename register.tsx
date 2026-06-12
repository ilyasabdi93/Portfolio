import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FirebaseError } from "firebase/app";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { AuthShell } from "@/components/auth-shell";
import { GoogleButton } from "@/components/google-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Portfolio" }] }),
  component: RegisterPage,
});

function describe(e: unknown): string {
  if (e instanceof FirebaseError) {
    if (e.code === "auth/email-already-in-use") return "An account with this email exists.";
    if (e.code === "auth/weak-password") return "Password should be at least 6 characters.";
    if (e.code === "auth/invalid-email") return "Invalid email address.";
    return e.message;
  }
  return "Something went wrong.";
}

function RegisterPage() {
  const { signUpEmail, signInGoogle } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await signUpEmail(name.trim(), email.trim(), password);
      toast.success("Account created");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(describe(err));
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    try {
      await signInGoogle();
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(describe(err));
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start building your portfolio in seconds."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" maxLength={80} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
        </div>
        <button type="submit" disabled={loading} className="btn-aurora w-full rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-60">
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        OR
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton onClick={onGoogle} />
    </AuthShell>
  );
}

