import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BASE = "https://recipeapi.io/api/v1";

export type ExternalRecipeIngredient = {
  id: number;
  name: string;
  category?: string | null;
  quantity?: number | null;
  unit?: string | null;
  optional?: boolean | null;
};

export type ExternalRecipe = {
  id: number;
  name: string;
  description: string | null;
  difficulty: string | null;
  meal_type: string | null;
  cuisine: string | null;
  dietary_tags: string[];
  servings: number | null;
  prep_time: number | null;
  cook_time: number | null;
  calories_per_serving: number | null;
  protein: number | null;
  instructions: string[];
  ingredients: ExternalRecipeIngredient[];
};

export type SearchResult = {
  data: ExternalRecipe[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
};

const searchInput = z.object({
  q: z.string().max(120).optional().default(""),
  search_in: z.enum(["name", "description", "both"]).optional().default("both"),
  ingredients: z.string().max(200).optional().default(""),
  cuisine: z.string().max(40).optional().default(""),
  difficulty: z.enum(["", "easy", "medium", "hard"]).optional().default(""),
  meal_type: z.string().max(40).optional().default(""),
  page: z.number().int().min(1).max(200).optional().default(1),
  per_page: z.number().int().min(1).max(10).optional().default(10),
});

async function callApi(path: string, params: Record<string, string | number | undefined>) {
  const apiKey = process.env.RECIPE_API_KEY;
  if (!apiKey) throw new Error("Recipe search is not configured.");
  const url = new URL(`${BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== null) url.searchParams.set(k, String(v));
  });
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
  });
  if (res.status === 429) throw new Error("Recipe search is rate-limited. Try again in a moment.");
  if (res.status === 401) throw new Error("Recipe search authentication failed.");
  if (!res.ok) {
    let msg = `Recipe API error (${res.status})`;
    try {
      const j = (await res.json()) as { error?: { message?: string } };
      if (j?.error?.message) msg = j.error.message;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json();
}

export const searchExternalRecipes = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => searchInput.parse(d))
  .handler(async ({ data }): Promise<SearchResult> => {
    const json = (await callApi("/recipes", {
      search: data.q || undefined,
      search_in: data.q ? data.search_in : undefined,
      ingredients: data.ingredients || undefined,
      cuisine: data.cuisine || undefined,
      difficulty: data.difficulty || undefined,
      meal_type: data.meal_type || undefined,
      page: data.page,
      per_page: data.per_page,
    })) as { data: ExternalRecipe[]; meta: SearchResult["meta"] };
    return { data: json.data ?? [], meta: json.meta };
  });

export const getExternalRecipe = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.number().int().positive() }).parse(d))
  .handler(async ({ data }): Promise<ExternalRecipe> => {
    const json = (await callApi(`/recipes/${data.id}`, {})) as { data: ExternalRecipe };
    return json.data;
  });
