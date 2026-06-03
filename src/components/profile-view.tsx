import { useEffect, useState } from "react";
import { Activity, Cat, LogOut } from "lucide-react";
import { useProfile, useUpdateProfile } from "@/lib/data-hooks";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";

export function ProfileView() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const navigate = useNavigate();
  const [target, setTarget] = useState<number>(profile?.target_kcal ?? 2000);
  const [synced, setSynced] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (profile) setTarget(profile.target_kcal);
  }, [profile?.target_kcal]);

  const save = (n: number) => {
    setTarget(n);
    updateProfile.mutate({ target_kcal: n });
  };

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSynced(true);
      setTimeout(() => setSynced(false), 2200);
    }, 1200);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <>
      <article className="flex items-center gap-3 rounded-3xl bg-gradient-to-br from-accent to-card p-4 ring-1 ring-border/60">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-3xl text-primary-foreground">
          🐱
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold">{profile?.display_name ?? "Whiskers"}</p>
          <p className="text-xs text-muted-foreground">Cozy meal explorer · Week 12</p>
        </div>
        <button
          onClick={handleSignOut}
          className="grid h-10 w-10 place-items-center rounded-full bg-card ring-1 ring-border active:scale-90"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </article>

      <h2 className="mt-6 mb-3 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Daily Goal
      </h2>
      <article className="rounded-3xl bg-card p-4 ring-1 ring-border/60">
        <label htmlFor="kcal-target" className="text-sm font-semibold">
          Daily Target Kcal
        </label>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Used by your tracker and meal percentages.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <input
            id="kcal-target"
            type="number"
            min={500}
            max={6000}
            step={50}
            value={target}
            onChange={(e) => setTarget(Math.max(500, Math.min(6000, Number(e.target.value) || 0)))}
            onBlur={() => save(target)}
            className="w-full rounded-2xl bg-secondary/60 px-4 py-3 text-2xl font-bold tabular-nums outline-none focus:bg-secondary"
          />
          <span className="text-sm font-medium text-muted-foreground">kcal</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[1500, 1800, 2000, 2200, 2500].map((p) => (
            <button
              key={p}
              onClick={() => save(p)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                target === p ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </article>

      <h2 className="mt-6 mb-3 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Integrations
      </h2>
      <article className="rounded-3xl bg-card p-4 ring-1 ring-border/60">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Google Fit</p>
            <p className="text-[11px] text-muted-foreground">
              {synced ? "Connected! 🐾" : "Sync activity and calories burned."}
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground active:scale-95 disabled:opacity-50"
          >
            {syncing ? "Syncing…" : synced ? "Synced ✓" : "Sync"}
          </button>
        </div>
      </article>

      <article className="mt-3 flex items-center gap-3 rounded-3xl bg-card p-4 ring-1 ring-border/60">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent">
          <Cat className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Cat Mode</p>
          <p className="text-[11px] text-muted-foreground">Extra purrs, always on.</p>
        </div>
        <span className="text-xl">😻</span>
      </article>
    </>
  );
}
