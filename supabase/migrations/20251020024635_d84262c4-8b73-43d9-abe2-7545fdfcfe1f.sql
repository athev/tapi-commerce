-- ============================================
-- MIGRATION: Full Roles System Migration
-- Migrate from profiles.role to user_roles table
-- ============================================

-- Step 1: Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::app_role
FROM public.profiles
WHERE role IN ('admin', 'seller', 'moderator')
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 2: Create trigger to sync seller role when application is approved
CREATE OR REPLACE FUNCTION public.sync_seller_role_on_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When seller application is approved, insert into user_roles
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'seller')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Also update profiles.role for backward compatibility (temporary)
    UPDATE public.profiles
    SET role = 'seller'
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS seller_application_approved ON public.seller_applications;
CREATE TRIGGER seller_application_approved
  AFTER UPDATE ON public.seller_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_seller_role_on_approval();

-- Step 3: Create trigger for automatic chat notifications
CREATE OR REPLACE FUNCTION public.create_message_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation RECORD;
  v_sender_profile RECORD;
  v_recipient_id UUID;
  v_content_preview TEXT;
BEGIN
  -- Get conversation details
  SELECT buyer_id, seller_id INTO v_conversation
  FROM public.conversations
  WHERE id = NEW.conversation_id;
  
  -- Determine recipient (opposite of sender)
  IF NEW.sender_id = v_conversation.buyer_id THEN
    v_recipient_id := v_conversation.seller_id;
  ELSE
    v_recipient_id := v_conversation.buyer_id;
  END IF;
  
  -- Get sender name
  SELECT full_name INTO v_sender_profile
  FROM public.profiles
  WHERE id = NEW.sender_id;
  
  -- Create content preview based on message type
  IF NEW.message_type = 'image' THEN
    v_content_preview := '📷 Đã gửi một hình ảnh';
  ELSIF NEW.message_type = 'emoji' THEN
    v_content_preview := '😊 Đã gửi một emoji';
  ELSE
    v_content_preview := SUBSTRING(NEW.content, 1, 50);
    IF LENGTH(NEW.content) > 50 THEN
      v_content_preview := v_content_preview || '...';
    END IF;
  END IF;
  
  -- Insert notification
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    priority,
    action_url,
    metadata
  ) VALUES (
    v_recipient_id,
    'new_message',
    'Tin nhắn mới từ ' || COALESCE(v_sender_profile.full_name, 'Người dùng'),
    v_content_preview,
    'normal',
    '/chat/' || NEW.conversation_id::TEXT,
    jsonb_build_object(
      'conversation_id', NEW.conversation_id,
      'sender_id', NEW.sender_id,
      'message_id', NEW.id,
      'message_type', NEW.message_type
    )
  );
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS message_notification_trigger ON public.messages;
CREATE TRIGGER message_notification_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.create_message_notification();

-- Step 4: Add deprecation comment to profiles.role column
COMMENT ON COLUMN public.profiles.role IS 'DEPRECATED: Kept for backward compatibility. Primary source is user_roles table. Will be removed in future migration.';