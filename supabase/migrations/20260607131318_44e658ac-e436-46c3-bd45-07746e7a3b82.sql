CREATE TABLE public.external_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recipe_id integer NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, recipe_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.external_favorites TO authenticated;
GRANT ALL ON public.external_favorites TO service_role;

ALTER TABLE public.external_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own favorites all" ON public.external_favorites
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX external_favorites_user_idx ON public.external_favorites (user_id);