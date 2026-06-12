import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowUpRight, Github, LogOut, Mail, Plus, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Portfolio" }] }),
  component: Dashboard,
});

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  url?: string;
}

const seedProjects: Project[] = [
  {
    id: "1",
    title: "Nebula Analytics",
    description: "Real-time analytics dashboard with streaming charts and natural-language queries.",
    tags: ["React", "D3", "WebSockets"],
    url: "#",
  },
  {
    id: "2",
    title: "Halo Commerce",
    description: "Headless commerce storefront with sub-second navigation and edge personalization.",
    tags: ["Next.js", "Edge", "Stripe"],
    url: "#",
  },
  {
    id: "3",
    title: "Lumen Notes",
    description: "AI note-taking app with semantic search and end-to-end encryption.",
    tags: ["TypeScript", "Vector DB", "AI"],
    url: "#",
  },
];

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(80),
  email: z.string().trim().email("Invalid email").max(200),
  message: z.string().trim().min(10, "Message too short").max(1000),
});

function Dashboard() {
  const { user, profile, logout, updateProfileData } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const [newProject, setNewProject] = useState({ title: "", description: "", tags: "" });
  const [savingBio, setSavingBio] = useState(false);
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [title, setTitle] = useState(profile?.title ?? "");

  const initials = useMemo(() => {
    const n = profile?.displayName ?? user?.displayName ?? user?.email ?? "U";
    return n
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [profile, user]);

  async function handleLogout() {
    await logout();
    toast.success("Signed out");
    navigate({ to: "/login" });
  }

  function addProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newProject.title.trim()) return;
    setProjects((p) => [
      {
        id: crypto.randomUUID(),
        title: newProject.title.trim(),
        description: newProject.description.trim(),
        tags: newProject.tags.split(",").map((t) => t.trim()).filter(Boolean),
      },
      ...p,
    ]);
    setNewProject({ title: "", description: "", tags: "" });
    toast.success("Project added");
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingBio(true);
    try {
      await updateProfileData({ bio, title });
      toast.success("Profile updated");
    } catch {
      toast.error("Could not save profile");
    } finally {
      setSavingBio(false);
    }
  }

  function submitContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const result = contactSchema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      message: fd.get("message"),
    });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    toast.success("Message sent — thanks for reaching out!");
    e.currentTarget.reset();
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 px-4 py-3 sm:px-6">
        <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-2.5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="btn-aurora flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold">P</div>
            <span className="font-display text-base font-semibold">Portfolio</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="glass inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm transition hover:scale-[1.02]"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 pb-16 pt-4 sm:px-6">
        {/* Hero / Profile */}
        <section className="glass rounded-3xl p-6 sm:p-10">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                alt=""
                className="h-20 w-20 rounded-2xl border border-border object-cover"
              />
            ) : (
              <div className="btn-aurora flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold">
                {initials}
              </div>
            )}
            <div className="flex-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Welcome back</p>
              <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
                <span className="text-gradient">
                  {profile?.displayName ?? user?.displayName ?? user?.email?.split("@")[0]}
                </span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={saveProfile} className="mt-7 grid gap-4 sm:grid-cols-[1fr_2fr]">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Product Designer"
                maxLength={60}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="One-line about you"
                maxLength={140}
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={savingBio}
                className="btn-aurora inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-60"
              >
                <UserIcon className="h-4 w-4" />
                {savingBio ? "Saving…" : "Save profile"}
              </button>
            </div>
          </form>
        </section>

        {/* Projects */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold">Projects</h2>
              <p className="text-sm text-muted-foreground">A selection of recent work.</p>
            </div>
          </div>

          <form onSubmit={addProject} className="glass mb-5 grid gap-3 rounded-2xl p-4 sm:grid-cols-[1fr_1.5fr_1fr_auto]">
            <Input
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              placeholder="Project title"
              maxLength={60}
            />
            <Input
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="Short description"
              maxLength={200}
            />
            <Input
              value={newProject.tags}
              onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
              placeholder="Tags, comma separated"
              maxLength={120}
            />
            <button type="submit" className="btn-aurora inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium">
              <Plus className="h-4 w-4" /> Add
            </button>
          </form>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <article key={p.id} className="glass group flex flex-col rounded-2xl p-5 transition hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                  {p.url ? (
                    <a href={p.url} className="text-muted-foreground transition group-hover:text-primary" aria-label="Open project">
                      <ArrowUpRight className="h-5 w-5" />
                    </a>
                  ) : null}
                </div>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.description}</p>
                {p.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <span key={t} className="rounded-full border border-border bg-secondary/60 px-2.5 py-0.5 text-xs text-secondary-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="glass rounded-3xl p-6 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl font-semibold">
                Let's <span className="text-gradient">work together</span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Have a project in mind? Send a message and I'll get back to you.
              </p>
              <div className="mt-6 space-y-3 text-sm">
                <a href={`mailto:${user?.email ?? ""}`} className="glass flex items-center gap-3 rounded-xl px-4 py-3 transition hover:scale-[1.01]">
                  <Mail className="h-4 w-4 text-primary" />
                  {user?.email}
                </a>
                <a href="#" className="glass flex items-center gap-3 rounded-xl px-4 py-3 transition hover:scale-[1.01]">
                  <Github className="h-4 w-4 text-primary" />
                  github.com/your-handle
                </a>
              </div>
            </div>

            <form onSubmit={submitContact} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="c-name">Name</Label>
                <Input id="c-name" name="name" required maxLength={80} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-email">Email</Label>
                <Input id="c-email" name="email" type="email" required maxLength={200} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-message">Message</Label>
                <Textarea id="c-message" name="message" rows={4} required maxLength={1000} />
              </div>
              <button type="submit" className="btn-aurora w-full rounded-xl px-4 py-2.5 text-sm font-medium">
                Send message
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
