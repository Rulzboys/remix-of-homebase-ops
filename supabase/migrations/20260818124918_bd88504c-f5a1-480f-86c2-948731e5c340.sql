CREATE POLICY "docs_read_authenticated" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('documentation','properties'));
CREATE POLICY "docs_insert_authenticated" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('documentation','properties') AND owner = auth.uid());
CREATE POLICY "docs_update_own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('documentation','properties') AND owner = auth.uid());
CREATE POLICY "docs_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('documentation','properties') AND owner = auth.uid());