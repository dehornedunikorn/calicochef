ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS steps text[] NOT NULL DEFAULT '{}'::text[];
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS cover_url text;