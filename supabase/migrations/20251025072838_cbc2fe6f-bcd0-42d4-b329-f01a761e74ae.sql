-- Add product status and SEO fields
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'inactive')),
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS keywords TEXT[];

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_key ON products(slug) WHERE slug IS NOT NULL;

-- Create product_images table for gallery
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on product_images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_images
CREATE POLICY "Anyone can view product images"
ON product_images FOR SELECT
USING (true);

CREATE POLICY "Sellers can manage their product images"
ON product_images FOR ALL
USING (
  product_id IN (
    SELECT id FROM products WHERE seller_id = auth.uid()
  )
);

-- Create product_tags table
CREATE TABLE IF NOT EXISTS product_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on product_tags
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_tags
CREATE POLICY "Anyone can view product tags"
ON product_tags FOR SELECT
USING (true);

CREATE POLICY "Sellers can manage their product tags"
ON product_tags FOR ALL
USING (
  product_id IN (
    SELECT id FROM products WHERE seller_id = auth.uid()
  )
);

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  -- Convert to lowercase, replace Vietnamese characters, and replace spaces with hyphens
  slug := lower(trim(title));
  slug := regexp_replace(slug, '[àáạảãâầấậẩẫăằắặẳẵ]', 'a', 'g');
  slug := regexp_replace(slug, '[èéẹẻẽêềếệểễ]', 'e', 'g');
  slug := regexp_replace(slug, '[ìíịỉĩ]', 'i', 'g');
  slug := regexp_replace(slug, '[òóọỏõôồốộổỗơờớợởỡ]', 'o', 'g');
  slug := regexp_replace(slug, '[ùúụủũưừứựửữ]', 'u', 'g');
  slug := regexp_replace(slug, '[ỳýỵỷỹ]', 'y', 'g');
  slug := regexp_replace(slug, '[đ]', 'd', 'g');
  slug := regexp_replace(slug, '[^a-z0-9]+', '-', 'g');
  slug := regexp_replace(slug, '^-+|-+$', '', 'g');
  RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;