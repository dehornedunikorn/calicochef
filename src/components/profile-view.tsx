import { useEffect, useState } from "react";
import { Activity, Cat, LogOut } from "lucide-react";
import { CalicoCat } from "@/components/calico";
import { useProfile, useUpdateProfile } from "@/lib/data-hooks";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import catnipShaker from "@/assets/catnip-shaker.png";

export function ProfileView() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const navigate = useNavigate();
  const [target, setTarget] = useState<number>(profile?.target_kcal ?? 2000);
  const [synced, setSzinkronizálásed] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (profile) setTarget(profile.target_kcal);
  }, [profile?.target_kcal]);

  const save = (n: number) => {
    setTarget(n);
    updateProfile.mutate({ target_kcal: n });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <>
      <article className="flex items-center gap-3 rounded-3xl bg-gradient-to-br from-accent to-card p-4 ring-1 ring-border/60">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <CalicoCat variant="happy" size={56} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold">{profile?.display_name ?? "Whiskers"}</p>
          <p className="text-xs text-muted-foreground">Személyes étrendtervező</p>
        </div>
        <button
          onClick={handleSignOut}
          className="grid h-10 w-10 place-items-center rounded-full bg-card ring-1 ring-border active:scale-90"
          aria-label="Kijelentkezés"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </article>

      <h2 className="mt-6 mb-3 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Napi cél
      </h2>
      <article className="rounded-3xl bg-card p-4 ring-1 ring-border/60">
        <label htmlFor="kcal-target" className="text-sm font-semibold">
          Napi kalóriacél
        </label>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Ezt használja a napi áttekintő és az étkezések arányának számítása.
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
        Integrációk
      </h2>
      <article className="rounded-3xl bg-card p-4 ring-1 ring-border/60">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Google Fit</p>
            <p className="text-[11px] text-muted-foreground">
              {synced ? "Connected! 🐾" : "Aktivitás és elégetett kalória szinkronizálása."}
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground active:scale-95 disabled:opacity-50"
          >
            {syncing ? "Szinkronizálás…" : synced ? "Szinkronizálva ✓" : "Sync"}
          </button>
        </div>
      </article>

      <article className="mt-3 flex items-center gap-3 rounded-3xl bg-card p-4 ring-1 ring-border/60">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent">
          <Cat className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Cica mód</p>
          <p className="text-[11px] text-muted-foreground">Mindig egy kis extra dorombolás.</p>
        </div>
        <CalicoCat variant="love" size={36} />
      </article>

      <a
        href="https://paypal.me/dehornedunikorn"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center gap-3 rounded-3xl bg-card p-4 ring-1 ring-border/60 transition active:scale-95"
      >
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-lg">
          ✌️
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Támogasd a készítőt</p>
          <p className="text-[11px] text-muted-foreground">Támogasd az alkalmazás fejlesztését!</p>
        </div>
        <img
          src={catnipShaker}
          alt="Catnip shaker"
          width={44}
          height={44}
          className="animate-shaker h-11 w-11 object-contain"
          loading="lazy"
        />
      </a>
    </>
  );
}
