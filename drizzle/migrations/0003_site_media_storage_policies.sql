CREATE POLICY "Staff upload site media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-media' AND public.is_staff(auth.uid())
    AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp','gif','mp4','webm','mov','pdf','doc','docx','xls','xlsx','ppt','pptx'));
CREATE POLICY "Staff read site media" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'site-media' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff update site media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'site-media' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff delete site media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site-media' AND public.is_staff(auth.uid()));