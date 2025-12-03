-- Drop the existing check constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_delivery_status_check;

-- Add updated check constraint that includes 'completed'
ALTER TABLE public.orders ADD CONSTRAINT orders_delivery_status_check 
CHECK (delivery_status IN ('pending', 'processing', 'delivered', 'completed', 'failed'));