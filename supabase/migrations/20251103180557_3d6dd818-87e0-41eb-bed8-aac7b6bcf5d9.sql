-- Create seller_promotions table
CREATE TABLE seller_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create seller_policies table
CREATE TABLE seller_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  icon TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies for seller_promotions
ALTER TABLE seller_promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can manage their promotions"
  ON seller_promotions
  FOR ALL
  USING (auth.uid() = seller_id);

CREATE POLICY "Anyone can view active promotions"
  ON seller_promotions
  FOR SELECT
  USING (is_active = true);

-- RLS Policies for seller_policies
ALTER TABLE seller_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can manage their policies"
  ON seller_policies
  FOR ALL
  USING (auth.uid() = seller_id);

CREATE POLICY "Anyone can view active policies"
  ON seller_policies
  FOR SELECT
  USING (is_active = true);

-- Indexes
CREATE INDEX idx_seller_promotions_seller_id ON seller_promotions(seller_id);
CREATE INDEX idx_seller_policies_seller_id ON seller_policies(seller_id);

-- Insert default promotions for existing sellers
INSERT INTO seller_promotions (seller_id, content, sort_order)
SELECT DISTINCT seller_id, 
  '- Giá rẻ nhất trên thị trường, nâng cấp chính chủ trên tài khoản bạn đang sử dụng.',
  0
FROM products
WHERE seller_id IS NOT NULL;

INSERT INTO seller_promotions (seller_id, content, sort_order)
SELECT DISTINCT seller_id, 
  '- Giảm trực tiếp 10%, tối đa 200.000 VNĐ khi thanh toán từ 1 triệu đồng',
  1
FROM products
WHERE seller_id IS NOT NULL;

INSERT INTO seller_promotions (seller_id, content, sort_order)
SELECT DISTINCT seller_id, 
  '- Bảo hành 1:1: Trong toàn bộ thời gian của gói',
  2
FROM products
WHERE seller_id IS NOT NULL;

-- Insert default policies for existing sellers
INSERT INTO seller_policies (seller_id, icon, title, description, sort_order)
SELECT DISTINCT seller_id, 'Truck', 'Miễn phí', 'Trải nghiệm một số sản phẩm', 0
FROM products WHERE seller_id IS NOT NULL
UNION ALL
SELECT DISTINCT seller_id, 'Gift', 'Quà tặng', 'Với hóa đơn trên 1 triệu', 1
FROM products WHERE seller_id IS NOT NULL
UNION ALL
SELECT DISTINCT seller_id, 'Shield', 'Bảo hành', 'Toàn bộ thời gian của gói đăng ký', 2
FROM products WHERE seller_id IS NOT NULL
UNION ALL
SELECT DISTINCT seller_id, 'Phone', 'Hotline: 0387.022.876', 'Hỗ trợ 24/7', 3
FROM products WHERE seller_id IS NOT NULL;