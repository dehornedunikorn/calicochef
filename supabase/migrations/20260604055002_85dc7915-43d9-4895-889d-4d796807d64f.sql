CREATE POLICY "own recipe covers read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'recipe-covers' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own recipe covers insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'recipe-covers' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own recipe covers update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'recipe-covers' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own recipe covers delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'recipe-covers' AND (storage.foldername(name))[1] = auth.uid()::text);