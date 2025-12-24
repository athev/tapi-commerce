-- Create shop_follows table for following sellers/shops
CREATE TABLE public.shop_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, seller_id)
);

-- Enable Row Level Security
ALTER TABLE public.shop_follows ENABLE ROW LEVEL SECURITY;

-- Users can view their own follows
CREATE POLICY "Users can view their own follows"
ON public.shop_follows
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own follows
CREATE POLICY "Users can insert their own follows"
ON public.shop_follows
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own follows
CREATE POLICY "Users can delete their own follows"
ON public.shop_follows
FOR DELETE
USING (auth.uid() = user_id);

-- Anyone can count follows for a seller (public count)
CREATE POLICY "Anyone can count seller follows"
ON public.shop_follows
FOR SELECT
USING (true);

-- Add followers_count column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS followers_count integer DEFAULT 0;