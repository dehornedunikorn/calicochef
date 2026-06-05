import { useEffect, useRef, useState } from "react";
import { Minus, Plus, X, Pencil, Trash2, ImagePlus, BookPlus, Loader2 } from "lucide-react";
import {
  useRecipes,
  useCreateRecipe,
  useUpdateRecipe,
  useDeleteRecipe,
  type Recipe,
  type Ingredient,
} from "@/lib/data-hooks";
import { supabase } from "@/integrations/supabase/client";
import { CalicoCat } from "@/components/calico";
import { toast } from "sonner";

const fmt = (n: number) => {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? r.toString() : r.toFixed(1);
};

const EMOJI_OPTIONS = ["🐟", "🥑", "🥗", "🍝", "🍜", "🍛", "🥘", "🍕", "🌮", "🍱", "🫐", "🍰", "🥪", "🍳", "🍣", "🍪"];

type RecipeDraft = {
  title: string;
  emoji: string;
  base_servings: number;
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
  ingredients: Ingredient[];
  steps: string[];
  cover_url: string | null;
};

const emptyDraft = (): RecipeDraft => ({
  title: "",
  emoji: "🐟",
  base_servings: 1,
  kcal: 0,
  carbs: 0,
  protein: 0,
  fat: 0,
  ingredients: [{ name: "", amount: 0, unit: "g" }],
  steps: [""],
  cover_url: null,
});

