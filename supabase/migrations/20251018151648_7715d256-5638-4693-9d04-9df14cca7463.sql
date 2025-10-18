-- Add unique index to prevent duplicate order support conversations
-- Now that duplicates are cleaned up, we can safely add the constraint
CREATE UNIQUE INDEX IF NOT EXISTS conversations_unique_order_support
ON public.conversations (order_id)
WHERE chat_type = 'order_support' AND order_id IS NOT NULL;