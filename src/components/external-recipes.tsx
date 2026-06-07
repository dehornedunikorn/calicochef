import { useEffect, useMemo, useState } from "react";
import { Search, X, Heart, Loader2, ChefHat, Clock, Flame, Filter } from "lucide-react";
import { CalicoCat } from "@/components/calico";
import {
  useExternalRecipe,
  useFavorites,
  useSearchExternal,
  useToggleFavorite,
  hasAnyFilter,
  EMPTY_FILTERS,
  type SearchFilters,
} from "@/lib/external-recipes-hooks";
import type { ExternalRecipe } from "@/lib/external-recipes.functions";
import { toast } from "sonner";

const CUISINES = [
  "", "american", "french", "greek", "italian", "japanese",
  "mexican", "portuguese", "spanish", "thai", "turkish",
];
const MEAL_TYPES = [
  "", "starter", "main", "dessert", "appetizer", "breakfast",
  "brunch", "snack", "side_dish", "soup", "drink", "sauce",
];

const CUISINE_EMOJI: Record<string, string> = {
  american: "🍔", french: "🥐", greek: "🥙", italian: "🍝", japanese: "🍣",
  mexican: "🌮", portuguese: "🐟", spanish: "🥘", thai: "🍜", turkish: "🥙",
};

function recipeArt(r: { id: number; cuisine: string | null; meal_type: string | null }) {
  const emoji =
    (r.cuisine && CUISINE_EMOJI[r.cuisine]) ||
    (r.meal_type === "dessert" ? "🍰" : r.meal_type === "drink" ? "🥤" : "🍽️");
  const hue = (r.id * 47) % 360;
  return {
    emoji,
    bg: `linear-gradient(135deg, hsl(${hue} 80% 88%), hsl(${(hue + 40) % 360} 80% 82%))`,
  };
}

