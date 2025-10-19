-- Add policy to protect profiles from anonymous access (defense in depth)
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;
CREATE POLICY "Deny anonymous access to profiles" 
ON public.profiles 
FOR SELECT 
TO anon
USING (false);

-- Create a helper function to sanitize buyer_data for sellers
-- This ensures sellers only see delivery-related information, not sensitive PII
CREATE OR REPLACE FUNCTION public.get_order_for_seller(order_id uuid, seller_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  order_record RECORD;
  sanitized_data jsonb;
BEGIN
  -- Fetch the order
  SELECT * INTO order_record
  FROM public.orders o
  INNER JOIN public.products p ON o.product_id = p.id
  WHERE o.id = order_id AND p.seller_id = seller_id;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Build sanitized order data without sensitive buyer_data fields
  -- Only include delivery-necessary information
  sanitized_data := jsonb_build_object(
    'id', order_record.id,
    'created_at', order_record.created_at,
    'updated_at', order_record.updated_at,
    'status', order_record.status,
    'delivery_status', order_record.delivery_status,
    'delivery_notes', order_record.delivery_notes,
    'product_id', order_record.product_id,
    'user_id', order_record.user_id,
    'payment_verified_at', order_record.payment_verified_at,
    'bank_amount', order_record.bank_amount,
    -- Only include buyer_email for order communication, not other sensitive data
    'buyer_email', order_record.buyer_email,
    -- Remove buyer_data entirely from seller view to prevent PII exposure
    'buyer_data_available', CASE WHEN order_record.buyer_data IS NOT NULL THEN true ELSE false END
  );
  
  RETURN sanitized_data;
END;
$$;

-- Add comment to document the security measure
COMMENT ON FUNCTION public.get_order_for_seller IS 
'Returns sanitized order data for sellers, filtering out sensitive buyer PII from buyer_data field. Sellers only receive delivery-necessary information.';

-- Strengthen license_keys protection with rate limiting hint
COMMENT ON TABLE public.license_keys IS 
'Contains product license keys. Protected by RLS - sellers can only access keys for their own products. Implement rate limiting at application level for additional security.';

-- Add index for better performance on seller license key queries
CREATE INDEX IF NOT EXISTS idx_license_keys_product_seller 
ON public.license_keys(product_id, is_used) 
WHERE assigned_to_order IS NULL;