-- Create reviews table for product reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  variant_name TEXT,
  seller_response TEXT,
  seller_response_at TIMESTAMP WITH TIME ZONE,
  helpful_count INTEGER DEFAULT 0,
  pi_rewarded BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(order_id, user_id)
);

-- Create buyer_wallets table for PI balance
CREATE TABLE public.buyer_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  pi_balance NUMERIC NOT NULL DEFAULT 0,
  total_earned NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create buyer_pi_logs table for PI transaction history
CREATE TABLE public.buyer_pi_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_wallet_id UUID NOT NULL REFERENCES public.buyer_wallets(id) ON DELETE CASCADE,
  review_id UUID REFERENCES public.reviews(id) ON DELETE SET NULL,
  voucher_id UUID REFERENCES public.vouchers(id) ON DELETE SET NULL,
  pi_amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('review_reward', 'voucher_redemption')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_pi_logs ENABLE ROW LEVEL SECURITY;

-- Reviews RLS policies
CREATE POLICY "Anyone can view reviews"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Users can create reviews for their orders"
ON public.reviews FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_id
    AND orders.user_id = auth.uid()
    AND orders.status = 'paid'
  )
);

CREATE POLICY "Users can update their own reviews"
ON public.reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Sellers can respond to reviews on their products"
ON public.reviews FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = reviews.product_id
    AND products.seller_id = auth.uid()
  )
);

-- Buyer wallets RLS policies
CREATE POLICY "Users can view their own wallet"
ON public.buyer_wallets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert buyer wallets"
ON public.buyer_wallets FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update buyer wallets"
ON public.buyer_wallets FOR UPDATE
WITH CHECK (true);

-- Buyer PI logs RLS policies
CREATE POLICY "Users can view their own PI logs"
ON public.buyer_pi_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.buyer_wallets
    WHERE buyer_wallets.id = buyer_pi_logs.buyer_wallet_id
    AND buyer_wallets.user_id = auth.uid()
  )
);

CREATE POLICY "System can insert PI logs"
ON public.buyer_pi_logs FOR INSERT
WITH CHECK (true);

-- Create function to update product rating stats
CREATE OR REPLACE FUNCTION public.update_product_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating)::NUMERIC(3,2), 5.0)
      FROM public.reviews
      WHERE product_id = NEW.product_id
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE product_id = NEW.product_id
    )
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for updating product stats
CREATE TRIGGER update_product_stats_on_review
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_product_review_stats();

-- Create indexes for performance
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_buyer_wallets_user_id ON public.buyer_wallets(user_id);
CREATE INDEX idx_buyer_pi_logs_wallet_id ON public.buyer_pi_logs(buyer_wallet_id);