
-- Cập nhật đơn hàng completed với delivery_notes và payment_verified_at test
UPDATE orders 
SET 
  delivery_notes = 'User: demo@example.com
Pass: SecurePass123',
  payment_verified_at = NOW() - INTERVAL '3 days'
WHERE id IN (
  '5fc8494c-35da-4596-a530-b1b4b97c18bf',
  '334b1cc3-1b68-4540-b453-d1e83e5b5cfe',
  '5ee83daf-7663-46e8-a085-698b7229d5ce'
);

-- Cập nhật sản phẩm liên quan để có warranty_period 30 ngày
UPDATE products 
SET warranty_period = '30_days'
WHERE id = '435d36b2-1fde-4013-9186-7950dbce5799';
