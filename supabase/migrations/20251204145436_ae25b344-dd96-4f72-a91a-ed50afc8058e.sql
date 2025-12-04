-- Add warranty_period column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS warranty_period TEXT DEFAULT 'none';

-- Create warranty_claims table
CREATE TABLE IF NOT EXISTS public.warranty_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  conversation_id UUID REFERENCES public.conversations(id),
  
  -- Claim details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  claim_type TEXT NOT NULL DEFAULT 'repair',
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Timeline
  warranty_expires_at TIMESTAMPTZ NOT NULL,
  deadline_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  extended_deadline_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  
  -- Resolution
  resolution_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.warranty_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies for warranty_claims
CREATE POLICY "Buyers can create warranty claims for their orders"
ON public.warranty_claims
FOR INSERT
WITH CHECK (
  buyer_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = warranty_claims.order_id
    AND orders.user_id = auth.uid()
    AND orders.status = 'paid'
  )
);

CREATE POLICY "Buyers can view their own warranty claims"
ON public.warranty_claims
FOR SELECT
USING (buyer_id = auth.uid());

CREATE POLICY "Sellers can view warranty claims for their products"
ON public.warranty_claims
FOR SELECT
USING (seller_id = auth.uid());

CREATE POLICY "Sellers can update warranty claims for their products"
ON public.warranty_claims
FOR UPDATE
USING (seller_id = auth.uid());

CREATE POLICY "Buyers can update their pending claims"
ON public.warranty_claims
FOR UPDATE
USING (buyer_id = auth.uid() AND status IN ('pending', 'in_progress'));

CREATE POLICY "Admins can manage all warranty claims"
ON public.warranty_claims
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_warranty_claims_order_id ON public.warranty_claims(order_id);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_buyer_id ON public.warranty_claims(buyer_id);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_seller_id ON public.warranty_claims(seller_id);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_status ON public.warranty_claims(status);

-- Add warranty_claim to conversations chat_type
COMMENT ON COLUMN public.conversations.chat_type IS 'Chat types: product_consultation, product_inquiry, order_support, service_request, warranty_claim';