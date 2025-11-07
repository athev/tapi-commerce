-- Add shop info columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar text,
ADD COLUMN IF NOT EXISTS shop_description text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS shop_banner text;

-- Create storage bucket for shop avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('shop-avatars', 'shop-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for shop-avatars bucket
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'shop-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'shop-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'shop-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'shop-avatars');