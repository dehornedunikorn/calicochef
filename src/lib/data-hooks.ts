import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Ingredient = { name: string; amount: number; unit: string };

export type Recipe = {
  id: string;
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

export type MealSlot = {
  id: string;
  day_idx: number;
  slot_key: string;
  name: string;
  pct: number;
  recipe_id: string | null;
  servings: number | null;
  sort_order: number;
};

export type Profile = {
  id: string;
  display_name: string | null;
  target_kcal: number;
};

export type Journal = {
  id: string;
  day_idx: number;
  text: string;
  hunger: number;
  mood: number;
  productivity: number;
};

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const DAYS_FULL = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// ---------- PROFILE ----------
export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, target_kcal")
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Profile not found");
      return data as Profile;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Pick<Profile, "target_kcal" | "display_name">>) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("profiles")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", u.user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

// ---------- RECIPES ----------
export function useRecipes() {
  return useQuery({
    queryKey: ["recipes"],
    queryFn: async (): Promise<Recipe[]> => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        ...r,
        ingredients: (r.ingredients as unknown as Ingredient[]) ?? [],
      })) as Recipe[];
    },
  });
}

export function useCreateRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (recipe: Omit<Recipe, "id">) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await supabase.from("recipes").insert({
        user_id: u.user.id,
        title: recipe.title,
        emoji: recipe.emoji,
        base_servings: recipe.base_servings,
        kcal: recipe.kcal,
        carbs: recipe.carbs,
        protein: recipe.protein,
        fat: recipe.fat,
        ingredients: recipe.ingredients as unknown as never,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recipes"] }),
  });
}

// ---------- MEAL SLOTS ----------
export function useMealSlots() {
  return useQuery({
    queryKey: ["meal_slots"],
    queryFn: async (): Promise<MealSlot[]> => {
      const { data, error } = await supabase
        .from("meal_slots")
        .select("id, day_idx, slot_key, name, pct, recipe_id, servings, sort_order")
        .order("day_idx", { ascending: true })
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MealSlot[];
    },
  });
}

export function useUpdateSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<Pick<MealSlot, "name" | "pct" | "recipe_id" | "servings">>;
    }) => {
      const { error } = await supabase.from("meal_slots").update(patch).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: ["meal_slots"] });
      const prev = qc.getQueryData<MealSlot[]>(["meal_slots"]);
      if (prev) {
        qc.setQueryData<MealSlot[]>(
          ["meal_slots"],
          prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        );
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["meal_slots"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["meal_slots"] }),
  });
}

// ---------- JOURNAL ----------
export function useJournal(day_idx: number) {
  return useQuery({
    queryKey: ["journal", day_idx],
    queryFn: async (): Promise<Journal> => {
      const { data, error } = await supabase
        .from("daily_journals")
        .select("id, day_idx, text, hunger, mood, productivity")
        .eq("day_idx", day_idx)
        .maybeSingle();
      if (error) throw error;
      if (data) return data as Journal;
      return {
        id: "",
        day_idx,
        text: "",
        hunger: 3,
        mood: 3,
        productivity: 3,
      };
    },
  });
}

export function useUpsertJournal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      patch: { day_idx: number } & Partial<
        Pick<Journal, "text" | "hunger" | "mood" | "productivity">
      >,
    ) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await supabase.from("daily_journals").upsert(
        {
          user_id: u.user.id,
          day_idx: patch.day_idx,
          ...(patch.text !== undefined ? { text: patch.text } : {}),
          ...(patch.hunger !== undefined ? { hunger: patch.hunger } : {}),
          ...(patch.mood !== undefined ? { mood: patch.mood } : {}),
          ...(patch.productivity !== undefined ? { productivity: patch.productivity } : {}),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,day_idx" },
      );
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["journal", vars.day_idx] });
    },
  });
}

export function mealKcal(slot: MealSlot, recipes: Recipe[]): number {
  if (!slot.recipe_id || !slot.servings) return 0;
  const r = recipes.find((x) => x.id === slot.recipe_id);
  if (!r) return 0;
  return (r.kcal * slot.servings) / r.base_servings;
}
