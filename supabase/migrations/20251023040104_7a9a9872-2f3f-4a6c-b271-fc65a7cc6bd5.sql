-- Phase 4: Advanced Features Database Schema

-- 1. Product Variants Table
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  variant_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  original_price INTEGER,
  discount_percentage INTEGER,
  badge TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_variants
CREATE POLICY "Anyone can view active variants"
  ON public.product_variants
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Sellers can manage their product variants"
  ON public.product_variants
  FOR ALL
  USING (
    product_id IN (
      SELECT id FROM public.products WHERE seller_id = auth.uid()
    )
  );

-- 2. Vouchers Table
CREATE TABLE IF NOT EXISTS public.vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value INTEGER NOT NULL,
  min_purchase_amount INTEGER DEFAULT 0,
  max_discount_amount INTEGER,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  applicable_to TEXT DEFAULT 'all' CHECK (applicable_to IN ('all', 'specific_products', 'specific_categories')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vouchers
CREATE POLICY "Anyone can view active vouchers"
  ON public.vouchers
  FOR SELECT
  USING (
    is_active = true 
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until >= NOW())
    AND (usage_limit IS NULL OR used_count < usage_limit)
  );

CREATE POLICY "Sellers and admins can manage vouchers"
  ON public.vouchers
  FOR ALL
  USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role));

-- 3. Shopping Cart Table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id, variant_id)
);

-- Enable RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cart_items
CREATE POLICY "Users can view their own cart"
  ON public.cart_items
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own cart"
  ON public.cart_items
  FOR ALL
  USING (auth.uid() = user_id);

-- 4. Add voucher support to orders
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS voucher_id UUID REFERENCES public.vouchers(id),
  ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON public.product_variants(is_active);
CREATE INDEX IF NOT EXISTS idx_vouchers_code ON public.vouchers(code);
CREATE INDEX IF NOT EXISTS idx_vouchers_active ON public.vouchers(is_active);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_voucher_id ON public.orders(voucher_id);

-- 6. Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Add triggers for updated_at
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vouchers_updated_at
  BEFORE UPDATE ON public.vouchers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();