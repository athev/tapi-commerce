-- Create helper functions for tracking product interactions

-- Function to increment product views
CREATE OR REPLACE FUNCTION increment_product_views(product_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products
  SET views = COALESCE(views, 0) + 1
  WHERE id = product_id;
END;
$$;

-- Function to increment favorites count
CREATE OR REPLACE FUNCTION increment_favorites_count(product_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products
  SET favorites_count = COALESCE(favorites_count, 0) + 1
  WHERE id = product_id;
END;
$$;

-- Function to decrement favorites count
CREATE OR REPLACE FUNCTION decrement_favorites_count(product_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products
  SET favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0)
  WHERE id = product_id;
END;
$$;

-- Function to increment chat initiated count
CREATE OR REPLACE FUNCTION increment_chat_initiated(product_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products
  SET chat_initiated_count = COALESCE(chat_initiated_count, 0) + 1
  WHERE id = product_id;
END;
$$;

-- Function to update 7-day purchases (for cron)
CREATE OR REPLACE FUNCTION update_purchases_7d()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products p
  SET purchases_last_7_days = (
    SELECT COUNT(*)
    FROM orders o
    WHERE o.product_id = p.id
      AND o.status = 'paid'
      AND o.created_at >= NOW() - INTERVAL '7 days'
  );
END;
$$;

-- Function to update 30-day purchases (for cron)
CREATE OR REPLACE FUNCTION update_purchases_30d()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products p
  SET purchases_last_30_days = (
    SELECT COUNT(*)
    FROM orders o
    WHERE o.product_id = p.id
      AND o.status = 'paid'
      AND o.created_at >= NOW() - INTERVAL '30 days'
  );
END;
$$;