-- Enhance notifications table with additional columns
ALTER TABLE public.notifications 
  ADD COLUMN IF NOT EXISTS priority text DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
  ADD COLUMN IF NOT EXISTS action_url text,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS read_at timestamp with time zone;

-- Add helpful comment
COMMENT ON COLUMN public.notifications.priority IS 'Notification priority: high, normal, or low';
COMMENT ON COLUMN public.notifications.action_url IS 'URL to navigate when clicking notification';
COMMENT ON COLUMN public.notifications.metadata IS 'Additional data stored as JSON';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
  ON public.notifications(user_id, is_read, created_at DESC);
  
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread_count
  ON public.notifications(user_id) WHERE is_read = false;

-- Enable realtime for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add notifications to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(user_id_param uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.notifications
  WHERE user_id = user_id_param AND is_read = false;
$$;