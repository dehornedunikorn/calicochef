import { useMemo, useState } from "react";
import { Check, Printer } from "lucide-react";
import { useMealSlots, useRecipes } from "@/lib/data-hooks";

const fmt = (n: number) => {
  const r = Math.round(n * 100) / 100;
  return Number.isInteger(r) ? r.toString() : r.toFixed(r < 1 ? 2 : 1);
};

type AggItem = { key: string; name: string; unit: string; amount: number };

export function ShoppingView() {
  const { data: slots = [] } = useMealSlots();
  const { data: recipes = [] } = useRecipes();
  const [bought, setBought] = useState<Record<string, boolean>>({});

  const items = useMemo<AggItem[]>(() => {
    const map = new Map<string, AggItem>();
    for (const slot of slots) {
      if (!slot.recipe_id || !slot.servings) continue;
      const recipe = recipes.find((r) => r.id === slot.recipe_id);
      if (!recipe) continue;
      const mult = slot.servings / recipe.base_servings;
      for (const ing of recipe.ingredients) {
        const key = `${ing.name.toLowerCase()}::${ing.unit.toLowerCase()}`;
        const existing = map.get(key);
        const add = ing.amount * mult;
        if (existing) existing.amount += add;
        else map.set(key, { key, name: ing.name, unit: ing.unit, amount: add });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [slots, recipes]);

  const remaining = items.filter((i) => !bought[i.key]).length;

  return (
    <>
      <article className="rounded-3xl bg-gradient-to-br from-accent to-card p-4 ring-1 ring-border/60">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">This Week</p>
            <p className="mt-0.5 text-xl font-bold">
              {remaining} <span className="text-sm font-medium text-muted-foreground">items to grab 🛒</span>
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground active:scale-95"
          >
            <Printer className="h-3.5 w-3.5" />
            Print / PDF
          </button>
        </div>
      </article>

      <h2 className="mt-6 mb-3 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Shopping List
      </h2>

      {items.length === 0 ? (
        <div className="grid place-items-center rounded-3xl bg-card p-8 text-center ring-1 ring-border/60">
          <CalicoCat variant="sleepy" size={80} />
          <p className="mt-2 text-sm text-muted-foreground">No meals planned yet. Head to the Planner!</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => {
            const checked = !!bought[it.key];
            return (
              <li key={it.key}>
                <button
                  onClick={() => setBought((b) => ({ ...b, [it.key]: !b[it.key] }))}
                  className={`flex w-full items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border/60 transition active:scale-[0.98] ${
                    checked ? "opacity-60" : ""
                  }`}
                >
                  <div
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition ${
                      checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
                    }`}
                  >
                    {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </div>
                  <span className={`flex-1 text-left text-sm font-medium ${checked ? "line-through" : ""}`}>
                    {it.name}
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-primary">
                    {fmt(it.amount)} {it.unit}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
