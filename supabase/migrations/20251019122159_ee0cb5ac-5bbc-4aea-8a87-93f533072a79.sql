-- Create site_settings table for dynamic website configuration
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  category text NOT NULL,
  description text,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view site settings (needed for public pages)
CREATE POLICY "Anyone can view site settings"
  ON public.site_settings FOR SELECT
  USING (true);

-- Only admins can manage site settings
CREATE POLICY "Admins can insert site settings"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site settings"
  ON public.site_settings FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger to update updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.site_settings (key, value, category, description) VALUES
  ('site_logo', '{"url": "/lovable-uploads/5a01c90b-f781-477d-935f-e26486fd46ca.png", "alt": "Logo"}', 'branding', 'Logo hiển thị trên header'),
  ('site_name', '{"text": "Sàn Sản Phẩm Số", "short": "SPS"}', 'branding', 'Tên website'),
  ('site_title', '{"text": "Sàn sản phẩm số đầu tiên tại Việt Nam được bảo vệ uy tín"}', 'seo', 'Title tag cho SEO'),
  ('site_description', '{"text": "Nơi mua bán các sản phẩm số, tài khoản rẻ, khóa học và dịch vụ trực tuyến uy tín nhất Việt Nam"}', 'seo', 'Meta description'),
  ('company_info', '{"name": "DigitalMarket", "description": "Sàn thương mại điện tử sản phẩm số phục vụ kiếm tiền online. Mọi giao dịch đều được bảo vệ."}', 'footer', 'Thông tin công ty trong footer'),
  ('contact_info', '{"email": "support@digitalmarket.com", "hours": "08:00 - 22:00"}', 'contact', 'Thông tin liên hệ'),
  ('footer_links', '{"columns": [{"title": "Sản phẩm", "links": [{"label": "Danh mục", "path": "/categories"}, {"label": "Sản phẩm mới", "path": "/"}]}, {"title": "Hỗ trợ", "links": [{"label": "Liên hệ", "path": "/contact"}, {"label": "FAQ", "path": "/faq"}]}]}', 'footer', 'Các link trong footer'),
  ('header_nav', '{"items": [{"label": "Trang chủ", "path": "/"}, {"label": "Danh mục", "path": "/categories"}]}', 'header', 'Menu điều hướng header');

-- Enhance categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON public.categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON public.site_settings(category);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(key);

-- Create trigger for categories updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update RLS policies for categories to allow admin management
CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));