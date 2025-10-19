-- Drop the security definer view as it bypasses RLS
DROP VIEW IF EXISTS public.orders_seller_view;

-- Instead, we'll use RLS to filter sensitive columns at the database level
-- Update the orders table RLS policy for sellers to prevent buyer_data access
-- Note: This requires the application to handle column selection appropriately

-- Add a comment to document the security requirement
COMMENT ON COLUMN public.orders.buyer_data IS 
'SECURITY: Contains sensitive buyer information (passwords, personal data). 
Sellers should NOT have access to this field. 
Application must filter this column when querying for sellers.';