export function ExternalRecipesPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"search" | "favorites">("search");
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [submitted, setSubmitted] = useState<SearchFilters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const enabled = hasAnyFilter(submitted);
  const search = useSearchExternal(submitted, enabled);

  // debounce text/ingredient changes; immediate dropdown changes
  useEffect(() => {
    const t = setTimeout(() => setSubmitted(filters), 400);
    return () => clearTimeout(t);
  }, [filters]);

  const allResults = useMemo(
    () => search.data?.pages.flatMap((p) => p.data) ?? [],
    [search.data],
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/60 backdrop-blur-sm animate-fade-in">
      <div className="mt-auto flex h-[95%] flex-col rounded-t-[2rem] bg-card shadow-2xl ring-1 ring-border/60 animate-slide-up">
        <div className="relative shrink-0 border-b border-border/40 px-5 pb-3 pt-5">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
          <button onClick={onClose} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-secondary" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
          <h2 className="text-lg font-bold">Discover recipes 🐾</h2>
          <div className="mt-3 flex gap-1.5 rounded-full bg-secondary/60 p-1">
            <TabBtn active={tab === "search"} onClick={() => setTab("search")}>Search</TabBtn>
            <TabBtn active={tab === "favorites"} onClick={() => setTab("favorites")}>
              <Heart className="h-3.5 w-3.5 inline -mt-0.5 mr-1 fill-current" />
              Favorites
            </TabBtn>
          </div>
        </div>

        {tab === "search" ? (
          <>
            <div className="shrink-0 space-y-2 border-b border-border/40 px-5 pb-3 pt-3">
              <div className="flex items-center gap-2 rounded-full bg-secondary/60 px-3.5 py-2.5">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={filters.q}
                  onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                  placeholder="Search by name, description…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                {filters.q && (
                  <button onClick={() => setFilters((f) => ({ ...f, q: "" }))} aria-label="Clear">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
                <button
                  onClick={() => setShowFilters((s) => !s)}
                  className={`grid h-7 w-7 place-items-center rounded-full transition ${showFilters ? "bg-primary text-primary-foreground" : "bg-background"}`}
                  aria-label="Filters"
                >
                  <Filter className="h-3.5 w-3.5" />
                </button>
              </div>

              {showFilters && (
                <div className="space-y-2 rounded-2xl bg-secondary/40 p-3 animate-fade-in">
                  <input
                    value={filters.ingredients}
                    onChange={(e) => setFilters((f) => ({ ...f, ingredients: e.target.value }))}
                    placeholder="Ingredients (comma-separated)"
                    className="w-full rounded-xl bg-card px-3 py-2 text-sm outline-none"
                  />
                  <div className="grid grid-cols-3 gap-1.5">
                    <FilterSelect
                      value={filters.cuisine}
                      onChange={(v) => setFilters((f) => ({ ...f, cuisine: v }))}
                      label="Cuisine"
                      options={CUISINES}
                    />
                    <FilterSelect
                      value={filters.meal_type}
                      onChange={(v) => setFilters((f) => ({ ...f, meal_type: v }))}
                      label="Meal"
                      options={MEAL_TYPES}
                    />
                    <FilterSelect
                      value={filters.difficulty}
                      onChange={(v) => setFilters((f) => ({ ...f, difficulty: v as SearchFilters["difficulty"] }))}
                      label="Level"
                      options={["", "easy", "medium", "hard"]}
                    />
                  </div>
                  {hasAnyFilter(filters) && (
                    <button
                      onClick={() => setFilters(EMPTY_FILTERS)}
                      className="text-xs text-muted-foreground underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="hide-scrollbar flex-1 overflow-y-auto px-5 pb-8 pt-3">
              {!enabled ? (
                <EmptyState
                  variant="sleepy"
                  title="Sniff out something tasty"
                  hint="Search by name, ingredient, or pick a cuisine to start."
                />
              ) : search.isLoading ? (
                <LoadingState />
              ) : search.isError ? (
                <ErrorState
                  message={search.error instanceof Error ? search.error.message : "Search failed"}
                  onRetry={() => search.refetch()}
                />
              ) : allResults.length === 0 ? (
                <EmptyState
                  variant="sad"
                  title="No recipes found"
                  hint="Try different keywords or remove a filter."
                />
              ) : (
                <>
                  <p className="mb-2 text-xs text-muted-foreground">
                    {search.data?.pages[0]?.meta.total ?? 0} purr-fect matches
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {allResults.map((r) => (
                      <ResultCard key={r.id} recipe={r} onOpen={() => setDetailId(r.id)} />
                    ))}
                  </div>
                  {search.hasNextPage && (
                    <button
                      onClick={() => search.fetchNextPage()}
                      disabled={search.isFetchingNextPage}
                      className="mt-4 w-full rounded-full bg-secondary py-3 text-sm font-semibold active:scale-95 disabled:opacity-50"
                    >
                      {search.isFetchingNextPage ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Loading more…
                        </span>
                      ) : (
                        "Load more"
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <FavoritesPanel onOpen={(id) => setDetailId(id)} />
        )}
      </div>

      {detailId != null && (
        <RecipeDetail id={detailId} onClose={() => setDetailId(null)} />
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-full py-1.5 text-xs font-bold transition ${
        active ? "bg-card text-foreground shadow ring-1 ring-border" : "text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function FilterSelect({
  value, onChange, label, options,
}: { value: string; onChange: (v: string) => void; label: string; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl bg-card px-2 py-2 text-xs outline-none"
      aria-label={label}
    >
      {options.map((o) => (
        <option key={o} value={o}>{o ? o.replace(/_/g, " ") : `Any ${label.toLowerCase()}`}</option>
      ))}
    </select>
  );
}

function ResultCard({ recipe, onOpen }: { recipe: ExternalRecipe; onOpen: () => void }) {
  const { data: favs } = useFavorites();
  const toggle = useToggleFavorite();
  const favorited = !!favs?.some((f) => f.recipe_id === recipe.id);
  const art = recipeArt(recipe);

  return (
    <div className="group relative flex flex-col rounded-3xl bg-card p-3 text-left ring-1 ring-border/60 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <button onClick={onOpen} className="contents text-left">
        <div
          className="relative grid h-24 w-full place-items-center overflow-hidden rounded-2xl text-4xl"
          style={{ background: art.bg }}
        >
          <span>{art.emoji}</span>
          {recipe.difficulty && (
            <span className="absolute left-1.5 top-1.5 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-semibold capitalize">
              {recipe.difficulty}
            </span>
          )}
        </div>
        <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug">{recipe.name}</p>
        {recipe.description && (
          <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground leading-snug">
            {recipe.description}
          </p>
        )}
        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          {recipe.prep_time != null && (
            <span className="inline-flex items-center gap-0.5">
              <Clock className="h-3 w-3" /> {recipe.prep_time}m
            </span>
          )}
          {recipe.calories_per_serving != null && (
            <span className="inline-flex items-center gap-0.5">
              <Flame className="h-3 w-3" /> {recipe.calories_per_serving}
            </span>
          )}
        </div>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggle.mutate(
            { recipe, favorited },
            {
              onSuccess: () => toast.success(favorited ? "Removed from favorites" : "Saved to favorites 💛"),
              onError: (err) => toast.error(err instanceof Error ? err.message : "Failed"),
            },
          );
        }}
        disabled={toggle.isPending}
        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/90 ring-1 ring-border shadow active:scale-90"
        aria-label={favorited ? "Remove favorite" : "Add favorite"}
      >
        <Heart className={`h-4 w-4 transition ${favorited ? "fill-primary text-primary" : "text-foreground"}`} />
      </button>
    </div>
  );
}

function FavoritesPanel({ onOpen }: { onOpen: (id: number) => void }) {
  const { data: favs = [], isLoading } = useFavorites();
  return (
    <div className="hide-scrollbar flex-1 overflow-y-auto px-5 pb-8 pt-3">
      {isLoading ? (
        <LoadingState />
      ) : favs.length === 0 ? (
        <EmptyState
          variant="smirk"
          title="No favorites yet"
          hint="Tap the heart on any recipe to save it here."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {favs.map((f) => (
            <ResultCard key={f.recipe_id} recipe={f.data} onOpen={() => onOpen(f.recipe_id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function RecipeDetail({ id, onClose }: { id: number; onClose: () => void }) {
  const { data: favs } = useFavorites();
  const { data, isLoading, isError, error, refetch } = useExternalRecipe(id);
  const toggle = useToggleFavorite();
  const favorited = !!favs?.some((f) => f.recipe_id === id);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background/70 backdrop-blur-sm animate-fade-in">
      <div className="mt-auto flex h-[92%] flex-col rounded-t-[2rem] bg-card shadow-2xl ring-1 ring-border/60 animate-slide-up">
        <div className="relative shrink-0 px-5 pb-3 pt-5">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
          <button onClick={onClose} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-secondary z-10" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
          {data && (
            <button
              onClick={() => toggle.mutate({ recipe: data, favorited })}
              disabled={toggle.isPending}
              className="absolute right-16 top-4 grid h-9 w-9 place-items-center rounded-full bg-secondary z-10"
              aria-label="Favorite"
            >
              <Heart className={`h-4 w-4 ${favorited ? "fill-primary text-primary" : ""}`} />
            </button>
          )}
        </div>

        <div className="hide-scrollbar flex-1 overflow-y-auto px-5 pb-8">
          {isLoading ? (
            <LoadingState />
          ) : isError ? (
            <ErrorState
              message={error instanceof Error ? error.message : "Failed to load"}
              onRetry={() => refetch()}
            />
          ) : data ? (
            <>
              {(() => {
                const art = recipeArt(data);
                return (
                  <div className="grid h-44 w-full place-items-center overflow-hidden rounded-3xl text-7xl"
                    style={{ background: art.bg }}>
                    <span>{art.emoji}</span>
                  </div>
                );
              })()}
              <h2 className="mt-3 text-xl font-bold leading-tight">{data.name}</h2>
              {data.description && (
                <p className="mt-1 text-sm text-muted-foreground">{data.description}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {data.cuisine && <Chip>{data.cuisine}</Chip>}
                {data.meal_type && <Chip>{data.meal_type.replace(/_/g, " ")}</Chip>}
                {data.difficulty && <Chip>{data.difficulty}</Chip>}
                {data.dietary_tags?.map((t) => (
                  <Chip key={t}>{t.replace(/_/g, " ")}</Chip>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2">
                <Stat icon={<Clock className="h-3.5 w-3.5" />} label="Prep" value={data.prep_time != null ? `${data.prep_time}m` : "—"} />
                <Stat icon={<ChefHat className="h-3.5 w-3.5" />} label="Cook" value={data.cook_time != null ? `${data.cook_time}m` : "—"} />
                <Stat icon={<Flame className="h-3.5 w-3.5" />} label="Kcal" value={data.calories_per_serving != null ? `${data.calories_per_serving}` : "—"} />
                <Stat label="Protein" value={data.protein != null ? `${data.protein}g` : "—"} />
              </div>

              <h3 className="mt-5 mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Ingredients {data.servings ? `· ${data.servings} serv` : ""}
              </h3>
              <ul className="space-y-1.5">
                {data.ingredients.map((ing, i) => (
                  <li key={`${ing.id}-${i}`} className="flex items-center justify-between rounded-2xl bg-secondary/40 px-3 py-2.5">
                    <span className="text-sm">
                      {ing.name}
                      {ing.optional && <span className="ml-1 text-[10px] text-muted-foreground">(optional)</span>}
                    </span>
                    {ing.quantity != null && (
                      <span className="text-sm font-semibold tabular-nums text-primary">
                        {ing.quantity} {ing.unit ?? ""}
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              {data.instructions?.length > 0 && (
                <>
                  <h3 className="mt-5 mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Steps</h3>
                  <ol className="space-y-2">
                    {data.instructions.map((s, i) => (
                      <li key={i} className="flex gap-3 rounded-2xl bg-secondary/40 p-3">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                        <span className="text-sm leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-accent/70 px-2.5 py-1 text-[11px] font-semibold capitalize">{children}</span>;
}

function Stat({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-accent/50 p-2.5 text-center">
      <p className="text-base font-bold tabular-nums">{value}</p>
      <p className="mt-0.5 flex items-center justify-center gap-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid place-items-center py-12 text-muted-foreground">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      <p className="mt-2 text-sm">Catching some recipes…</p>
    </div>
  );
}

function EmptyState({
  variant, title, hint,
}: { variant: "sleepy" | "sad" | "smirk"; title: string; hint: string }) {
  return (
    <div className="grid place-items-center rounded-3xl bg-card p-8 text-center ring-1 ring-border/60">
      <CalicoCat variant={variant} size={88} />
      <p className="mt-2 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="grid place-items-center rounded-3xl bg-destructive/10 p-8 text-center ring-1 ring-destructive/30">
      <CalicoCat variant="sad" size={72} />
      <p className="mt-2 text-sm font-semibold text-destructive">Hiss! Something went wrong</p>
      <p className="mt-1 text-xs text-muted-foreground">{message}</p>
      <button onClick={onRetry} className="mt-3 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground active:scale-95">
        Try again
      </button>
    </div>
  );
}
