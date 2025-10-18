-- PHASE 1: Tạo hệ thống phân quyền an toàn với user_roles

-- 1. Tạo enum cho roles
CREATE TYPE public.app_role AS ENUM ('admin', 'seller', 'end-user');

-- 2. Tạo bảng user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 3. Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Tạo security definer function để check role an toàn
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. RLS policies cho user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- 6. Migrate dữ liệu từ profiles sang user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 
  CASE 
    WHEN role = 'admin' THEN 'admin'::app_role
    WHEN role = 'seller' THEN 'seller'::app_role
    ELSE 'end-user'::app_role
  END
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- 7. Cập nhật RLS policies cho withdrawal_requests sử dụng has_role
DROP POLICY IF EXISTS "Admins can view all withdrawals" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Admins can update withdrawals" ON public.withdrawal_requests;

CREATE POLICY "Admins can view all withdrawals"
ON public.withdrawal_requests FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update withdrawals"
ON public.withdrawal_requests FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- 8. Cập nhật các RLS policies khác sử dụng has_role
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;

CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all orders"
ON public.orders FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all seller applications" ON public.seller_applications;
DROP POLICY IF EXISTS "Admins can update all seller applications" ON public.seller_applications;

CREATE POLICY "Admins can view all seller applications"
ON public.seller_applications FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all seller applications"
ON public.seller_applications FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage all disputes" ON public.order_disputes;

CREATE POLICY "Admins can manage all disputes"
ON public.order_disputes FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin can view casso transactions" ON public.casso_transactions;

CREATE POLICY "Admin can view casso transactions"
ON public.casso_transactions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin can view unmatched transactions" ON public.unmatched_transactions;

CREATE POLICY "Admin can view unmatched transactions"
ON public.unmatched_transactions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));