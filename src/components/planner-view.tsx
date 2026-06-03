import { useMemo, useState } from "react";
import { AlertTriangle, Plus, Sparkles, X } from "lucide-react";
import {
  DAYS,
  mealKcal,
  useMealSlots,
  useProfile,
  useRecipes,
  useUpdateSlot,
  type MealSlot,
  type Recipe,
} from "@/lib/data-hooks";

const fmt = (n: number) => {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? r.toString() : r.toFixed(1);
};

export function PlannerView() {
  const { data: profile } = useProfile();
  const { data: slots = [] } = useMealSlots();
  const { data: recipes = [] } = useRecipes();
  const updateSlot = useUpdateSlot();
  const [dayIdx, setDayIdx] = useState(0);
  const [picker, setPicker] = useState<{ slotId: string } | null>(null);

  const dailyTarget = profile?.target_kcal ?? 2000;
  const daySlots = useMemo(() => slots.filter((s) => s.day_idx === dayIdx), [slots, dayIdx]);
  const totalKcal = daySlots.reduce((s, m) => s + mealKcal(m, recipes), 0);
  const totalPct = daySlots.reduce((s, m) => s + m.pct, 0);
  const over = totalKcal > dailyTarget;

  const assignRecipe = (slotId: string, recipe: Recipe) => {
    updateSlot.mutate({ id: slotId, patch: { recipe_id: recipe.id, servings: recipe.base_servings } });
    setPicker(null);
  };

  const smartScale = (slot: MealSlot) => {
    const r = recipes.find((x) => x.id === slot.recipe_id);
    if (!r) return;
    const budget = (dailyTarget * slot.pct) / 100;
    const otherKcal = daySlots
      .filter((s) => s.id !== slot.id)
      .reduce((s, m) => s + mealKcal(m, recipes), 0);
    const remainingDaily = dailyTarget - otherKcal;
    const target = Math.min(budget, Math.max(0, remainingDaily));
    const perServing = r.kcal / r.base_servings;
    const newServings = Math.max(0.1, Math.round((target / perServing) * 10) / 10);
    updateSlot.mutate({ id: slot.id, patch: { servings: newServings } });
  };

  return (
    <>
      <div className="flex gap-1.5">
        {DAYS.map((d, i) => (
          <button
            key={d}
            onClick={() => setDayIdx(i)}
            className={`flex-1 rounded-2xl py-2 text-xs font-semibold transition active:scale-95 ${
              i === dayIdx
                ? "bg-primary text-primary-foreground shadow"
                : "bg-card text-muted-foreground ring-1 ring-border/60"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <article className="mt-4 rounded-3xl bg-card p-4 ring-1 ring-border/60">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Planned Total</p>
            <p className="mt-1 text-2xl font-bold">
              {fmt(totalKcal)}
              <span className="text-sm font-medium text-muted-foreground"> / {dailyTarget} kcal</span>
            </p>
          </div>
          <div className="text-3xl">{over ? "🙀" : "😺"}</div>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, (totalKcal / dailyTarget) * 100)}%`,
              background: over
                ? "linear-gradient(90deg, oklch(0.74 0.16 55), oklch(0.6 0.22 25))"
                : "linear-gradient(90deg, oklch(0.85 0.12 70), oklch(0.74 0.16 55))",
            }}
          />
        </div>
        {over && (
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Over target! Time for zoomies 🐾
          </div>
        )}
        {totalPct !== 100 && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Meal percentages sum to {totalPct}% (target 100%).
          </p>
        )}
      </article>

      <h2 className="mt-6 mb-3 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {DAYS[dayIdx]}'s Meals
      </h2>
      <ul className="space-y-2.5">
        {daySlots.map((slot) => {
          const recipe = recipes.find((r) => r.id === slot.recipe_id);
          const kcal = mealKcal(slot, recipes);
          const budget = (dailyTarget * slot.pct) / 100;
          const slotOver = kcal > budget + 0.5;
          return (
            <li key={slot.id} className="rounded-3xl bg-card p-3 ring-1 ring-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={slot.name}
                    onChange={(e) => updateSlot.mutate({ id: slot.id, patch: { name: e.target.value } })}
                    className="w-24 rounded-lg bg-transparent text-sm font-semibold outline-none focus:bg-secondary/60 focus:px-1.5"
                  />
                  <div className="flex items-center gap-1 rounded-full bg-accent px-2 py-0.5">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={slot.pct}
                      onChange={(e) =>
                        updateSlot.mutate({
                          id: slot.id,
                          patch: { pct: Math.max(0, Math.min(100, Number(e.target.value) || 0)) },
                        })
                      }
                      className="w-8 bg-transparent text-center text-xs font-bold tabular-nums outline-none"
                    />
                    <span className="text-[10px] font-bold">%</span>
                  </div>
                </div>
                <span className={`text-xs font-semibold tabular-nums ${slotOver ? "text-destructive" : "text-muted-foreground"}`}>
                  {fmt(kcal)} / {Math.round(budget)} kcal
                </span>
              </div>

              {recipe ? (
                <div className="mt-2.5 flex items-center gap-2 rounded-2xl bg-secondary/50 p-2.5">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-xl">
                    {recipe.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{recipe.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      <span className="tabular-nums">{fmt(slot.servings ?? 1)}×</span> servings ·{" "}
                      <span className="text-primary">{fmt(kcal)} kcal</span>
                    </p>
                  </div>
                  <button
                    onClick={() => smartScale(slot)}
                    className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-primary-foreground active:scale-95"
                    aria-label="Smart scale"
                  >
                    <Sparkles className="h-3 w-3" />
                    Smart Scale
                  </button>
                  <button
                    onClick={() => updateSlot.mutate({ id: slot.id, patch: { recipe_id: null, servings: null } })}
                    className="grid h-7 w-7 place-items-center rounded-full bg-card ring-1 ring-border active:scale-90"
                    aria-label="Remove recipe"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setPicker({ slotId: slot.id })}
                  className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border bg-secondary/30 py-2.5 text-xs font-medium text-muted-foreground active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Assign recipe
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {picker && (
        <RecipePicker
          recipes={recipes}
          onPick={(r) => assignRecipe(picker.slotId, r)}
          onClose={() => setPicker(null)}
        />
      )}
    </>
  );
}

function RecipePicker({
  recipes,
  onPick,
  onClose,
}: {
  recipes: Recipe[];
  onPick: (r: Recipe) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/60 backdrop-blur-sm">
      <div className="mt-auto flex max-h-[80%] flex-col rounded-t-[2rem] bg-card shadow-2xl ring-1 ring-border/60">
        <div className="relative shrink-0 px-5 pb-2 pt-5">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
          <button
            onClick={onClose}
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-secondary"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <h3 className="text-lg font-bold">Pick a recipe</h3>
          <p className="text-xs text-muted-foreground">Choose what to assign to this meal 🐾</p>
        </div>
        <div className="hide-scrollbar grid flex-1 grid-cols-2 gap-3 overflow-y-auto px-5 pb-8 pt-2">
          {recipes.map((r) => (
            <button
              key={r.id}
              onClick={() => onPick(r)}
              className="flex flex-col items-start rounded-3xl bg-secondary/40 p-3 text-left ring-1 ring-border/60 active:scale-95"
            >
              <div className="grid h-16 w-full place-items-center rounded-2xl bg-accent text-3xl">
                {r.emoji}
              </div>
              <p className="mt-2 line-clamp-2 text-xs font-semibold leading-snug">{r.title}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                <span className="text-primary">{r.kcal}</span> kcal · {r.base_servings} serv
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
