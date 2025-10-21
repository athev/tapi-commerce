-- Drop existing policy that's blocking trigger inserts
DROP POLICY IF EXISTS "system_insert_notifications" ON public.notifications;

-- Create new policy that allows all inserts (needed for SECURITY DEFINER trigger)
CREATE POLICY "system_insert_notifications" ON public.notifications
  FOR INSERT 
  WITH CHECK (true);