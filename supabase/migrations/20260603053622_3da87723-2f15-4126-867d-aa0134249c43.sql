
-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  target_kcal int NOT NULL DEFAULT 2000,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Recipes
CREATE TABLE public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  emoji text NOT NULL DEFAULT '🍽️',
  base_servings int NOT NULL DEFAULT 1,
  kcal int NOT NULL DEFAULT 0,
  carbs numeric NOT NULL DEFAULT 0,
  protein numeric NOT NULL DEFAULT 0,
  fat numeric NOT NULL DEFAULT 0,
  ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipes TO authenticated;
GRANT ALL ON public.recipes TO service_role;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own recipes all" ON public.recipes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Meal slots (one week, 4 default meals × 7 days)
CREATE TABLE public.meal_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_idx int NOT NULL CHECK (day_idx BETWEEN 0 AND 6),
  slot_key text NOT NULL,
  name text NOT NULL,
  pct int NOT NULL DEFAULT 25,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE SET NULL,
  servings numeric,
  sort_order int NOT NULL DEFAULT 0,
  UNIQUE(user_id, day_idx, slot_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_slots TO authenticated;
GRANT ALL ON public.meal_slots TO service_role;
ALTER TABLE public.meal_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own slots all" ON public.meal_slots FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Daily journals
CREATE TABLE public.daily_journals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_idx int NOT NULL CHECK (day_idx BETWEEN 0 AND 6),
  text text NOT NULL DEFAULT '',
  hunger int NOT NULL DEFAULT 3 CHECK (hunger BETWEEN 1 AND 5),
  mood int NOT NULL DEFAULT 3 CHECK (mood BETWEEN 1 AND 5),
  productivity int NOT NULL DEFAULT 3 CHECK (productivity BETWEEN 1 AND 5),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_idx)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_journals TO authenticated;
GRANT ALL ON public.daily_journals TO service_role;
ALTER TABLE public.daily_journals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own journals all" ON public.daily_journals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- New user bootstrap: profile + default recipes + default meal slots
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r1 uuid; r2 uuid; r3 uuid; r4 uuid; r5 uuid; r6 uuid;
  d int;
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));

  INSERT INTO public.recipes (user_id, title, emoji, base_servings, kcal, carbs, protein, fat, ingredients)
  VALUES (NEW.id, 'Tuna & Avocado Toast', '🥑', 1, 380, 32, 24, 18,
    '[{"name":"Sourdough bread","amount":2,"unit":"slices"},{"name":"Canned tuna","amount":80,"unit":"g"},{"name":"Avocado","amount":0.5,"unit":"pc"},{"name":"Lemon juice","amount":1,"unit":"tsp"},{"name":"Olive oil","amount":1,"unit":"tsp"}]'::jsonb)
  RETURNING id INTO r1;

  INSERT INTO public.recipes (user_id, title, emoji, base_servings, kcal, carbs, protein, fat, ingredients)
  VALUES (NEW.id, 'Chicken Salad Bowl', '🥗', 1, 520, 38, 42, 20,
    '[{"name":"Chicken breast","amount":150,"unit":"g"},{"name":"Mixed greens","amount":100,"unit":"g"},{"name":"Cherry tomatoes","amount":80,"unit":"g"},{"name":"Quinoa","amount":60,"unit":"g"},{"name":"Feta cheese","amount":30,"unit":"g"}]'::jsonb)
  RETURNING id INTO r2;

  INSERT INTO public.recipes (user_id, title, emoji, base_servings, kcal, carbs, protein, fat, ingredients)
  VALUES (NEW.id, 'Salmon, Rice & Greens', '🐟', 2, 680, 55, 46, 24,
    '[{"name":"Salmon fillet","amount":200,"unit":"g"},{"name":"Jasmine rice","amount":150,"unit":"g"},{"name":"Broccoli","amount":200,"unit":"g"},{"name":"Soy sauce","amount":2,"unit":"tbsp"},{"name":"Sesame seeds","amount":1,"unit":"tsp"}]'::jsonb)
  RETURNING id INTO r3;

  INSERT INTO public.recipes (user_id, title, emoji, base_servings, kcal, carbs, protein, fat, ingredients)
  VALUES (NEW.id, 'Berry Yogurt Bowl', '🫐', 1, 220, 28, 14, 6,
    '[{"name":"Greek yogurt","amount":200,"unit":"g"},{"name":"Blueberries","amount":60,"unit":"g"},{"name":"Honey","amount":1,"unit":"tsp"},{"name":"Granola","amount":25,"unit":"g"}]'::jsonb)
  RETURNING id INTO r4;

  INSERT INTO public.recipes (user_id, title, emoji, base_servings, kcal, carbs, protein, fat, ingredients)
  VALUES (NEW.id, 'Pesto Pasta Purrfect', '🍝', 2, 590, 72, 18, 22,
    '[{"name":"Penne pasta","amount":180,"unit":"g"},{"name":"Pesto sauce","amount":60,"unit":"g"},{"name":"Parmesan","amount":30,"unit":"g"},{"name":"Pine nuts","amount":15,"unit":"g"}]'::jsonb)
  RETURNING id INTO r5;

  INSERT INTO public.recipes (user_id, title, emoji, base_servings, kcal, carbs, protein, fat, ingredients)
  VALUES (NEW.id, 'Cozy Miso Soup', '🍜', 1, 180, 18, 12, 6,
    '[{"name":"Miso paste","amount":2,"unit":"tbsp"},{"name":"Tofu","amount":100,"unit":"g"},{"name":"Wakame","amount":5,"unit":"g"},{"name":"Spring onion","amount":1,"unit":"stalk"}]'::jsonb)
  RETURNING id INTO r6;

  FOR d IN 0..6 LOOP
    INSERT INTO public.meal_slots (user_id, day_idx, slot_key, name, pct, sort_order) VALUES
      (NEW.id, d, 'b', 'Breakfast', 25, 0),
      (NEW.id, d, 'l', 'Lunch', 40, 1),
      (NEW.id, d, 'd', 'Dinner', 25, 2),
      (NEW.id, d, 's', 'Snack', 10, 3);
  END LOOP;

  -- Seed a few sample assignments on Monday
  UPDATE public.meal_slots SET recipe_id = r4, servings = 1 WHERE user_id = NEW.id AND day_idx = 0 AND slot_key = 'b';
  UPDATE public.meal_slots SET recipe_id = r2, servings = 1 WHERE user_id = NEW.id AND day_idx = 0 AND slot_key = 'l';
  UPDATE public.meal_slots SET recipe_id = r3, servings = 2 WHERE user_id = NEW.id AND day_idx = 0 AND slot_key = 'd';

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
