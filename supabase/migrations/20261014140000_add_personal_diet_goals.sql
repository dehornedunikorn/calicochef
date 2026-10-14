-- Personal diet goals: additive and backwards-compatible profile fields.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age_years integer,
  ADD COLUMN IF NOT EXISTS height_cm numeric(5,1),
  ADD COLUMN IF NOT EXISTS weight_kg numeric(5,1),
  ADD COLUMN IF NOT EXISTS sex text,
  ADD COLUMN IF NOT EXISTS activity_level text NOT NULL DEFAULT 'moderate',
  ADD COLUMN IF NOT EXISTS goal_type text NOT NULL DEFAULT 'maintain',
  ADD COLUMN IF NOT EXISTS target_protein_g integer,
  ADD COLUMN IF NOT EXISTS target_carbs_g integer,
  ADD COLUMN IF NOT EXISTS target_fat_g integer;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_age_years_range CHECK (age_years IS NULL OR age_years BETWEEN 18 AND 100),
  ADD CONSTRAINT profiles_height_cm_range CHECK (height_cm IS NULL OR height_cm BETWEEN 100 AND 250),
  ADD CONSTRAINT profiles_weight_kg_range CHECK (weight_kg IS NULL OR weight_kg BETWEEN 30 AND 350),
  ADD CONSTRAINT profiles_sex_valid CHECK (sex IS NULL OR sex IN ('female', 'male')),
  ADD CONSTRAINT profiles_activity_level_valid CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  ADD CONSTRAINT profiles_goal_type_valid CHECK (goal_type IN ('lose', 'maintain', 'gain')),
  ADD CONSTRAINT profiles_target_protein_range CHECK (target_protein_g IS NULL OR target_protein_g BETWEEN 0 AND 500),
  ADD CONSTRAINT profiles_target_carbs_range CHECK (target_carbs_g IS NULL OR target_carbs_g BETWEEN 0 AND 1000),
  ADD CONSTRAINT profiles_target_fat_range CHECK (target_fat_g IS NULL OR target_fat_g BETWEEN 0 AND 500);
