-- Relax strict check constraint blocking chat notifications
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;