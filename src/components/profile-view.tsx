import { useEffect, useState } from "react";
import { Activity, Cat, LogOut, Save, Calculator } from "lucide-react";
import { CalicoCat } from "@/components/calico";
import { useProfile, useUpdateProfile } from "@/lib/data-hooks";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import catnipShaker from "@/assets/catnip-shaker.png";

type Sex = "female" | "male" | "";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
type GoalType = "lose" | "maintain" | "gain";

const activityFactors: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const activityLabels: Record<ActivityLevel, string> = {
  sedentary: "Ülő életmód",
  light: "Enyhén aktív",
  moderate: "Közepesen aktív",
  active: "Aktív",
  very_active: "Nagyon aktív",
};

const goalLabels: Record<GoalType, string> = {
  lose: "Fogyás",
  maintain: "Súlytartás",
  gain: "Súlygyarapítás",
};

function numberOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function ProfileView() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const navigate = useNavigate();

  const [target, setTarget] = useState("2000");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [sex, setSex] = useState<Sex>("");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<GoalType>("maintain");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!profile) return;
    setTarget(String(profile.target_kcal ?? 2000));
    setAge(profile.age_years == null ? "" : String(profile.age_years));
    setHeight(profile.height_cm == null ? "" : String(profile.height_cm));
    setWeight(profile.weight_kg == null ? "" : String(profile.weight_kg));
    setSex(profile.sex ?? "");
    setActivity(profile.activity_level ?? "moderate");
    setGoal(profile.goal_type ?? "maintain");
    setProtein(profile.target_protein_g == null ? "" : String(profile.target_protein_g));
    setCarbs(profile.target_carbs_g == null ? "" : String(profile.target_carbs_g));
    setFat(profile.target_fat_g == null ? "" : String(profile.target_fat_g));
  }, [profile]);

  const estimateCalories = () => {
    const a = numberOrNull(age);
    const h = numberOrNull(height);
    const w = numberOrNull(weight);
    if (!a || !h || !w || !sex) {
      setNotice("A becsléshez add meg az életkort, a magasságot, a testsúlyt és a számításhoz használt nemet.");
      return;
    }
    if (a < 18 || a > 100 || h < 100 || h > 250 || w < 30 || w > 350) {
      setNotice("Ellenőrizd az adatokat: életkor 18–100 év, magasság 100–250 cm, testsúly 30–350 kg.");
      return;
    }
    // Mifflin–St Jeor estimated resting energy expenditure × activity factor.
    const bmr = 10 * w + 6.25 * h - 5 * a + (sex === "male" ? 5 : -161);
    const maintenance = bmr * activityFactors[activity];
    const adjusted = maintenance + (goal === "lose" ? -300 : goal === "gain" ? 250 : 0);
    const rounded = Math.round(adjusted / 50) * 50;
    if (rounded < 500 || rounded > 6000) {
      setNotice("A becslés a beállítható 500–6000 kcal tartományon kívül esik. Ellenőrizd az adatokat, vagy kérj személyre szabott szakmai tanácsot.");
      return;
    }
    setTarget(String(rounded));
    setNotice(`Becsült napi cél: ${rounded} kcal. Ez kiinduló becslés, szükség szerint módosítsd.`);
  };

  const save = () => {
    const targetKcal = numberOrNull(target);
    if (targetKcal == null || targetKcal < 500 || targetKcal > 6000) {
      setNotice("A napi kalóriacél 500 és 6000 kcal közötti szám legyen.");
      return;
    }
    const ageValue = numberOrNull(age);
    const heightValue = numberOrNull(height);
    const weightValue = numberOrNull(weight);
    const proteinValue = numberOrNull(protein);
    const carbsValue = numberOrNull(carbs);
    const fatValue = numberOrNull(fat);
    if (ageValue != null && (!Number.isInteger(ageValue) || ageValue < 18 || ageValue > 100)) {
      setNotice("Az életkor egész szám legyen 18 és 100 év között.");
      return;
    }
    if (heightValue != null && (heightValue < 100 || heightValue > 250)) {
      setNotice("A magasság 100 és 250 cm közötti legyen.");
      return;
    }
    if (weightValue != null && (weightValue < 30 || weightValue > 350)) {
      setNotice("A testsúly 30 és 350 kg közötti legyen.");
      return;
    }
    if (
      (proteinValue != null && (proteinValue < 0 || proteinValue > 500)) ||
      (carbsValue != null && (carbsValue < 0 || carbsValue > 1000)) ||
      (fatValue != null && (fatValue < 0 || fatValue > 500))
    ) {
      setNotice("A makrócélok megengedett tartománya: fehérje 0–500 g, szénhidrát 0–1000 g, zsír 0–500 g.");
      return;
    }

    updateProfile.mutate(
      {
        target_kcal: Math.round(targetKcal),
        age_years: ageValue == null ? null : Math.round(ageValue),
        height_cm: heightValue,
        weight_kg: weightValue,
        sex: sex || null,
        activity_level: activity,
        goal_type: goal,
        target_protein_g: proteinValue == null ? null : Math.round(proteinValue),
        target_carbs_g: carbsValue == null ? null : Math.round(carbsValue),
        target_fat_g: fatValue == null ? null : Math.round(fatValue),
      },
      {
        onSuccess: () => setNotice("A profilbeállításokat elmentettük."),
        onError: () => setNotice("Nem sikerült menteni. Ellenőrizd a kapcsolatot, majd próbáld újra."),
      },
    );
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const inputClass = "mt-1 w-full rounded-xl bg-secondary/60 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40";
  const labelClass = "text-xs font-semibold text-muted-foreground";

  return (
    <>
      <article className="flex items-center gap-3 rounded-3xl bg-gradient-to-br from-accent to-card p-4 ring-1 ring-border/60">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <CalicoCat variant="happy" size={56} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold">{profile?.display_name ?? "Szia!"}</p>
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
        Személyes adatok
      </h2>
      <article className="rounded-3xl bg-card p-4 ring-1 ring-border/60">
        <p className="mb-3 text-xs text-muted-foreground">
          Ezek az adatok opcionálisak. Csak akkor add meg őket, ha szeretnéd használni a kalóriabecslést.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <label className={labelClass}>
            Életkor (év)
            <input className={inputClass} type="number" min="18" max="100" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Pl. 35" />
          </label>
          <label className={labelClass}>
            Számításhoz használt nem
            <select className={inputClass} value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
              <option value="">Nincs megadva</option>
              <option value="female">Nő</option>
              <option value="male">Férfi</option>
            </select>
          </label>
          <label className={labelClass}>
            Magasság (cm)
            <input className={inputClass} type="number" min="100" max="250" step="0.5" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Pl. 175" />
          </label>
          <label className={labelClass}>
            Testsúly (kg)
            <input className={inputClass} type="number" min="30" max="350" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Pl. 80" />
          </label>
        </div>
        <label className={`mt-3 block ${labelClass}`}>
          Aktivitási szint
          <select className={inputClass} value={activity} onChange={(e) => setActivity(e.target.value as ActivityLevel)}>
            {Object.entries(activityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className={`mt-3 block ${labelClass}`}>
          Cél
          <select className={inputClass} value={goal} onChange={(e) => setGoal(e.target.value as GoalType)}>
            {Object.entries(goalLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <button
          onClick={estimateCalories}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-foreground active:scale-[0.99]"
        >
          <Calculator className="h-4 w-4" />
          Napi kalóriacél becslése
        </button>
      </article>

      <h2 className="mt-6 mb-3 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Napi célok
      </h2>
      <article className="rounded-3xl bg-card p-4 ring-1 ring-border/60">
        <label htmlFor="kcal-target" className="text-sm font-semibold">Napi kalóriacél</label>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          A becsült értéket kézzel is átírhatod. A módosítás csak mentéskor kerül a profilodba.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <input
            id="kcal-target"
            type="number"
            min={500}
            max={6000}
            step={50}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full rounded-2xl bg-secondary/60 px-4 py-3 text-2xl font-bold tabular-nums outline-none focus:bg-secondary"
          />
          <span className="text-sm font-medium text-muted-foreground">kcal</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[1500, 1800, 2000, 2200, 2500].map((p) => (
            <button
              key={p}
              onClick={() => setTarget(String(p))}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                Number(target) === p ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="mt-4 border-t border-border/70 pt-4">
          <p className="mb-1 text-sm font-semibold">Opcionális napi makrócélok</p>
          <p className="mb-3 text-[11px] text-muted-foreground">Ha üresen hagyod, az alkalmazás nem állít be külön célt.</p>
          <div className="grid grid-cols-3 gap-2">
            <label className={labelClass}>
              Fehérje (g)
              <input className={inputClass} type="number" min="0" max="500" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="—" />
            </label>
            <label className={labelClass}>
              Szénhidrát (g)
              <input className={inputClass} type="number" min="0" max="1000" value={carbs} onChange={(e) => setCarbs(e.target.value)} placeholder="—" />
            </label>
            <label className={labelClass}>
              Zsír (g)
              <input className={inputClass} type="number" min="0" max="500" value={fat} onChange={(e) => setFat(e.target.value)} placeholder="—" />
            </label>
          </div>
        </div>
        <button
          onClick={save}
          disabled={isLoading || updateProfile.isPending}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {updateProfile.isPending ? "Mentés…" : "Beállítások mentése"}
        </button>
        {notice && <p role="status" className="mt-3 rounded-xl bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">{notice}</p>}
        <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
          A kalóriabecslés általános képleten alapul, és nem helyettesíti a személyre szabott szakmai tanácsot. Várandósság, betegség vagy speciális étrendi igény esetén kérj szakmai segítséget.
        </p>
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
            <p className="text-[11px] text-muted-foreground">A Google Fit-kapcsolat fejlesztés alatt áll.</p>
          </div>
          <span className="rounded-full bg-secondary px-3.5 py-2 text-xs font-semibold text-muted-foreground">Hamarosan</span>
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
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-lg">✌️</div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Támogasd a készítőt</p>
          <p className="text-[11px] text-muted-foreground">Támogasd az alkalmazás fejlesztését!</p>
        </div>
        <img src={catnipShaker} alt="Macskamenta-szóró" width={44} height={44} className="animate-shaker h-11 w-11 object-contain" loading="lazy" />
      </a>
    </>
  );
}
