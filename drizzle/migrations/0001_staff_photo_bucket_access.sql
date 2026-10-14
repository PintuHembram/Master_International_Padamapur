CREATE POLICY "Authenticated users can view staff photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'staff-photos');

CREATE POLICY "Admins can upload staff photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'staff-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update staff photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'staff-photos' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'staff-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete staff photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'staff-photos' AND public.has_role(auth.uid(), 'admin'));