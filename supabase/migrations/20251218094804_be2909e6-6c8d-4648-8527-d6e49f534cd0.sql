-- Add zalo_user_id column to profiles for Zalo notification integration
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zalo_user_id TEXT;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_zalo_user_id ON public.profiles(zalo_user_id) WHERE zalo_user_id IS NOT NULL;

-- Enable pg_net extension for async HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function to send Zalo notification when new notification is created
CREATE OR REPLACE FUNCTION public.send_zalo_on_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_zalo_user_id TEXT;
  v_request_id BIGINT;
BEGIN
  -- Check if user has Zalo ID linked
  SELECT zalo_user_id INTO v_zalo_user_id
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Only send if user has Zalo linked
  IF v_zalo_user_id IS NOT NULL THEN
    -- Call edge function using pg_net (async, non-blocking)
    SELECT net.http_post(
      url := 'https://navlxvufcajsozhvbulu.supabase.co/functions/v1/send-zalo-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hdmx4dnVmY2Fqc296aHZidWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODMxMTksImV4cCI6MjA3NjM1OTExOX0.VU-Gumfe6BoZHS9cOg8D9dMNg_8HCoiOKJb7bYwDZd8'
      ),
      body := jsonb_build_object(
        'user_id', NEW.user_id,
        'title', NEW.title,
        'message', NEW.message,
        'action_url', NEW.action_url,
        'type', NEW.type,
        'notification_id', NEW.id
      )
    ) INTO v_request_id;
    
    RAISE LOG '[Zalo Notification] Sent request % for user % notification %', v_request_id, NEW.user_id, NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on notifications table
DROP TRIGGER IF EXISTS zalo_notification_trigger ON public.notifications;
CREATE TRIGGER zalo_notification_trigger
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.send_zalo_on_notification();