import { useState } from "react";
import { Minus, Plus, Sparkles, X } from "lucide-react";

export type Ingredient = { name: string; amount: number; unit: string };
export type Recipe = {
  id: string;
  title: string;
  emoji: string;
  base_servings: number;
  macros: { kcal: number; carbs: number; protein: number; fat: number };
  ingredients: Ingredient[];
};

export const RECIPES: Recipe[] = [
  {
    id: "tuna-toast",
    title: "Tuna & Avocado Toast",
    emoji: "🥑",
    base_servings: 1,
    macros: { kcal: 380, carbs: 32, protein: 24, fat: 18 },
    ingredients: [
      { name: "Sourdough bread", amount: 2, unit: "slices" },
      { name: "Canned tuna", amount: 80, unit: "g" },
      { name: "Avocado", amount: 0.5, unit: "pc" },
      { name: "Lemon juice", amount: 1, unit: "tsp" },
      { name: "Olive oil", amount: 1, unit: "tsp" },
    ],
  },
  {
    id: "chicken-bowl",
    title: "Chicken Salad Bowl",
    emoji: "🥗",
    base_servings: 1,
    macros: { kcal: 520, carbs: 38, protein: 42, fat: 20 },
    ingredients: [
      { name: "Chicken breast", amount: 150, unit: "g" },
      { name: "Mixed greens", amount: 100, unit: "g" },
      { name: "Cherry tomatoes", amount: 80, unit: "g" },
      { name: "Quinoa", amount: 60, unit: "g" },
      { name: "Feta cheese", amount: 30, unit: "g" },
    ],
  },
  {
    id: "salmon-rice",
    title: "Salmon, Rice & Greens",
    emoji: "🐟",
    base_servings: 2,
    macros: { kcal: 680, carbs: 55, protein: 46, fat: 24 },
    ingredients: [
      { name: "Salmon fillet", amount: 200, unit: "g" },
      { name: "Jasmine rice", amount: 150, unit: "g" },
      { name: "Broccoli", amount: 200, unit: "g" },
      { name: "Soy sauce", amount: 2, unit: "tbsp" },
      { name: "Sesame seeds", amount: 1, unit: "tsp" },
    ],
  },
  {
    id: "berry-yogurt",
    title: "Berry Yogurt Bowl",
    emoji: "🫐",
    base_servings: 1,
    macros: { kcal: 220, carbs: 28, protein: 14, fat: 6 },
    ingredients: [
      { name: "Greek yogurt", amount: 200, unit: "g" },
      { name: "Blueberries", amount: 60, unit: "g" },
      { name: "Honey", amount: 1, unit: "tsp" },
      { name: "Granola", amount: 25, unit: "g" },
    ],
  },
  {
    id: "pasta-pesto",
    title: "Pesto Pasta Purrfect",
    emoji: "🍝",
    base_servings: 2,
    macros: { kcal: 590, carbs: 72, protein: 18, fat: 22 },
    ingredients: [
      { name: "Penne pasta", amount: 180, unit: "g" },
      { name: "Pesto sauce", amount: 60, unit: "g" },
      { name: "Parmesan", amount: 30, unit: "g" },
      { name: "Pine nuts", amount: 15, unit: "g" },
    ],
  },
  {
    id: "miso-soup",
    title: "Cozy Miso Soup",
    emoji: "🍜",
    base_servings: 1,
    macros: { kcal: 180, carbs: 18, protein: 12, fat: 6 },
    ingredients: [
      { name: "Miso paste", amount: 2, unit: "tbsp" },
      { name: "Tofu", amount: 100, unit: "g" },
      { name: "Wakame", amount: 5, unit: "g" },
      { name: "Spring onion", amount: 1, unit: "stalk" },
    ],
  },
];

const fmt = (n: number) => {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? r.toString() : r.toFixed(1);
};

export function RecipesView() {
  const [url, setUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [open, setOpen] = useState<Recipe | null>(null);

  const handleImport = () => {
    if (!url.trim()) return;
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      setUrl("");
    }, 1400);
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
          disabled={importing || !url.trim()}
          className="mt-2 w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition active:scale-95 disabled:opacity-50"
        >
          {importing ? "Fetching recipe… 🐈" : "Import with AI"}
        </button>
      </article>

      {/* Recipe Grid */}
      <h2 className="mt-6 mb-3 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        My Cookbook
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {RECIPES.map((r) => (
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
              <span className="font-medium text-primary">{r.macros.kcal}</span> kcal
              <span>·</span>
              <span>{r.base_servings} serv</span>
            </div>
          </button>
        ))}
      </div>

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
        {/* Header */}
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

        {/* Scrollable */}
        <div className="hide-scrollbar flex-1 overflow-y-auto px-5 pb-8">
          {/* Servings */}
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

          {/* Macros */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[
              { k: "Kcal", v: recipe.macros.kcal * mult, c: "text-primary" },
              { k: "Carbs", v: recipe.macros.carbs * mult, c: "text-foreground", u: "g" },
              { k: "Protein", v: recipe.macros.protein * mult, c: "text-foreground", u: "g" },
              { k: "Fat", v: recipe.macros.fat * mult, c: "text-foreground", u: "g" },
            ].map((m) => (
              <div key={m.k} className="rounded-2xl bg-accent/50 p-2.5 text-center">
                <p className={`text-base font-bold ${m.c}`}>{fmt(m.v)}{m.u ?? ""}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.k}</p>
              </div>
            ))}
          </div>

          {/* Ingredients */}
          <h3 className="mt-5 mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Ingredients
          </h3>
          <ul className="space-y-1.5">
            {recipe.ingredients.map((ing) => (
              <li
                key={ing.name}
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
