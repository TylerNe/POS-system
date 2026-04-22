-- ============================================================
-- POS System - Supabase Migration Schema
-- Updated to use 'users' table instead of 'profiles'
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS TABLE (Stand-alone table for POS)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'cashier')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  category VARCHAR(100) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image TEXT,
  barcode VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  tax DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  discount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card', 'digital')),
  user_id UUID NOT NULL REFERENCES public.users(id),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(100),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VIETQR SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vietqr_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SYSTEM SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_vietqr_settings_updated_at
  BEFORE UPDATE ON public.vietqr_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - Dành cho bảo mật cơ bản
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vietqr_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Cho phép mọi người đọc các bảng cần thiết (trong môi trường POS nội bộ)
CREATE POLICY "allow_all_select" ON public.users FOR SELECT USING (true);
CREATE POLICY "allow_all_select" ON public.products FOR SELECT USING (true);
CREATE POLICY "allow_all_select" ON public.orders FOR SELECT USING (true);
CREATE POLICY "allow_all_select" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "allow_all_select" ON public.system_settings FOR SELECT USING (true);

-- ============================================================
-- DEFAULT SYSTEM SETTINGS
-- ============================================================
INSERT INTO public.system_settings (key, value) VALUES
  ('currency', '{"code": "AUD", "symbol": "$", "name": "Australian Dollar"}'::jsonb),
  ('language', '{"code": "vi", "name": "Vietnamese"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
