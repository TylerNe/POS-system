# 🚀 Hướng dẫn Setup: Supabase + Vercel

## Bước 1 — Tạo Supabase Project

1. Vào [supabase.com](https://supabase.com) → **New Project**
2. Đặt tên project, chọn region gần nhất (Singapore để cho VN)
3. Đặt Database Password (lưu lại)
4. Chờ project khởi động (~2 phút)

---

## Bước 2 — Chạy Database Schema

1. Vào **SQL Editor** trong Supabase Dashboard
2. **New Query** → Copy toàn bộ nội dung file `supabase/migrations/001_initial_schema.sql` → **Run**
3. **New Query** → Copy toàn bộ nội dung file `supabase/migrations/002_rpc_functions.sql` → **Run**

---

## Bước 3 — Lấy API Keys

Vào **Project Settings → API**:

| Variable | Lấy từ |
|---|---|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key ⚠️ |

> ⚠️ **KHÔNG commit `SERVICE_ROLE_KEY` lên Git!** Key này bypass tất cả RLS.

---

## Bước 4 — Tạo Admin User Đầu Tiên

1. Vào Supabase Dashboard → **Authentication → Users → Add User**
2. Nhập email + password
3. Sau khi tạo xong, vào **Table Editor → profiles**
4. Tìm user vừa tạo → sửa `username` và `role = 'admin'`

Hoặc dùng SQL Editor:
```sql
-- Tạo admin user (thay bằng UUID của user bạn vừa tạo)
UPDATE public.profiles
SET username = 'admin', role = 'admin'
WHERE id = 'USER_UUID_HERE';
```

---

## Bước 5 — Setup Local Development

### Cài Vercel CLI:
```bash
npm install -g vercel
vercel login
```

### Tạo file `.env.local` ở thư mục root:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY

SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

### Cài dependencies:
```bash
npm install
```

### Chạy local (dùng Vercel CLI để có cả API routes):
```bash
npm run dev
# hoặc: vercel dev
```

> App sẽ chạy tại `http://localhost:3000`

---

## Bước 6 — Deploy lên Vercel

### Cách 1: Via GitHub (recommended)
1. Push code lên GitHub
2. Vào [vercel.com](https://vercel.com) → **New Project → Import Git Repository**
3. Chọn repo của bạn
4. **Environment Variables** — thêm 3 biến:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Và 2 biến cho Vite build:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. **Deploy!**

### Cách 2: Via CLI
```bash
vercel --prod
```

---

## Bước 7 — Cấu hình Supabase Realtime (Kitchen Orders)

1. Vào Supabase Dashboard → **Database → Replication**
2. Đảm bảo table `orders` và `order_items` đã được bật Realtime
3. Nếu chưa, chạy SQL:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
```

---

## Bước 8 — Xóa Express Backend (tùy chọn)

Sau khi verify mọi thứ hoạt động:
```bash
# Xóa thư mục backend
Remove-Item -Recurse -Force backend

# Xóa file Railway
Remove-Item railway.json, Procfile, .railwayignore, RAILWAY_DEPLOYMENT.md
```

---

## Cấu trúc mới

```
pos-system/
├── api/                        ← Vercel Serverless Functions
│   ├── _utils/                 ← Shared helpers (auth, supabase, cors)
│   ├── auth/                   ← Auth endpoints
│   ├── products/               ← Products endpoints
│   ├── orders/                 ← Orders + analytics endpoints
│   ├── settings/               ← Settings endpoints
│   ├── vietqr/                 ← VietQR endpoints
│   ├── kitchen/                ← Kitchen endpoints
│   └── health.ts
├── src/                        ← React frontend
│   ├── lib/supabase.ts         ← Supabase client
│   ├── services/realtime.ts    ← Realtime subscriptions (replaces SSE)
│   └── ...
├── supabase/migrations/        ← SQL schema files
├── vercel.json                 ← Vercel config
└── .env.local                  ← Local env vars (DO NOT COMMIT)
```

---

## Troubleshooting

### API trả về 401
- Kiểm tra token trong localStorage
- Đảm bảo `SUPABASE_SERVICE_ROLE_KEY` đã được set trên Vercel

### Realtime không hoạt động
- Kiểm tra `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` đã set đúng
- Kiểm tra Supabase Realtime đã bật cho bảng `orders`

### Build fails
- Chạy `npm run type-check` để xem TypeScript errors
- Đảm bảo `@supabase/supabase-js` và `@vercel/node` đã được install
