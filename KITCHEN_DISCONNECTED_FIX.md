# Khắc phục vấn đề "Disconnected" trong Kitchen Dashboard

## Vấn đề
Kitchen Dashboard hiển thị trạng thái "Disconnected" mặc dù đã liên kết được orders.

## Nguyên nhân có thể
1. **Thiếu test data**: Không có orders nào trong database
2. **Vấn đề SSE (Server-Sent Events)**: Kết nối real-time không hoạt động
3. **Vấn đề authentication**: Token không được xử lý đúng cách
4. **Vấn đề network**: Kết nối mạng bị gián đoạn
5. **Vấn đề proxy**: Frontend không thể kết nối đến backend

## Giải pháp đã thực hiện

### 1. Cải thiện logic kết nối trong KitchenDashboard.tsx
- Thêm loading state để hiển thị trạng thái đang tải
- Cải thiện logic reconnect với exponential backoff
- Thêm nút "Retry" để thử kết nối lại
- Xử lý heartbeat từ server

### 2. Cải thiện backend SSE
- Thêm heartbeat mỗi 30 giây để duy trì kết nối
- Cải thiện xử lý client disconnect
- Thêm helper function `notifyClients` để quản lý kết nối tốt hơn
- Thêm debug logging chi tiết

### 3. Tạo test data
- Script `createKitchenTestData.ts` tạo products và orders mẫu
- 7 test orders với các trạng thái khác nhau (Pending, Done)

### 4. Cấu hình Vite Proxy
- Thêm proxy configuration để forward API requests từ frontend đến backend
- Enable WebSocket proxy cho SSE

### 5. Tạo route /kitchen riêng biệt
- Sử dụng React Router để tạo route `/kitchen` riêng biệt
- Tạo component `KitchenPage` với authentication và permission check
- Kitchen dashboard có thể truy cập trực tiếp tại `http://localhost:5173/kitchen`
- Khi click "Kitchen" từ main app, sẽ redirect đến route `/kitchen` riêng biệt
- Kitchen dashboard không còn hiển thị trong main app layout

## Cách test và debug

### 1. Chạy test data
```bash
cd backend
npx ts-node src/scripts/createKitchenTestData.ts
```

### 2. Khởi động hệ thống
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
npm run dev
```

### 3. Truy cập Kitchen Dashboard
- **Cách 1**: Truy cập trực tiếp: `http://localhost:5173/kitchen`
- **Cách 2**: Từ main app: Login → Chọn Kitchen từ menu
- **Cách 3**: Sử dụng file `kitchen.html` để test

### 4. Test API với file HTML
Mở file `test-kitchen-api.html` trong browser để test:
- Login authentication
- Get kitchen orders
- Update order status
- Test SSE connection

### 5. Test SSE riêng biệt
Mở file `test-sse.html` để test kết nối SSE:
- Connect/Disconnect SSE
- Xem log events
- Debug connection issues

## Các bước khắc phục

### Bước 1: Kiểm tra backend
```bash
cd backend
npm run dev
```

### Bước 2: Tạo test data
```bash
npx ts-node src/scripts/createKitchenTestData.ts
```

### Bước 3: Khởi động frontend
```bash
cd ..
npm run dev
```

### Bước 4: Test kết nối
1. Mở browser và truy cập `http://localhost:5173/kitchen`
2. Login với tài khoản admin
3. Kiểm tra trạng thái kết nối

## Debug tips

### 1. Kiểm tra Console
Mở Developer Tools (F12) và xem Console để:
- Xem log kết nối SSE
- Kiểm tra lỗi authentication
- Xem heartbeat messages

### 2. Kiểm tra Network
Trong Developer Tools > Network:
- Xem request đến `/api/kitchen/orders`
- Kiểm tra SSE connection
- Xem response status codes

### 3. Kiểm tra Database
```sql
-- Kiểm tra orders
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

-- Kiểm tra products
SELECT * FROM products;

-- Kiểm tra users
SELECT * FROM users;
```

## Các file đã được cập nhật

### Frontend
- `src/components/KitchenDashboard.tsx` - Cải thiện logic kết nối
- `src/components/KitchenPage.tsx` - Component riêng cho route /kitchen
- `src/App.tsx` - Thêm React Router với route /kitchen
- `vite.config.ts` - Thêm proxy configuration
- `test-kitchen-api.html` - File test API
- `test-sse.html` - File test SSE
- `kitchen.html` - File access kitchen dashboard

### Backend
- `backend/src/controllers/kitchenController.ts` - Cải thiện SSE
- `backend/src/scripts/createKitchenTestData.ts` - Script tạo test data

## Kết quả mong đợi
- ✅ Kitchen Dashboard hiển thị "Connected" thay vì "Disconnected"
- ✅ Orders được hiển thị với đầy đủ thông tin
- ✅ Real-time updates hoạt động khi thay đổi trạng thái order
- ✅ Heartbeat duy trì kết nối ổn định
- ✅ Route `/kitchen` hoạt động độc lập với main app

## Troubleshooting

### Nếu vẫn bị disconnected:
1. Kiểm tra backend có chạy không (port 5000)
2. Kiểm tra frontend có chạy không (port 5173)
3. Kiểm tra database connection
4. Kiểm tra authentication token
5. Test với file HTML riêng biệt

### Nếu không có orders:
1. Chạy script tạo test data
2. Kiểm tra database có data không
3. Kiểm tra API endpoint `/api/kitchen/orders`

### Nếu SSE không hoạt động:
1. Kiểm tra CORS settings
2. Kiểm tra authentication trong SSE
3. Test với file `test-sse.html`
4. Kiểm tra Vite proxy configuration

### Nếu route /kitchen không hoạt động:
1. Kiểm tra React Router đã được cài đặt
2. Kiểm tra frontend đang chạy trên đúng port
3. Kiểm tra authentication và permissions
