-- Phase 1: Allow anonymous users to view seller profiles
CREATE POLICY "Anyone can view seller profiles"
ON public.profiles FOR SELECT
TO public
USING (role = 'seller');