import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Home, BookOpen, CalendarDays, ShoppingBasket, Cat } from "lucide-react";
import { RecipesView } from "@/components/recipes-view";
import { PlannerView } from "@/components/planner-view";
import { ShoppingView } from "@/components/shopping-view";
import { CalicoCat, CALICO_SCALE } from "@/components/calico";
import { ProfileView } from "@/components/profile-view";
import {
  DAYS_FULL,
  mealKcal,
  useJournal,
  useMealSlots,
  useProfile,
  useRecipes,
  useUpsertJournal,
} from "@/lib/data-hooks";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Calico — your cozy meal companion" },
      {
        name: "description",
        content: "Track meals, mood, and macros with a cute cat-themed daily planner.",
      },
      { property: "og:title", content: "Calico — your cozy meal companion" },
      { property: "og:description", content: "Track meals, mood, and macros with a cute cat-themed daily planner." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://calicochef.lovable.app/" },
      { property: "og:site_name", content: "Calico" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Calico — your cozy meal companion" },
      { name: "twitter:description", content: "Track meals, mood, and macros with a cute cat-themed daily planner." },
    ],
    links: [{ rel: "canonical", href: "https://calicochef.lovable.app/" }],
  }),
  component: Index,
});



function Index() {
  const { data: profile } = useProfile();
  const { data: slots = [] } = useMealSlots();
  const { data: recipes = [] } = useRecipes();

  const [day, setDay] = useState(0);
  const week = 12;

  const target = profile?.target_kcal ?? 2000;
  const todaySlots = slots.filter((s) => s.day_idx === day);
  const consumed = todaySlots.reduce((sum, s) => sum + mealKcal(s, recipes), 0);
  const pct = Math.min(100, (consumed / target) * 100);
  const over = consumed > target;

  const todayMeals = todaySlots
    .map((s) => {
      const r = recipes.find((x) => x.id === s.recipe_id);
      return r
        ? {
            id: s.id,
            name: r.title,
            kcal: Math.round((r.kcal * (s.servings ?? 0)) / r.base_servings),
            emoji: r.emoji,
            slotName: s.name,
          }
        : null;
    })
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  const [activeTab, setActiveTab] = useState("home");
  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "recipes", icon: BookOpen, label: "Recipes" },
    { id: "planner", icon: CalendarDays, label: "Planner" },
    { id: "shopping", icon: ShoppingBasket, label: "Shopping" },
    { id: "profile", icon: Cat, label: "Profile" },
  ];

  return (
    <main className="flex h-full w-full flex-col bg-background text-foreground">
      <header className="glass sticky top-0 z-20 flex items-center justify-between border-b-[2.5px] border-foreground/80 px-4 py-3 shadow-[0_3px_0_0_oklch(0.3_0.04_40_/_0.25)]">
        <button
          onClick={() => setDay((d) => (d - 1 + 7) % 7)}
          className="press grid h-11 w-11 place-items-center rounded-full bg-secondary cartoon-pill text-foreground"
          aria-label="Previous day"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-bold uppercase tracking-widest text-primary">🐾 Week {week} 🐾</span>
          <span className="flex items-center gap-1.5 text-lg font-extrabold"><CalicoCat variant="happy" size={28} /> {DAYS_FULL[day]}</span>
        </div>
        <button
          onClick={() => setDay((d) => (d + 1) % 7)}
          className="press grid h-11 w-11 place-items-center rounded-full bg-secondary cartoon-pill text-foreground"
          aria-label="Next day"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </header>


      <section className="hide-scrollbar flex-1 overflow-y-auto px-4 pb-28 pt-4">
        {activeTab === "recipes" ? (
          <RecipesView />
        ) : activeTab === "planner" ? (
          <PlannerView />
        ) : activeTab === "shopping" ? (
          <ShoppingView />
        ) : activeTab === "profile" ? (
          <ProfileView />
        ) : (
          <HomeContent
            day={day}
            consumed={consumed}
            target={target}
            pct={pct}
            over={over}
            todayMeals={todayMeals}
          />
        )}
      </section>

      <nav className="glass pointer-events-auto fixed inset-x-3 bottom-3 z-20 flex items-center justify-around rounded-full border-[2.5px] border-foreground px-2 py-2 shadow-[3px_4px_0_0_oklch(0.3_0.04_40)]">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="press flex flex-1 flex-col items-center gap-0.5 py-1"
              aria-label={t.label}
            >
              <div
                className={`grid h-11 w-11 place-items-center rounded-2xl transition-all duration-300 ${
                  active
                    ? "bg-primary text-primary-foreground scale-110 -translate-y-1.5 rotate-[-6deg] border-2 border-foreground shadow-[2px_3px_0_0_oklch(0.3_0.04_40)]"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className={`text-[10px] font-bold ${active ? "text-primary" : "text-muted-foreground"}`}>
                {t.label}
              </span>
            </button>
          );
        })}
      </nav>

    </main>
  );
}

function HomeContent({
  day,
  consumed,
  target,
  pct,
  over,
  todayMeals,
}: {
  day: number;
  consumed: number;
  target: number;
  pct: number;
  over: boolean;
  todayMeals: { id: string; name: string; kcal: number; emoji: string; slotName: string }[];
}) {
  const { data: journal } = useJournal(day);
  const upsertJournal = useUpsertJournal();
  const [text, setText] = useState("");
  const [hunger, setHunger] = useState(3);
  const [mood, setMood] = useState(3);
  const [productivity, setProductivity] = useState(3);

  useEffect(() => {
    if (journal) {
      setText(journal.text);
      setHunger(journal.hunger);
      setMood(journal.mood);
      setProductivity(journal.productivity);
    }
  }, [journal?.id, journal?.day_idx]);

  return (
    <>
      <article className="cartoon-card p-5 animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">🍽️ Today's Kcal</p>
            <p className="mt-1 text-3xl font-extrabold">
              {Math.round(consumed)}
              <span className="text-base font-bold text-muted-foreground"> / {target}</span>
            </p>
          </div>
          <div className="animate-bop"><CalicoCat variant={over ? "shocked" : "happy"} size={72} /></div>
        </div>
        <div className="mt-4 h-4 w-full overflow-hidden rounded-full border-2 border-foreground bg-secondary">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: over
                ? "linear-gradient(90deg, oklch(0.74 0.16 55), oklch(0.6 0.22 25))"
                : "linear-gradient(90deg, oklch(0.85 0.12 70), oklch(0.74 0.16 55))",
            }}
          />
        </div>
        <p className={`mt-3 text-sm font-bold ${over ? "text-destructive" : "text-primary"}`}>
          {over ? "Over limit! Time for zoomies 🐾" : "You can still eat! 🍽️✨"}
        </p>
      </article>

      <h2 className="mt-6 mb-3 px-1 text-sm font-extrabold uppercase tracking-wider text-foreground/70">
        🐟 Today's Meals
      </h2>
      {todayMeals.length === 0 ? (
        <div className="cartoon-card-soft grid place-items-center p-6 text-center">
          <div className="animate-float"><CalicoCat variant="sleepy" size={72} /></div>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">No meals planned yet. Time to nap?</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {todayMeals.map((m, i) => (
            <li
              key={m.id}
              className="cartoon-card-soft flex items-center gap-3 p-3"
              style={{ animation: `slide-up 0.4s ${i * 60}ms cubic-bezier(0.34,1.55,0.55,1) backwards` }}
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-2xl border-2 border-foreground/80">
                {m.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{m.name}</p>
                <p className="text-xs font-semibold text-muted-foreground">{m.slotName}</p>
              </div>
              <span className="text-sm font-extrabold text-primary">{m.kcal} kcal</span>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-6 mb-3 px-1 text-sm font-extrabold uppercase tracking-wider text-foreground/70">
        📓 Daily Journal
      </h2>
      <div className="cartoon-card-soft p-4">
        <label className="text-base font-extrabold">How are you feeling? 💭</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => upsertJournal.mutate({ day_idx: day, text })}
          placeholder="Purr your thoughts here..."
          className="mt-2 h-28 w-full resize-none rounded-2xl border-2 border-foreground/40 bg-secondary/60 p-3 text-sm outline-none placeholder:text-muted-foreground focus:bg-secondary focus:border-primary"
        />
      </div>

      <h2 className="mt-6 mb-3 px-1 text-sm font-extrabold uppercase tracking-wider text-foreground/70">
        🐾 Cat Scale Check-in
      </h2>
      <div className="cartoon-card-soft space-y-4 p-4">

        <CatSlider
          label="Hunger"
          value={hunger}
          onChange={(v) => {
            setHunger(v);
            upsertJournal.mutate({ day_idx: day, hunger: v });
          }}
        />
        <CatSlider
          label="Mood"
          value={mood}
          onChange={(v) => {
            setMood(v);
            upsertJournal.mutate({ day_idx: day, mood: v });
          }}
        />
        <CatSlider
          label="Productivity"
          value={productivity}
          onChange={(v) => {
            setProductivity(v);
            upsertJournal.mutate({ day_idx: day, productivity: v });
          }}
        />
      </div>
    </>
  );
}

function CatSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold">{label}</span>
        <span key={value} className="animate-pounce">
          <CalicoCat variant={CALICO_SCALE[value - 1]} size={44} />
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-3 w-full cursor-pointer appearance-none rounded-full border-2 border-foreground/60 bg-secondary accent-primary"
      />
      <div className="mt-1 flex justify-between px-0.5">
        {CALICO_SCALE.map((c, i) => (
          <span key={i} className={i + 1 === value ? "opacity-100 scale-110" : "opacity-30"}>
            <CalicoCat variant={c} size={28} />
          </span>
        ))}
      </div>
    </div>
  );
}

