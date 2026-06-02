import { createContext, useContext, useState, type ReactNode } from "react";
import { RECIPES } from "@/components/recipes-view";

export type MealSlot = {
  id: string;
  name: string;
  pct: number;
  recipeId?: string;
  servings?: number;
};

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DEFAULT_SLOTS = (): MealSlot[] => [
  { id: "b", name: "Breakfast", pct: 25 },
  { id: "l", name: "Lunch", pct: 40 },
  { id: "d", name: "Dinner", pct: 25 },
  { id: "s", name: "Snack", pct: 10 },
];

const seedWeek = (): MealSlot[][] => {
  const w = DAYS.map(() => DEFAULT_SLOTS());
  // Seed a few meals so Shopping has something to show
  const pairs: Array<[number, string, string]> = [
    [0, "b", "berry-yogurt"],
    [0, "l", "chicken-bowl"],
    [0, "d", "salmon-rice"],
    [1, "l", "tuna-toast"],
    [2, "d", "pasta-pesto"],
    [3, "l", "chicken-bowl"],
    [4, "d", "salmon-rice"],
  ];
  for (const [di, sid, rid] of pairs) {
    const r = RECIPES.find((x) => x.id === rid);
    if (!r) continue;
    const slot = w[di].find((s) => s.id === sid);
    if (slot) {
      slot.recipeId = rid;
      slot.servings = r.base_servings;
    }
  }
  return w;
};

type Ctx = {
  dailyTarget: number;
  setDailyTarget: (n: number) => void;
  week: MealSlot[][];
  setWeek: React.Dispatch<React.SetStateAction<MealSlot[][]>>;
};

const AppStateCtx = createContext<Ctx | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [dailyTarget, setDailyTarget] = useState(2000);
  const [week, setWeek] = useState<MealSlot[][]>(() => seedWeek());
  return (
    <AppStateCtx.Provider value={{ dailyTarget, setDailyTarget, week, setWeek }}>
      {children}
    </AppStateCtx.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateCtx);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
