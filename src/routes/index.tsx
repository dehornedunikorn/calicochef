import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Home, BookOpen, CalendarDays, ShoppingBasket, Cat } from "lucide-react";
import { RecipesView } from "@/components/recipes-view";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Calico — your cozy meal companion" },
      { name: "description", content: "Track meals, mood, and macros with a cute cat-themed daily planner." },
    ],
  }),
  component: Index,
});

const CAT_SCALE = ["😿", "🙀", "😼", "😺", "😻"];

function Index() {
  const [day, setDay] = useState(0);
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const week = 12;

  const consumed = 1420;
  const target = 2000;
  const pct = Math.min(100, (consumed / target) * 100);
  const over = consumed > target;

  const meals = [
    { time: "08:00", name: "Tuna & avocado toast", kcal: 380, emoji: "🥑" },
    { time: "12:30", name: "Chicken salad bowl", kcal: 520, emoji: "🥗" },
    { time: "16:00", name: "Greek yogurt + berries", kcal: 180, emoji: "🫐" },
    { time: "19:30", name: "Salmon, rice & greens", kcal: 340, emoji: "🐟" },
  ];

  const [journal, setJournal] = useState("");
  const [hunger, setHunger] = useState(3);
  const [mood, setMood] = useState(4);
  const [productivity, setProductivity] = useState(3);

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
      {/* STICKY TOP */}
      <header className="glass sticky top-0 z-20 flex items-center justify-between border-b border-border/40 px-4 py-3">
        <button
          onClick={() => setDay((d) => (d - 1 + 7) % 7)}
          className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-foreground transition active:scale-90"
          aria-label="Previous day"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Week {week}</span>
          <span className="text-base font-semibold">🐱 {days[day]}</span>
        </div>
        <button
          onClick={() => setDay((d) => (d + 1) % 7)}
          className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-foreground transition active:scale-90"
          aria-label="Next day"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </header>

      {/* SCROLLABLE MIDDLE */}
      <section className="hide-scrollbar flex-1 overflow-y-auto px-4 pb-28 pt-4">
        {activeTab === "recipes" ? (
          <RecipesView />
        ) : activeTab !== "home" ? (
          <div className="grid h-full place-items-center text-center text-muted-foreground">
            <div>
              <p className="text-5xl">🐈</p>
              <p className="mt-3 text-sm">This room is still being unpacked…</p>
            </div>
          </div>
        ) : (
          <>
        {/* Macro Tracker */}
        <article className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Today's Kcal</p>
              <p className="mt-1 text-3xl font-bold">
                {consumed}<span className="text-base font-medium text-muted-foreground"> / {target}</span>
              </p>
            </div>
            <div className="text-4xl">{over ? "🙀" : "😺"}</div>
          </div>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-secondary">
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
          <p className={`mt-3 text-sm font-medium ${over ? "text-destructive" : "text-primary"}`}>
            {over ? "Over limit! Time for zoomies 🐾" : "You can still eat! 🍽️"}
          </p>
        </article>

        {/* Today's Meals */}
        <h2 className="mt-6 mb-3 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Today's Meals
        </h2>
        <ul className="space-y-2">
          {meals.map((m) => (
            <li
              key={m.time}
              className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border/60"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-xl">
                {m.emoji}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.time}</p>
              </div>
              <span className="text-sm font-medium text-primary">{m.kcal} kcal</span>
            </li>
          ))}
        </ul>

        {/* Daily Journal */}
        <h2 className="mt-6 mb-3 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Daily Journal
        </h2>
        <div className="rounded-3xl bg-card p-4 ring-1 ring-border/60">
          <label className="text-base font-semibold">How are you feeling? 💭</label>
          <textarea
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="Purr your thoughts here..."
            className="mt-2 h-28 w-full resize-none rounded-2xl bg-secondary/60 p-3 text-sm outline-none ring-0 placeholder:text-muted-foreground focus:bg-secondary"
          />
        </div>

        {/* Cat Scale Check-in */}
        <h2 className="mt-6 mb-3 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Cat Scale Check-in
        </h2>
        <div className="space-y-3 rounded-3xl bg-card p-4 ring-1 ring-border/60">
          <CatSlider label="Hunger" value={hunger} onChange={setHunger} />
          <CatSlider label="Mood" value={mood} onChange={setMood} />
          <CatSlider label="Productivity" value={productivity} onChange={setProductivity} />
        </div>
        </>
        )}
      </section>

      {/* STICKY BOTTOM */}
      <nav className="glass pointer-events-auto fixed inset-x-3 bottom-3 z-20 flex items-center justify-around rounded-full border border-white/40 px-2 py-2 shadow-lg">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex flex-1 flex-col items-center gap-0.5 py-1 transition active:scale-90"
              aria-label={t.label}
            >
              <div
                className={`grid h-9 w-9 place-items-center rounded-full transition ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                {t.label}
              </span>
            </button>
          );
        })}
      </nav>
    </main>
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
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-2xl leading-none">{CAT_SCALE[value - 1]}</span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
      />
      <div className="mt-1 flex justify-between px-0.5 text-xs">
        {CAT_SCALE.map((c, i) => (
          <span key={i} className={i + 1 === value ? "opacity-100" : "opacity-40"}>{c}</span>
        ))}
      </div>
    </div>
  );
}
