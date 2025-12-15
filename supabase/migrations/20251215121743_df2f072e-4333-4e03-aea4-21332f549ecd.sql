-- Create subcategories table
CREATE TABLE public.subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- RLS policy: everyone can view active subcategories
CREATE POLICY "Anyone can view active subcategories" 
ON public.subcategories 
FOR SELECT 
USING (is_active = true);

-- Admins can manage subcategories
CREATE POLICY "Admins can manage subcategories" 
ON public.subcategories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed subcategories data using UUIDs directly
INSERT INTO public.subcategories (parent_category_id, name, sort_order) VALUES
-- Phần mềm
('6b993357-726a-4dfb-b313-f3c44398b371', 'Windows', 1),
('6b993357-726a-4dfb-b313-f3c44398b371', 'Office', 2),
('6b993357-726a-4dfb-b313-f3c44398b371', 'Adobe', 3),
('6b993357-726a-4dfb-b313-f3c44398b371', 'VPN', 4),
('6b993357-726a-4dfb-b313-f3c44398b371', 'Diệt Virus', 5),
('6b993357-726a-4dfb-b313-f3c44398b371', 'Google Drive', 6),
-- Tài khoản AI
('20ad1ef4-1b89-45f0-9dc0-c13e542938b0', 'ChatGPT', 1),
('20ad1ef4-1b89-45f0-9dc0-c13e542938b0', 'Gemini', 2),
('20ad1ef4-1b89-45f0-9dc0-c13e542938b0', 'Claude', 3),
('20ad1ef4-1b89-45f0-9dc0-c13e542938b0', 'Midjourney', 4),
('20ad1ef4-1b89-45f0-9dc0-c13e542938b0', 'Copilot', 5),
-- Giải trí
('c344aca7-0f85-49c8-9545-194c6c4dd1c7', 'Netflix', 1),
('c344aca7-0f85-49c8-9545-194c6c4dd1c7', 'Spotify', 2),
('c344aca7-0f85-49c8-9545-194c6c4dd1c7', 'Youtube Premium', 3),
('c344aca7-0f85-49c8-9545-194c6c4dd1c7', 'Disney+', 4),
('c344aca7-0f85-49c8-9545-194c6c4dd1c7', 'HBO Max', 5),
-- Học tập
('25f32aec-1abc-4f07-83e8-36156467509b', 'Canva', 1),
('25f32aec-1abc-4f07-83e8-36156467509b', 'Grammarly', 2),
('25f32aec-1abc-4f07-83e8-36156467509b', 'Duolingo', 3),
('25f32aec-1abc-4f07-83e8-36156467509b', 'Notion', 4),
-- Khóa học
('cfe1db2a-6d9f-4e4d-8b04-5430df3841f3', 'Udemy', 1),
('cfe1db2a-6d9f-4e4d-8b04-5430df3841f3', 'Coursera', 2),
('cfe1db2a-6d9f-4e4d-8b04-5430df3841f3', 'Skillshare', 3),
-- Template
('0a2f31fe-ff83-4f90-9e40-00d8fc8212f8', 'CV/Resume', 1),
('0a2f31fe-ff83-4f90-9e40-00d8fc8212f8', 'PowerPoint', 2),
('0a2f31fe-ff83-4f90-9e40-00d8fc8212f8', 'Figma', 3),
-- Ebook
('f1b33ec3-3454-42e7-91bb-e328c7a32785', 'Kinh doanh', 1),
('f1b33ec3-3454-42e7-91bb-e328c7a32785', 'Kỹ năng', 2),
('f1b33ec3-3454-42e7-91bb-e328c7a32785', 'Công nghệ', 3),
-- Âm nhạc
('752d7a35-d3f3-4144-ad18-6d7e17dfb05d', 'FL Studio', 1),
('752d7a35-d3f3-4144-ad18-6d7e17dfb05d', 'Splice', 2),
('752d7a35-d3f3-4144-ad18-6d7e17dfb05d', 'Sample Pack', 3),
-- Dịch vụ
('2e002e9f-b44a-4f8b-8306-dfece14e4a8f', 'SEO', 1),
('2e002e9f-b44a-4f8b-8306-dfece14e4a8f', 'Marketing', 2),
('2e002e9f-b44a-4f8b-8306-dfece14e4a8f', 'Thiết kế', 3);