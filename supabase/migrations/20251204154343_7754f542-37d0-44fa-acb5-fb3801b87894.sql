-- Thêm foreign key relationship từ products.seller_id → profiles.id
ALTER TABLE products 
ADD CONSTRAINT fk_products_seller 
FOREIGN KEY (seller_id) 
REFERENCES profiles(id) 
ON DELETE SET NULL;