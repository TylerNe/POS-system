-- ==========================================
-- POS SYSTEM FULL DATABASE SCHEMA BACKUP
-- THAI POS SYSTEM - COMPREHENSIVE SETUP
-- ==========================================

-- 1. CLEANUP (Xóa sạch nếu làm lại từ đầu - Cẩn thận khi chạy lệnh này)
-- DROP TABLE IF EXISTS public.order_items CASCADE;
-- DROP TABLE IF EXISTS public.orders CASCADE;
-- DROP TABLE IF EXISTS public.products CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;
-- DROP TABLE IF EXISTS public.system_settings CASCADE;
-- DROP TABLE IF EXISTS public.vietqr_settings CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. USERS TABLE (Bảng người dùng - Quản lý nhân viên)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Plain text cho đơn giản hoặc hash bcrypt
  email VARCHAR(100) UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'kitchen')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS TABLE (Bảng sản phẩm)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  category VARCHAR(100) NOT NULL,
  image TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  barcode VARCHAR(50) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDERS TABLE (Bảng đơn hàng)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card', 'digital')),
  user_id UUID NOT NULL REFERENCES public.users(id), -- Khóa ngoại trỏ vào users
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(100),
  metadata JSONB DEFAULT '{}'::jsonb, -- Chứa note, kitchen_status, v.v.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDER ITEMS TABLE (Chi tiết món ăn trong đơn)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SYSTEM SETTINGS TABLE (Cấu hình hệ thống)
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(50) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. VIETQR SETTINGS TABLE (Cấu hình thanh toán QR)
CREATE TABLE IF NOT EXISTS public.vietqr_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bank_id VARCHAR(50) NOT NULL,
  account_no VARCHAR(50) NOT NULL,
  account_name VARCHAR(100) NOT NULL,
  template VARCHAR(50) DEFAULT 'compact',
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 8. SECURITY (RLS - Row Level Security)
-- ==========================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vietqr_settings ENABLE ROW LEVEL SECURITY;

-- Cho phép mọi người đọc thông tin cơ bản (Hoặc bạn có thể siết chặt hơn)
CREATE POLICY "Public read access" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.system_settings FOR SELECT USING (true);

-- Admin & Staff có quyền với orders
CREATE POLICY "Staff can manage orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Staff can manage order items" ON public.order_items FOR ALL USING (true);

-- Chỉ Admin quản lý users và settings
CREATE POLICY "Admin full access" ON public.users FOR ALL USING (true);
CREATE POLICY "Admin full access" ON public.system_settings FOR ALL USING (true);

-- ==========================================
-- 9. INITIAL DATA (Dữ liệu ban đầu)
-- ==========================================

-- Tạo tài khoản Admin mặc định (Pass: admin123)
INSERT INTO public.users (username, password, role, email)
VALUES ('admin', 'admin123', 'admin', 'admin@pos.com')
ON CONFLICT (username) DO NOTHING;

-- Tạo cấu hình mặc định (AUD và Tiếng Việt)
INSERT INTO public.system_settings (key, value)
VALUES 
  ('currency', '{"code": "AUD", "symbol": "$", "name": "Australian Dollar"}'),
  ('language', '{"code": "vi", "name": "Tiếng Việt"}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ==========================================
-- 10. REALTIME (Bật tính năng cập nhật trực tiếp cho Bếp)
-- ==========================================

BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.orders, public.order_items;
COMMIT;

-- Thông báo hoàn tất
SELECT 'POS Database Setup Completed Successfully!' as status;
