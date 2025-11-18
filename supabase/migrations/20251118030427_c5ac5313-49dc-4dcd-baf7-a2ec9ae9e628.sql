-- Fix historical orders where bank_amount doesn't reflect discount
-- Update orders that have discount but bank_amount equals original product price
UPDATE orders o
SET bank_amount = p.price - COALESCE(o.discount_amount, 0)
FROM products p
WHERE o.product_id = p.id
  AND o.discount_amount > 0
  AND o.bank_amount IS NOT NULL
  AND o.bank_amount = p.price;

-- Create wallet logs for paid orders that don't have them yet
INSERT INTO wallet_logs (wallet_id, order_id, type, pi_amount, vnd_amount, status, description, release_date, created_at, updated_at)
SELECT 
  w.id as wallet_id,
  o.id as order_id,
  'earning' as type,
  FLOOR(o.bank_amount / 1000) as pi_amount,
  o.bank_amount as vnd_amount,
  'pending' as status,
  'Thu nhập từ đơn hàng ' || LEFT(o.id::text, 8) as description,
  o.created_at + INTERVAL '3 days' as release_date,
  NOW() as created_at,
  NOW() as updated_at
FROM orders o
JOIN products p ON o.product_id = p.id
JOIN wallets w ON w.user_id = p.seller_id
LEFT JOIN wallet_logs wl ON wl.order_id = o.id AND wl.type = 'earning'
WHERE o.status = 'paid'
  AND o.bank_amount IS NOT NULL
  AND o.bank_amount > 0
  AND o.payment_verified_at IS NOT NULL
  AND wl.id IS NULL;

-- Update wallet balances for sellers whose logs were just created
UPDATE wallets w
SET 
  pending = COALESCE((
    SELECT SUM(pi_amount)
    FROM wallet_logs
    WHERE wallet_id = w.id 
      AND status = 'pending'
      AND type = 'earning'
  ), 0),
  total_earned = COALESCE((
    SELECT SUM(pi_amount)
    FROM wallet_logs
    WHERE wallet_id = w.id 
      AND type = 'earning'
  ), 0),
  updated_at = NOW()
WHERE w.id IN (
  SELECT DISTINCT w2.id
  FROM wallets w2
  JOIN wallet_logs wl ON wl.wallet_id = w2.id
  WHERE wl.created_at >= NOW() - INTERVAL '1 minute'
);