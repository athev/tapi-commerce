-- Add slug columns to products and profiles tables
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS slug text UNIQUE;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Create indexes for faster lookup
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);

-- Drop existing function and recreate with updated logic
DROP FUNCTION IF EXISTS generate_slug(text);

-- Create function to generate SEO-friendly slug from Vietnamese text
CREATE OR REPLACE FUNCTION generate_slug(input_text text)
RETURNS text AS $$
DECLARE
  slug text;
BEGIN
  -- Convert to lowercase and trim
  slug := lower(trim(input_text));
  
  -- Convert Vietnamese characters to ASCII
  slug := regexp_replace(slug, '[áàảãạăắằẳẵặâấầẩẫậ]', 'a', 'g');
  slug := regexp_replace(slug, '[éèẻẽẹêếềểễệ]', 'e', 'g');
  slug := regexp_replace(slug, '[íìỉĩị]', 'i', 'g');
  slug := regexp_replace(slug, '[óòỏõọôốồổỗộơớờởỡợ]', 'o', 'g');
  slug := regexp_replace(slug, '[úùủũụưứừửữự]', 'u', 'g');
  slug := regexp_replace(slug, '[ýỳỷỹỵ]', 'y', 'g');
  slug := regexp_replace(slug, '[đ]', 'd', 'g');
  
  -- Replace spaces and special chars with dash
  slug := regexp_replace(slug, '[^a-z0-9]+', '-', 'g');
  
  -- Remove leading/trailing dashes
  slug := regexp_replace(slug, '^-+|-+$', '', 'g');
  
  RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger function to auto-generate slug for products
CREATE OR REPLACE FUNCTION set_product_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter int := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := generate_slug(NEW.title);
    final_slug := base_slug;
    
    -- Handle duplicate slugs by appending counter
    WHILE EXISTS (SELECT 1 FROM products WHERE slug = final_slug AND id != NEW.id) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_product_slug ON public.products;
CREATE TRIGGER trigger_set_product_slug
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION set_product_slug();

-- Trigger function to auto-generate slug for profiles
CREATE OR REPLACE FUNCTION set_profile_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter int := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := generate_slug(NEW.full_name);
    final_slug := base_slug;
    
    -- Handle duplicate slugs by appending counter
    WHILE EXISTS (SELECT 1 FROM profiles WHERE slug = final_slug AND id != NEW.id) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_profile_slug ON public.profiles;
CREATE TRIGGER trigger_set_profile_slug
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION set_profile_slug();

-- Backfill existing records with slugs
UPDATE products SET slug = generate_slug(title) WHERE slug IS NULL;
UPDATE profiles SET slug = generate_slug(full_name) WHERE slug IS NULL AND role = 'seller';