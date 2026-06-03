import { useState } from "react";
import { Minus, Plus, Sparkles, X } from "lucide-react";
import { useRecipes, useCreateRecipe, type Recipe } from "@/lib/data-hooks";
import { toast } from "sonner";

const fmt = (n: number) => {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? r.toString() : r.toFixed(1);
};

const EMOJIS = ["🍲", "🥘", "🍛", "🍜", "🥗", "🍝", "🍕", "🥙", "🌮", "🍱"];

export function RecipesView() {
  const { data: recipes = [], isLoading } = useRecipes();
  const createRecipe = useCreateRecipe();
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState<Recipe | null>(null);

  const handleImport = async () => {
    if (!url.trim()) return;
    // Simulated import: create a placeholder recipe with random emoji + macros.
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    try {
      await createRecipe.mutateAsync({
        title: `Imported recipe (${new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace("www.", "")})`,
        emoji,
        base_servings: 2,
        kcal: 450,
        carbs: 50,
        protein: 25,
        fat: 15,
        ingredients: [
          { name: "Imported ingredient A", amount: 200, unit: "g" },
          { name: "Imported ingredient B", amount: 1, unit: "tbsp" },
        ],
      });
      toast.success("Recipe imported 🐾");
      setUrl("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    }
  };

  return (
    <>
      {/* AI Smart Import */}
      <article className="rounded-3xl bg-gradient-to-br from-accent to-card p-4 ring-1 ring-border/60">
        <div className="mb-2 flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">AI Smart Import</p>
            <p className="text-[11px] text-muted-foreground">Paste a recipe URL, let the cat fetch it 🐾</p>
          </div>
        </div>
        <textarea
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/best-tuna-recipe"
          className="h-16 w-full resize-none rounded-2xl bg-background/70 p-3 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={handleImport}
          disabled={createRecipe.isPending || !url.trim()}
          className="mt-2 w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition active:scale-95 disabled:opacity-50"
        >
          {createRecipe.isPending ? "Fetching recipe… 🐈" : "Import with AI"}
        </button>
      </article>

      {/* Recipe Grid */}
      <h2 className="mt-6 mb-3 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        My Cookbook
      </h2>
      {isLoading ? (
        <p className="text-center text-sm text-muted-foreground">Loading cookbook…</p>
      ) : recipes.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">No recipes yet — import one above!</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {recipes.map((r) => (
            <button
              key={r.id}
              onClick={() => setOpen(r)}
              className="flex flex-col items-start rounded-3xl bg-card p-3 text-left ring-1 ring-border/60 transition active:scale-95"
            >
              <div className="grid h-20 w-full place-items-center rounded-2xl bg-accent text-4xl">
                {r.emoji}
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug">{r.title}</p>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                <span className="font-medium text-primary">{r.kcal}</span> kcal
                <span>·</span>
                <span>{r.base_servings} serv</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && <Cookbook recipe={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function Cookbook({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  const [servings, setServings] = useState(recipe.base_servings);
  const mult = servings / recipe.base_servings;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/60 backdrop-blur-sm">
      <div className="mt-auto flex h-[90%] flex-col rounded-t-[2rem] bg-card shadow-2xl ring-1 ring-border/60">
        <div className="relative shrink-0 px-5 pb-3 pt-5">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
          <button
            onClick={onClose}
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-secondary"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-accent text-4xl">
              {recipe.emoji}
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">{recipe.title}</h2>
              <p className="text-xs text-muted-foreground">Cookbook · base {recipe.base_servings} serv</p>
            </div>
          </div>
        </div>

        <div className="hide-scrollbar flex-1 overflow-y-auto px-5 pb-8">
          <div className="mt-2 flex items-center justify-between rounded-2xl bg-secondary/60 p-3">
            <span className="text-sm font-semibold">Servings</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                className="grid h-9 w-9 place-items-center rounded-full bg-card ring-1 ring-border active:scale-90"
                aria-label="Decrease"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center text-lg font-bold tabular-nums">{servings}</span>
              <button
                onClick={() => setServings((s) => Math.min(20, s + 1))}
                className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground active:scale-90"
                aria-label="Increase"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {[
              { k: "Kcal", v: recipe.kcal * mult, c: "text-primary" },
              { k: "Carbs", v: recipe.carbs * mult, c: "text-foreground", u: "g" },
              { k: "Protein", v: recipe.protein * mult, c: "text-foreground", u: "g" },
              { k: "Fat", v: recipe.fat * mult, c: "text-foreground", u: "g" },
            ].map((m) => (
              <div key={m.k} className="rounded-2xl bg-accent/50 p-2.5 text-center">
                <p className={`text-base font-bold ${m.c}`}>{fmt(m.v)}{m.u ?? ""}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.k}</p>
              </div>
            ))}
          </div>

          <h3 className="mt-5 mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Ingredients
          </h3>
          <ul className="space-y-1.5">
            {recipe.ingredients.map((ing, i) => (
              <li
                key={`${ing.name}-${i}`}
                className="flex items-center justify-between rounded-2xl bg-secondary/40 px-3 py-2.5"
              >
                <span className="text-sm">{ing.name}</span>
                <span className="text-sm font-semibold tabular-nums text-primary">
                  {fmt(ing.amount * mult)} {ing.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
