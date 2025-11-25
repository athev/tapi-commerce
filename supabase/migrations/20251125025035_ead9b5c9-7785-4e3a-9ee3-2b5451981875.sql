-- Add 'service' to the allowed product types
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_product_type_check;

ALTER TABLE products ADD CONSTRAINT products_product_type_check 
CHECK (product_type IN ('file_download', 'license_key_delivery', 'shared_account', 'upgrade_account_no_pass', 'upgrade_account_with_pass', 'service'));