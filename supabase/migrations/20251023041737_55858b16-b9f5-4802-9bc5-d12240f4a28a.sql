-- Fix update_conversation_on_message function search_path

CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.conversations 
  SET 
    last_message_at = NEW.created_at,
    buyer_unread_count = CASE 
      WHEN NEW.sender_id != buyer_id THEN buyer_unread_count + 1 
      ELSE buyer_unread_count 
    END,
    seller_unread_count = CASE 
      WHEN NEW.sender_id != seller_id THEN seller_unread_count + 1 
      ELSE seller_unread_count 
    END,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$;