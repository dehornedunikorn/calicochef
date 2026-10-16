import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CalicoCat } from "@/components/calico";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Bejelentkezés – CalicoChef" },
      { name: "description", content: "Jelentkezz be a CalicoChef étrendtervező használatához." },
      { property: "og:title", content: "Bejelentkezés – CalicoChef" },
      { property: "og:description", content: "Jelentkezz be a CalicoChef étrendtervező használatához." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://calicochef.lovable.app/auth" },
      { property: "og:site_name", content: "Calico" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Bejelentkezés – CalicoChef" },
      { name: "twitter:description", content: "Jelentkezz be a CalicoChef étrendtervező használatához." },
    ],
    links: [{ rel: "canonical", href: "https://calicochef.lovable.app/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "A Google-bejelentkezés nem sikerült");
      setLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("A regisztráció megerősítéséhez ellenőrizd az e-mail-fiókodat 🐾");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hiba történt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex h-full w-full flex-col items-center justify-center bg-background px-6 py-8 text-foreground">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 grid h-24 w-24 place-items-center rounded-[2rem] bg-primary text-primary-foreground shadow-lg">
            <CalicoCat variant="happy" size={88} />
          </div>
          <h1 className="text-3xl font-bold">CalicoChef</h1>
          <p className="mt-1 text-sm text-muted-foreground">A személyes étrendterveződ</p>
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card px-4 py-3 text-sm font-semibold ring-1 ring-border transition active:scale-[0.98] disabled:opacity-60"
        >
          <GoogleIcon />
          Folytatás Google-fiókkal
        </button>

        <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          vagy e-mail-cím
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleEmail} className="space-y-2.5">
          <input
            type="email"
            required
            placeholder="email@pelda.hu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl bg-secondary/60 px-4 py-3 text-sm outline-none focus:bg-secondary"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Jelszó"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl bg-secondary/60 px-4 py-3 text-sm outline-none focus:bg-secondary"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Egy pillanat…" : mode === "signin" ? "Bejelentkezés" : "Fiók létrehozása"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-center text-xs text-muted-foreground"
        >
          {mode === "signin"
            ? "New here? Create an account 🐾"
            : "Already a friend? Sign in"}
        </button>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z"
      />
    </svg>
  );
}
