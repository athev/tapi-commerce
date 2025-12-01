-- Add in_stock and description columns to product_variants table
ALTER TABLE product_variants 
ADD COLUMN in_stock integer DEFAULT 999,
ADD COLUMN description text;

COMMENT ON COLUMN product_variants.in_stock IS 'Inventory stock for this variant';
COMMENT ON COLUMN product_variants.description IS 'Optional description for this variant';