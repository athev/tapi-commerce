-- Create voucher_products table
CREATE TABLE IF NOT EXISTS public.voucher_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id uuid NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(voucher_id, product_id)
);

CREATE INDEX idx_voucher_products_voucher ON voucher_products(voucher_id);
CREATE INDEX idx_voucher_products_product ON voucher_products(product_id);

ALTER TABLE public.voucher_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for voucher_products
CREATE POLICY "Anyone can view voucher products"
  ON public.voucher_products FOR SELECT
  USING (true);

CREATE POLICY "Sellers can manage their voucher products"
  ON public.voucher_products FOR ALL
  USING (
    voucher_id IN (
      SELECT id FROM vouchers 
      WHERE created_by = auth.uid()
    )
  );

-- Create voucher_categories table
CREATE TABLE IF NOT EXISTS public.voucher_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id uuid NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
  category_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(voucher_id, category_name)
);

CREATE INDEX idx_voucher_categories_voucher ON voucher_categories(voucher_id);

ALTER TABLE public.voucher_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for voucher_categories
CREATE POLICY "Anyone can view voucher categories"
  ON public.voucher_categories FOR SELECT
  USING (true);

CREATE POLICY "Sellers can manage their voucher categories"
  ON public.voucher_categories FOR ALL
  USING (
    voucher_id IN (
      SELECT id FROM vouchers 
      WHERE created_by = auth.uid()
    )
  );

-- Update vouchers RLS policies
DROP POLICY IF EXISTS "Sellers can create vouchers" ON public.vouchers;
CREATE POLICY "Sellers can create vouchers" 
  ON public.vouchers FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Sellers can view own vouchers" ON public.vouchers;
CREATE POLICY "Sellers can view own vouchers"
  ON public.vouchers FOR SELECT
  USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Sellers can update own vouchers" ON public.vouchers;
CREATE POLICY "Sellers can update own vouchers"
  ON public.vouchers FOR UPDATE
  USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Sellers can delete own vouchers" ON public.vouchers;
CREATE POLICY "Sellers can delete own vouchers"
  ON public.vouchers FOR DELETE
  USING (auth.uid() = created_by);