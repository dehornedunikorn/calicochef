import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  searchExternalRecipes,
  getExternalRecipe,
  type ExternalRecipe,
  type SearchResult,
} from "./external-recipes.functions";
import { supabase } from "@/integrations/supabase/client";

export type SearchFilters = {
  q: string;
  search_in: "name" | "description" | "both";
  ingredients: string;
  cuisine: string;
  difficulty: "" | "easy" | "medium" | "hard";
  meal_type: string;
};

export const EMPTY_FILTERS: SearchFilters = {
  q: "",
  search_in: "both",
  ingredients: "",
  cuisine: "",
  difficulty: "",
  meal_type: "",
};

export function hasAnyFilter(f: SearchFilters) {
  return Boolean(
    f.q.trim() || f.ingredients.trim() || f.cuisine || f.difficulty || f.meal_type,
  );
}

export function useSearchExternal(filters: SearchFilters, enabled: boolean) {
  const fn = useServerFn(searchExternalRecipes);
  return useInfiniteQuery({
    queryKey: ["external-recipes", filters],
    enabled,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fn({
        data: {
          q: filters.q.trim(),
          search_in: filters.search_in,
          ingredients: filters.ingredients.trim(),
          cuisine: filters.cuisine,
          difficulty: filters.difficulty,
          meal_type: filters.meal_type,
          page: pageParam as number,
          per_page: 10,
        },
      }) as Promise<SearchResult>,
    getNextPageParam: (last) =>
      last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined,
    staleTime: 60_000,
  });
}

export function useExternalRecipe(id: number | null) {
  const fn = useServerFn(getExternalRecipe);
  return useQuery({
    queryKey: ["external-recipe", id],
    enabled: id != null,
    queryFn: () => fn({ data: { id: id! } }) as Promise<ExternalRecipe>,
    staleTime: 5 * 60_000,
  });
}

// ---------- FAVORITES (Supabase-persisted) ----------
export type FavoriteRow = { recipe_id: number; data: ExternalRecipe };

export function useFavorites() {
  return useQuery({
    queryKey: ["external-favorites"],
    queryFn: async (): Promise<FavoriteRow[]> => {
      const { data, error } = await supabase
        .from("external_favorites")
        .select("recipe_id, data")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        recipe_id: r.recipe_id as number,
        data: r.data as unknown as ExternalRecipe,
      }));
    },
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ recipe, favorited }: { recipe: ExternalRecipe; favorited: boolean }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      if (favorited) {
        const { error } = await supabase
          .from("external_favorites")
          .delete()
          .eq("user_id", u.user.id)
          .eq("recipe_id", recipe.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("external_favorites").upsert(
          {
            user_id: u.user.id,
            recipe_id: recipe.id,
            data: recipe as unknown as never,
          },
          { onConflict: "user_id,recipe_id" },
        );
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["external-favorites"] }),
  });
}
