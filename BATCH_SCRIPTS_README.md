# 🚀 POS System Batch Scripts

Các file .bat để quản lý POS System một cách dễ dàng trên Windows.

## 📁 Files

### 🟢 `start-pos-system.bat` - Khởi động toàn bộ system
- ✅ Kiểm tra Node.js và npm
- ✅ Cài đặt dependencies (nếu cần)
- ✅ Kiểm tra và start PostgreSQL service
- ✅ Start Backend API (port 5000)
- ✅ Start Frontend React (port 5173)
- ✅ Mở browser tự động
- ✅ Hiển thị thông tin login

### 🔴 `stop-pos-system.bat` - Dừng toàn bộ system
- 🛑 Tắt tất cả Node.js processes
- 🛑 Giải phóng ports 5000 và 5173
- 🛑 Đóng tất cả cmd windows liên quan
- 🧹 Cleanup hoàn toàn

### 🔄 `reset-pos-system.bat` - Reset toàn bộ system
- 🛑 Stop system hiện tại
- 🗄️ Reset database về trạng thái ban đầu
- 📦 Xóa và cài lại node_modules
- 🔄 Khởi động lại system hoàn toàn

## 🎯 Cách sử dụng

### Khởi động system lần đầu:
1. **Double-click** `start-pos-system.bat`
2. Chờ system khởi động (khoảng 10-15 giây)
3. Browser sẽ tự động mở http://localhost:5173
4. Login với: `admin` / `admin123`

### Dừng system:
1. **Double-click** `stop-pos-system.bat`
2. Hoặc **Ctrl+C** trong các cmd windows
3. Hoặc đóng tất cả cmd windows

### Reset khi có vấn đề:
1. **Double-click** `reset-pos-system.bat`
2. Confirm với **Y**
3. Chờ process hoàn tất

## 🔧 Troubleshooting

### Nếu gặp lỗi:
1. **Chạy as Administrator** (right-click → "Run as administrator")
2. **Kiểm tra PostgreSQL** đã cài đặt chưa
3. **Reset system** với `reset-pos-system.bat`

### Nếu port bị conflict:
- Script sẽ tự động tìm port khác
- Frontend có thể chạy trên 5174, 5175, v.v.
- Backend luôn ở port 5000

### Nếu database không connect:
1. Kiểm tra PostgreSQL service đang chạy
2. Kiểm tra file `backend/.env` có đúng password
3. Chạy `reset-pos-system.bat` để reset database

## 📋 System Requirements

- ✅ **Windows 10/11**
- ✅ **Node.js** (v16+)
- ✅ **npm**
- ✅ **PostgreSQL** (v12+)
- ✅ **Administrator privileges** (recommended)

## 🎊 Features

### 🚀 One-Click Startup
- Tự động check dependencies
- Tự động start services theo đúng thứ tự
- Tự động mở browser
- Hiển thị URLs và credentials

### 🛡️ Error Handling
- Kiểm tra requirements trước khi start
- Graceful shutdown tất cả processes
- Clean port conflicts
- Detailed error messages

### 🔄 Smart Reset
- Backup-free reset (data từ sample)
- Fresh installation khi cần
- Database reset về initial state
- Automatic restart sau reset

## 🎯 Quick Commands

```batch
# Khởi động
start-pos-system.bat

# Dừng
stop-pos-system.bat

# Reset hoàn toàn
reset-pos-system.bat
```

## 🔗 URLs sau khi start

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

## 👤 Default Users

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | admin |
| cashier1 | cashier123 | cashier |

---

**🎉 Enjoy your POS System!** 

*Double-click `start-pos-system.bat` để bắt đầu!*
