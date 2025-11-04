-- Add marketplace trust fields to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS complaint_rate numeric DEFAULT 0 CHECK (complaint_rate >= 0 AND complaint_rate <= 100),
ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0 CHECK (review_count >= 0),
ADD COLUMN IF NOT EXISTS average_rating numeric DEFAULT 5.0 CHECK (average_rating >= 0 AND average_rating <= 5);

-- Add seller performance fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS response_rate numeric DEFAULT 95 CHECK (response_rate >= 0 AND response_rate <= 100),
ADD COLUMN IF NOT EXISTS response_time text DEFAULT '< 1 giờ',
ADD COLUMN IF NOT EXISTS total_products integer DEFAULT 0 CHECK (total_products >= 0),
ADD COLUMN IF NOT EXISTS seller_rating numeric DEFAULT 5.0 CHECK (seller_rating >= 0 AND seller_rating <= 5);

COMMENT ON COLUMN products.complaint_rate IS 'Tỷ lệ khiếu nại (%) - hiển thị uy tín sản phẩm';
COMMENT ON COLUMN products.review_count IS 'Số lượng đánh giá thực tế từ người dùng';
COMMENT ON COLUMN products.average_rating IS 'Điểm đánh giá trung bình 0-5 sao';
COMMENT ON COLUMN profiles.is_online IS 'Trạng thái online của người bán';
COMMENT ON COLUMN profiles.response_rate IS 'Tỷ lệ phản hồi tin nhắn (%)';
COMMENT ON COLUMN profiles.response_time IS 'Thời gian phản hồi trung bình';
COMMENT ON COLUMN profiles.total_products IS 'Tổng số sản phẩm của người bán';
COMMENT ON COLUMN profiles.seller_rating IS 'Điểm đánh giá người bán 0-5 sao';