export function RecipesView() {
  const { data: recipes = [], isLoading } = useRecipes();
  const [open, setOpen] = useState<Recipe | null>(null);
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <>
      <button
        onClick={() => setCreating(true)}
        className="flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-br from-primary to-accent-foreground/80 py-4 text-sm font-bold text-primary-foreground shadow-lg ring-1 ring-primary/30 transition active:scale-95 hover:scale-[1.01]"
      >
        <BookPlus className="h-5 w-5" />
        Write a new recipe 🐾
      </button>

      <h2 className="mt-6 mb-3 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        My Cookbook
      </h2>
      {isLoading ? (
        <p className="text-center text-sm text-muted-foreground">Loading cookbook…</p>
      ) : recipes.length === 0 ? (
        <div className="grid place-items-center rounded-3xl bg-card p-8 text-center ring-1 ring-border/60">
          <div className="animate-bounce"><CalicoCat variant="smirk" size={88} /></div>
          <p className="mt-2 text-sm text-muted-foreground">No recipes yet — tap above to add one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {recipes.map((r) => (
            <RecipeCard
              key={r.id}
              recipe={r}
              onOpen={() => setOpen(r)}
              onEdit={() => setEditing(r)}
            />
          ))}
        </div>
      )}

      {open && <Cookbook recipe={open} onClose={() => setOpen(null)} />}
      {creating && (
        <RecipeEditor
          initial={emptyDraft()}
          title="New recipe"
          onClose={() => setCreating(false)}
        />
      )}
      {editing && (
        <RecipeEditor
          initial={{
            title: editing.title,
            emoji: editing.emoji,
            base_servings: editing.base_servings,
            kcal: editing.kcal,
            carbs: editing.carbs,
            protein: editing.protein,
            fat: editing.fat,
            ingredients: editing.ingredients.length ? editing.ingredients : [{ name: "", amount: 0, unit: "g" }],
            steps: editing.steps?.length ? editing.steps : [""],
            cover_url: editing.cover_url,
          }}
          recipeId={editing.id}
          title="Edit recipe"
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function RecipeCard({
  recipe,
  onOpen,
  onEdit,
}: {
  recipe: Recipe;
  onOpen: () => void;
  onEdit: () => void;
}) {
  const del = useDeleteRecipe();
  const [coverSrc, setCoverSrc] = useState<string | null>(null);
  useSignedCover(recipe.cover_url, setCoverSrc);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${recipe.title}"?`)) return;
    del.mutate(recipe.id, {
      onSuccess: () => toast.success("Recipe deleted 🐾"),
      onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
    });
  };

  return (
    <div className="group relative flex flex-col items-start rounded-3xl bg-card p-3 text-left ring-1 ring-border/60 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <button onClick={onOpen} className="contents text-left">
        <div className="relative grid h-24 w-full place-items-center overflow-hidden rounded-2xl bg-accent text-4xl">
          {coverSrc ? (
            <img src={coverSrc} alt={recipe.title} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span>{recipe.emoji}</span>
          )}
        </div>
        <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug">{recipe.title}</p>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
          <span className="font-medium text-primary">{recipe.kcal}</span> kcal
          <span>·</span>
          <span>{recipe.base_servings} serv</span>
        </div>
      </button>
      <div className="absolute right-2 top-2 flex gap-1 opacity-90">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="grid h-7 w-7 place-items-center rounded-full bg-background/90 ring-1 ring-border shadow active:scale-90"
          aria-label="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleDelete}
          disabled={del.isPending}
          className="grid h-7 w-7 place-items-center rounded-full bg-background/90 ring-1 ring-border shadow active:scale-90 text-destructive"
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function useSignedCover(path: string | null, setSrc: (s: string | null) => void) {
  useEffect(() => {
    let cancelled = false;
    if (!path) { setSrc(null); return; }
    supabase.storage.from("recipe-covers").createSignedUrl(path, 3600).then(({ data }) => {
      if (!cancelled) setSrc(data?.signedUrl ?? null);
    });
    return () => { cancelled = true; };
  }, [path, setSrc]);
}

function Cookbook({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  const [servings, setServings] = useState(recipe.base_servings);
  const mult = servings / recipe.base_servings;
  const [coverSrc, setCoverSrc] = useState<string | null>(null);
  useSignedCover(recipe.cover_url, setCoverSrc);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/60 backdrop-blur-sm animate-fade-in">
      <div className="mt-auto flex h-[92%] flex-col rounded-t-[2rem] bg-card shadow-2xl ring-1 ring-border/60 animate-slide-up">
        <div className="relative shrink-0 px-5 pb-3 pt-5">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
          <button
            onClick={onClose}
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-secondary z-10"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-accent text-4xl">
              {coverSrc ? <img src={coverSrc} alt="" className="h-full w-full object-cover" /> : recipe.emoji}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold leading-tight truncate">{recipe.title}</h2>
              <p className="text-xs text-muted-foreground">Cookbook · base {recipe.base_servings} serv</p>
            </div>
          </div>
        </div>

        <div className="hide-scrollbar flex-1 overflow-y-auto px-5 pb-8">
          <div className="mt-2 flex items-center justify-between rounded-2xl bg-secondary/60 p-3">
            <span className="text-sm font-semibold">Servings</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setServings((s) => Math.max(1, s - 1))} className="grid h-9 w-9 place-items-center rounded-full bg-card ring-1 ring-border active:scale-90" aria-label="Decrease">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center text-lg font-bold tabular-nums">{servings}</span>
              <button onClick={() => setServings((s) => Math.min(20, s + 1))} className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground active:scale-90" aria-label="Increase">
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

          <h3 className="mt-5 mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Ingredients</h3>
          <ul className="space-y-1.5">
            {recipe.ingredients.map((ing, i) => (
              <li key={`${ing.name}-${i}`} className="flex items-center justify-between rounded-2xl bg-secondary/40 px-3 py-2.5">
                <span className="text-sm">{ing.name}</span>
                <span className="text-sm font-semibold tabular-nums text-primary">
                  {fmt(ing.amount * mult)} {ing.unit}
                </span>
              </li>
            ))}
          </ul>

          {recipe.steps && recipe.steps.length > 0 && (
            <>
              <h3 className="mt-5 mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Steps</h3>
              <ol className="space-y-2">
                {recipe.steps.filter((s) => s.trim()).map((s, i) => (
                  <li key={i} className="flex gap-3 rounded-2xl bg-secondary/40 p-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed">{s}</span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RecipeEditor({
  initial,
  recipeId,
  title,
  onClose,
}: {
  initial: RecipeDraft;
  recipeId?: string;
  title: string;
  onClose: () => void;
}) {
  const [d, setD] = useState<RecipeDraft>(initial);
  const [coverSrc, setCoverSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  useSignedCover(d.cover_url, setCoverSrc);

  const create = useCreateRecipe();
  const update = useUpdateRecipe();
  const busy = create.isPending || update.isPending;

  const setField = <K extends keyof RecipeDraft>(k: K, v: RecipeDraft[K]) =>
    setD((p) => ({ ...p, [k]: v }));

  const updateIng = (i: number, patch: Partial<Ingredient>) =>
    setD((p) => ({ ...p, ingredients: p.ingredients.map((x, idx) => (idx === i ? { ...x, ...patch } : x)) }));

  const handleCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${u.user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("recipe-covers").upload(path, file, { upsert: false });
      if (error) throw error;
      setField("cover_url", path);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!d.title.trim()) { toast.error("Add a title 🐾"); return; }
    const payload: Omit<Recipe, "id"> = {
      ...d,
      title: d.title.trim(),
      base_servings: Math.max(1, d.base_servings || 1),
      ingredients: d.ingredients.filter((i) => i.name.trim()),
      steps: d.steps.filter((s) => s.trim()),
    };
    try {
      if (recipeId) {
        await update.mutateAsync({ id: recipeId, patch: payload });
        toast.success("Recipe updated 🐾");
      } else {
        await create.mutateAsync(payload);
        toast.success("Recipe saved 🐾");
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/60 backdrop-blur-sm animate-fade-in">
      <div className="mt-auto flex h-[95%] flex-col rounded-t-[2rem] bg-card shadow-2xl ring-1 ring-border/60 animate-slide-up">
        <div className="relative shrink-0 border-b border-border/40 px-5 pb-3 pt-5">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
          <button onClick={onClose} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-secondary" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
          <h2 className="text-lg font-bold">{title}</h2>
        </div>

        <div className="hide-scrollbar flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Cover */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cover photo (optional)</label>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="relative grid h-36 w-full place-items-center overflow-hidden rounded-2xl bg-accent ring-1 ring-border/60 transition active:scale-[0.99]"
            >
              {coverSrc ? (
                <img src={coverSrc} alt="cover" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-7 w-7" />}
                  <span className="mt-1 text-xs">{uploading ? "Uploading…" : "Tap to add a photo"}</span>
                </div>
              )}
            </button>
            {d.cover_url && (
              <button onClick={() => setField("cover_url", null)} className="mt-1 text-xs text-muted-foreground underline">
                Remove photo
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleCover} />
          </div>

          {/* Title + emoji */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</label>
            <input
              value={d.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Tuna purr-fection"
              className="w-full rounded-2xl bg-secondary/60 px-3 py-2.5 text-sm outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Emoji</label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setField("emoji", e)}
                  className={`grid h-9 w-9 place-items-center rounded-xl text-xl transition active:scale-90 ${d.emoji === e ? "bg-primary scale-110" : "bg-secondary"}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Servings + macros */}
          <div className="grid grid-cols-5 gap-2">
            {[
              { k: "base_servings", l: "Serv" },
              { k: "kcal", l: "Kcal" },
              { k: "carbs", l: "Carbs" },
              { k: "protein", l: "Protein" },
              { k: "fat", l: "Fat" },
            ].map(({ k, l }) => (
              <div key={k}>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center">{l}</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={(d[k as keyof RecipeDraft] as number) || ""}
                  onChange={(e) => setField(k as keyof RecipeDraft, Number(e.target.value) as never)}
                  className="mt-1 w-full rounded-xl bg-secondary/60 px-2 py-2 text-center text-sm tabular-nums outline-none"
                />
              </div>
            ))}
          </div>

          {/* Ingredients */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ingredients</label>
            <div className="space-y-2">
              {d.ingredients.map((ing, i) => (
                <div key={i} className="flex gap-1.5">
                  <input
                    value={ing.name}
                    onChange={(e) => updateIng(i, { name: e.target.value })}
                    placeholder="Name"
                    className="flex-1 rounded-xl bg-secondary/60 px-2.5 py-2 text-sm outline-none"
                  />
                  <input
                    type="number"
                    value={ing.amount || ""}
                    onChange={(e) => updateIng(i, { amount: Number(e.target.value) })}
                    placeholder="0"
                    className="w-16 rounded-xl bg-secondary/60 px-2 py-2 text-center text-sm tabular-nums outline-none"
                  />
                  <input
                    value={ing.unit}
                    onChange={(e) => updateIng(i, { unit: e.target.value })}
                    placeholder="g"
                    className="w-14 rounded-xl bg-secondary/60 px-2 py-2 text-center text-sm outline-none"
                  />
                  <button
                    onClick={() => setD((p) => ({ ...p, ingredients: p.ingredients.filter((_, idx) => idx !== i) }))}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-destructive"
                    aria-label="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setD((p) => ({ ...p, ingredients: [...p.ingredients, { name: "", amount: 0, unit: "g" }] }))}
                className="w-full rounded-xl border-2 border-dashed border-border py-2 text-xs font-medium text-muted-foreground active:scale-95"
              >
                + Add ingredient
              </button>
            </div>
          </div>

          {/* Steps */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Steps</label>
            <div className="space-y-2">
              {d.steps.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <span className="mt-2 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                  <textarea
                    value={s}
                    onChange={(e) => setD((p) => ({ ...p, steps: p.steps.map((x, idx) => (idx === i ? e.target.value : x)) }))}
                    placeholder="Describe this step…"
                    rows={2}
                    className="flex-1 resize-none rounded-xl bg-secondary/60 px-3 py-2 text-sm outline-none"
                  />
                  <button
                    onClick={() => setD((p) => ({ ...p, steps: p.steps.filter((_, idx) => idx !== i) }))}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-destructive"
                    aria-label="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setD((p) => ({ ...p, steps: [...p.steps, ""] }))}
                className="w-full rounded-xl border-2 border-dashed border-border py-2 text-xs font-medium text-muted-foreground active:scale-95"
              >
                + Add step
              </button>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-border/40 bg-card p-4">
          <button
            onClick={handleSave}
            disabled={busy || uploading}
            className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg active:scale-95 disabled:opacity-50"
          >
            {busy ? "Saving…" : recipeId ? "Save changes 🐾" : "Save recipe 🐾"}
          </button>
        </div>
      </div>
    </div>
  );
}
