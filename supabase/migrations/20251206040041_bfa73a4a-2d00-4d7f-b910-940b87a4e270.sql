
-- Insert reviews for orders that don't have reviews yet
INSERT INTO reviews (product_id, order_id, user_id, rating, comment, created_at)
SELECT 
  o.product_id,
  o.id,
  o.user_id,
  5,
  (ARRAY[
    'Sản phẩm chất lượng, giao ngay! Rất hài lòng',
    'Hỗ trợ nhiệt tình, sử dụng tốt',
    'Giá rẻ hơn mua chính hãng nhiều, chất lượng như nhau',
    'Đã mua nhiều lần, lần nào cũng ok',
    'Giao dịch nhanh chóng, tài khoản hoạt động tốt',
    'Shop uy tín, sẽ ủng hộ tiếp',
    'Tuyệt vời! Dùng được ngay sau khi thanh toán',
    'Cảm ơn shop, sản phẩm đúng mô tả',
    'Rất đáng tiền, recommend cho mọi người',
    'Mình dùng được 3 tháng rồi, vẫn ok nhé'
  ])[floor(random()*10+1)::int],
  o.created_at + interval '2 days'
FROM orders o
JOIN products p ON o.product_id = p.id
WHERE p.seller_id = 'd4f5736a-be1d-492b-a72d-97d1a6cdcde8'::uuid
  AND o.status = 'paid'
  AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.order_id = o.id AND r.user_id = o.user_id);

-- Update review_count and average_rating for all seller products
UPDATE products p SET 
  review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = p.id),
  average_rating = COALESCE((SELECT AVG(rating)::numeric(3,2) FROM reviews WHERE product_id = p.id), 5.0)
WHERE seller_id = 'd4f5736a-be1d-492b-a72d-97d1a6cdcde8'::uuid;

-- Update purchases counts for main products
UPDATE products SET purchases = 500, purchases_last_7_days = 45, purchases_last_30_days = 180 
WHERE id = '435d36b2-1fde-4013-9186-7950dbce5799'::uuid;

UPDATE products SET purchases = 300, purchases_last_7_days = 30, purchases_last_30_days = 110
WHERE id = '79a8355b-e93d-44b0-b066-f05f6232f22e'::uuid;

UPDATE products SET purchases = 200, purchases_last_7_days = 25, purchases_last_30_days = 80
WHERE id = '39091d1e-00ee-4365-9555-354a71e89c9d'::uuid;

UPDATE products SET purchases = 150, purchases_last_7_days = 18, purchases_last_30_days = 55
WHERE id = '24004fb0-67c3-4701-857f-6033255ab6b8'::uuid;

UPDATE products SET purchases = 120, purchases_last_7_days = 12, purchases_last_30_days = 45
WHERE id = '1714c298-5510-4f3c-88c5-d45ba3ad2ca6'::uuid;

UPDATE products SET purchases = 100, purchases_last_7_days = 10, purchases_last_30_days = 35
WHERE id = '08acbe0a-de84-429e-9f40-c037df6574f2'::uuid;

-- Update remaining products with random purchases (10-50)
UPDATE products SET 
  purchases = floor(random() * 41 + 10)::int,
  purchases_last_7_days = floor(random() * 8 + 2)::int,
  purchases_last_30_days = floor(random() * 25 + 5)::int
WHERE seller_id = 'd4f5736a-be1d-492b-a72d-97d1a6cdcde8'::uuid
  AND id NOT IN (
    '435d36b2-1fde-4013-9186-7950dbce5799'::uuid,
    '79a8355b-e93d-44b0-b066-f05f6232f22e'::uuid, 
    '39091d1e-00ee-4365-9555-354a71e89c9d'::uuid,
    '24004fb0-67c3-4701-857f-6033255ab6b8'::uuid,
    '1714c298-5510-4f3c-88c5-d45ba3ad2ca6'::uuid,
    '08acbe0a-de84-429e-9f40-c037df6574f2'::uuid
  );
