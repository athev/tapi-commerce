-- Add 'service_request' to allowed chat_type values in conversations table
-- Including all existing values
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_chat_type_check;

ALTER TABLE conversations ADD CONSTRAINT conversations_chat_type_check 
CHECK (chat_type IN ('product_consultation', 'product_inquiry', 'order_support', 'service_request'));