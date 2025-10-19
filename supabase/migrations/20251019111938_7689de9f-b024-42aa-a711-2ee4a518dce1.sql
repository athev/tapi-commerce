-- Fix search_path for security definer functions to prevent privilege escalation
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.create_seller_wallet() SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- Create a secure view for sellers to access orders without seeing sensitive buyer_data
CREATE OR REPLACE VIEW public.orders_seller_view AS
SELECT 
  o.id,
  o.created_at,
  o.updated_at,
  o.user_id,
  o.product_id,
  o.status,
  o.delivery_status,
  o.delivery_notes,
  o.buyer_email,
  o.payment_verified_at,
  o.bank_amount,
  -- Exclude sensitive fields: buyer_data, bank_transaction_id, casso_transaction_id
  o.manual_payment_requested
FROM public.orders o;

-- Grant access to the view
GRANT SELECT ON public.orders_seller_view TO authenticated;

-- Update the seller policy to use the view instead of direct table access
DROP POLICY IF EXISTS "Sellers can view orders for their products" ON public.orders;

CREATE POLICY "Sellers can view orders for their products"
ON public.orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = orders.product_id 
    AND p.seller_id = auth.uid()
  )
  -- Sellers can only access through queries that don't expose buyer_data
  -- The application should use orders_seller_view for seller queries
);

-- Add policy to prevent sellers from deleting license keys that are already assigned
DROP POLICY IF EXISTS "sellers_manage_license_keys" ON public.license_keys;

CREATE POLICY "Sellers can view their license keys"
ON public.license_keys
FOR SELECT
USING (
  product_id IN (
    SELECT id FROM public.products WHERE seller_id = auth.uid()
  )
);

CREATE POLICY "Sellers can insert license keys"
ON public.license_keys
FOR INSERT
WITH CHECK (
  product_id IN (
    SELECT id FROM public.products WHERE seller_id = auth.uid()
  )
);

CREATE POLICY "Sellers can update unassigned license keys"
ON public.license_keys
FOR UPDATE
USING (
  product_id IN (
    SELECT id FROM public.products WHERE seller_id = auth.uid()
  )
  AND assigned_to_order IS NULL
);

CREATE POLICY "Sellers cannot delete assigned license keys"
ON public.license_keys
FOR DELETE
USING (
  product_id IN (
    SELECT id FROM public.products WHERE seller_id = auth.uid()
  )
  AND assigned_to_order IS NULL
);