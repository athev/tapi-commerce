-- First, clean up existing duplicate conversations
-- Keep the one with the most recent last_message_at
DO $$
DECLARE
  duplicate_order record;
  keep_conversation_id uuid;
BEGIN
  FOR duplicate_order IN
    SELECT order_id, array_agg(id ORDER BY last_message_at DESC NULLS LAST) as conv_ids
    FROM conversations
    WHERE chat_type = 'order_support' AND order_id IS NOT NULL
    GROUP BY order_id
    HAVING count(*) > 1
  LOOP
    -- Keep the first one (most recent), delete the rest
    keep_conversation_id := duplicate_order.conv_ids[1];
    
    -- Move messages from duplicate conversations to the one we're keeping
    UPDATE messages
    SET conversation_id = keep_conversation_id
    WHERE conversation_id = ANY(duplicate_order.conv_ids[2:]);
    
    -- Delete duplicate conversations
    DELETE FROM conversations
    WHERE id = ANY(duplicate_order.conv_ids[2:]);
    
    RAISE NOTICE 'Merged conversations for order_id %, kept %', duplicate_order.order_id, keep_conversation_id;
  END LOOP;
END $$;