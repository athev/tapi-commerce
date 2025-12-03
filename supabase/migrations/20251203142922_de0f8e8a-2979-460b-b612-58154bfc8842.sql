-- Create RPC function to increment product purchases atomically
CREATE OR REPLACE FUNCTION public.increment_product_purchases(p_product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE products
  SET 
    purchases = COALESCE(purchases, 0) + 1,
    purchases_last_7_days = COALESCE(purchases_last_7_days, 0) + 1,
    purchases_last_30_days = COALESCE(purchases_last_30_days, 0) + 1
  WHERE id = p_product_id;
END;
$$;

-- Backfill purchases count from existing paid orders
UPDATE products p
SET 
  purchases = (
    SELECT COUNT(*) FROM orders o 
    WHERE o.product_id = p.id AND o.status = 'paid'
  ),
  purchases_last_7_days = (
    SELECT COUNT(*) FROM orders o 
    WHERE o.product_id = p.id AND o.status = 'paid' 
    AND o.created_at >= NOW() - INTERVAL '7 days'
  ),
  purchases_last_30_days = (
    SELECT COUNT(*) FROM orders o 
    WHERE o.product_id = p.id AND o.status = 'paid' 
    AND o.created_at >= NOW() - INTERVAL '30 days'
  );