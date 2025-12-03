-- Allow admins to upload any file to shop-avatars bucket
CREATE POLICY "Admins can upload any file to shop-avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'shop-avatars' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update any file in shop-avatars bucket  
CREATE POLICY "Admins can update any file in shop-avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'shop-avatars' AND
  public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'shop-avatars' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete any file in shop-avatars bucket
CREATE POLICY "Admins can delete any file in shop-avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'shop-avatars' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);