# Hướng dẫn xử lý vấn đề JWT Token Expired

## Vấn đề
JWT token đã hết hạn (expired) vào ngày 23/08/2025, gây ra lỗi 401 khi truy cập API.

## Giải pháp đã áp dụng

### 1. Tăng thời hạn token
- Thay đổi từ `7d` (7 ngày) thành `30d` (30 ngày)
- Cập nhật trong `authController.ts` cho cả login và register

### 2. Thêm chức năng refresh token
- Thêm endpoint `/auth/refresh` để làm mới token
- Token cũ có thể được sử dụng để tạo token mới (ngay cả khi đã hết hạn)

### 3. Cải thiện xử lý lỗi
- Phân biệt lỗi token expired và lỗi token invalid
- Trả về mã lỗi `TOKEN_EXPIRED` để frontend xử lý

### 4. Tự động refresh token
- Frontend tự động refresh token khi gặp lỗi expired
- Retry request gốc với token mới

## Cách sử dụng

### Đăng nhập lại (Cách đơn giản nhất)
1. Xóa token cũ trong localStorage
2. Đăng nhập lại với tài khoản hiện có

### Sử dụng refresh token
1. Token sẽ tự động được refresh khi gặp lỗi expired
2. Không cần đăng nhập lại

### Tạo user admin mới (nếu cần)
```bash
cd backend
npm run ts-node src/scripts/createAdmin.ts
```

## Kiểm tra

### Backend
```bash
cd backend
npm run dev
```

### Frontend
```bash
npm run dev
```

## Lưu ý

### Bảo mật
- Token mới có thời hạn 30 ngày
- Refresh token chỉ hoạt động với token hợp lệ (đã hết hạn nhưng đúng format)
- Token bị lỗi format sẽ yêu cầu đăng nhập lại

### Development
- Trong môi trường development, có thể tăng thời hạn token lên 90d hoặc 1y
- Production nên giữ thời hạn hợp lý (7-30 ngày)

### Troubleshooting
- Nếu vẫn gặp lỗi, xóa localStorage và đăng nhập lại
- Kiểm tra console để xem lỗi chi tiết
- Đảm bảo backend đang chạy

## Cấu hình môi trường

### Development
```env
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=30d
```

### Production
```env
JWT_SECRET=your-secure-secret-key
JWT_EXPIRES_IN=7d
```

---

**Ngày cập nhật**: 28/08/2025  
**Phiên bản**: 2.0  
**Trạng thái**: Đã khắc phục
