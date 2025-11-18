-- Phase 1: Add new columns to products table for advanced ranking
ALTER TABLE products
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS favorites_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS chat_initiated_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS purchases_last_7_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS purchases_last_30_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_mall_product BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS quality_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_score_calculated_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for optimal sorting performance
CREATE INDEX IF NOT EXISTS idx_products_quality_score ON products(quality_score DESC NULLS LAST) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_trending ON products(purchases_last_7_days DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_views ON products(views DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_mall ON products(is_mall_product) WHERE is_mall_product = true AND status = 'active';

-- Add comment for documentation
COMMENT ON COLUMN products.quality_score IS 'Composite quality score calculated from conversion rate, rating, sales velocity, seller quality, freshness, and stock health';
COMMENT ON COLUMN products.is_mall_product IS 'Products marked as Mall get 1.3x boost in ranking';
COMMENT ON COLUMN products.is_sponsored IS 'Sponsored products for paid promotions';