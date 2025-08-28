# 🚀 Railway Deployment Guide

Hướng dẫn chi tiết để deploy POS System lên Railway.

## 📋 Yêu cầu trước khi deploy

1. **Tài khoản Railway**: Đăng ký tại [railway.app](https://railway.app)
2. **GitHub Repository**: Code đã được push lên GitHub
3. **Database**: Railway sẽ tự động cung cấp PostgreSQL

## 🔧 Bước 1: Chuẩn bị Project

### 1.1 Kiểm tra files cần thiết
- ✅ `railway.toml` - Railway configuration
- ✅ `backend/Dockerfile` - Container configuration  
- ✅ `backend/.dockerignore` - Docker ignore rules
- ✅ Updated `package.json` scripts
- ✅ Updated API configuration

### 1.2 Environment Variables cần thiết
```bash
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secure-jwt-secret-here
DATABASE_URL=postgresql://username:password@host:port/database
CORS_ORIGIN=https://your-railway-domain.railway.app
```

## 🚀 Bước 2: Deploy trên Railway

### 2.1 Tạo Project mới
1. Đăng nhập vào [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Chọn **"Deploy from GitHub repo"**
4. Chọn repository của bạn

### 2.2 Thêm PostgreSQL Database
1. Trong project dashboard, click **"+ New"**
2. Chọn **"Database"** → **"Add PostgreSQL"**
3. Railway sẽ tự động tạo database và cung cấp `DATABASE_URL`

### 2.3 Cấu hình Environment Variables
Vào **"Variables"** tab và thêm:

```bash
NODE_ENV=production
JWT_SECRET=pos_system_super_secure_secret_key_2024
CORS_ORIGIN=https://your-app-name.up.railway.app
```

**Lưu ý**: `DATABASE_URL` sẽ được Railway tự động thêm.

### 2.4 Deploy
1. Railway sẽ tự động detect và build project
2. Kiểm tra **"Deployments"** tab để theo dõi quá trình build
3. Sau khi build xong, bạn sẽ có URL production

## 🔍 Bước 3: Kiểm tra Deployment

### 3.1 Health Check
Truy cập: `https://your-app.railway.app/health`

Kết quả mong đợi:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### 3.2 API Endpoints
- Health: `https://your-app.railway.app/api/health`
- Auth: `https://your-app.railway.app/api/auth/login`
- Products: `https://your-app.railway.app/api/products`

### 3.3 Frontend
- Main App: `https://your-app.railway.app/`
- Kitchen Dashboard: `https://your-app.railway.app/kitchen`

## 🛠️ Bước 4: Khởi tạo Database

### 4.1 Chạy Database Scripts
Railway console:
```bash
npm run init-db-prod
npm run create-admin-prod
```

### 4.2 Tạo Admin User
Default admin credentials:
- Username: `admin`
- Password: `admin123`

**⚠️ Quan trọng**: Đổi password ngay sau khi đăng nhập lần đầu!

## 🔧 Troubleshooting

### Build Failures
- Kiểm tra logs trong **"Deployments"** tab
- Đảm bảo tất cả dependencies được install
- Kiểm tra TypeScript compilation errors

### Database Connection Issues
- Kiểm tra `DATABASE_URL` environment variable
- Đảm bảo PostgreSQL service đang chạy
- Kiểm tra database logs

### CORS Errors
- Cập nhật `CORS_ORIGIN` với domain chính xác
- Kiểm tra CORS configuration trong backend

### 404 Errors
- Kiểm tra frontend routing configuration
- Đảm bảo catch-all handler hoạt động đúng

## 📱 Custom Domain (Optional)

1. Vào **"Settings"** → **"Domains"**
2. Click **"Custom Domain"**
3. Nhập domain của bạn
4. Cấu hình DNS records theo hướng dẫn

## 🔄 CI/CD

Railway tự động deploy khi có changes trên GitHub:
1. Push code lên GitHub
2. Railway tự động detect changes
3. Trigger new deployment
4. Zero-downtime deployment

## 💰 Pricing

- **Starter Plan**: $5/month
- **Pro Plan**: $20/month
- **Team Plan**: $100/month

Starter plan đủ cho most small applications.

## 📞 Support

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Community: [Railway Discord](https://discord.gg/railway)
- GitHub Issues: Create issue in your repository

---

✅ **Deployment Complete!** 

Your POS System is now live at: `https://your-app.railway.app`
