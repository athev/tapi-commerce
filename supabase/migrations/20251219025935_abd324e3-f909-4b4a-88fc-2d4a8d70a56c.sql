-- Create table to store Zalo OA tokens
CREATE TABLE public.zalo_oa_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oa_id TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.zalo_oa_tokens ENABLE ROW LEVEL SECURITY;

-- Only admins can manage OA tokens
CREATE POLICY "Admins can manage OA tokens"
ON public.zalo_oa_tokens
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert/update tokens (for edge functions)
CREATE POLICY "System can manage OA tokens"
ON public.zalo_oa_tokens
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_zalo_oa_tokens_updated_at
  BEFORE UPDATE ON public.zalo_oa_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();