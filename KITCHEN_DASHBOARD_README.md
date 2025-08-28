# Kitchen Dashboard - Real-time Integration

## 🍽️ Tổng quan

Kitchen Dashboard đã được tích hợp hoàn toàn với POS system để cập nhật real-time. Khi có đơn hàng mới từ POS, kitchen dashboard sẽ tự động hiển thị ngay lập tức.

## ✨ Tính năng

### Real-time Updates
- **Server-Sent Events (SSE)**: Kết nối real-time với backend
- **Auto-refresh**: Tự động cập nhật khi có đơn hàng mới
- **Status synchronization**: Đồng bộ trạng thái đơn hàng giữa POS và Kitchen
- **Connection monitoring**: Hiển thị trạng thái kết nối

### Order Management
- **Live order display**: Hiển thị đơn hàng mới ngay lập tức
- **Status updates**: Cập nhật trạng thái Pending → In Progress → Done
- **Order details**: Số bàn, thời gian, danh sách món, tổng tiền
- **Customer info**: Tên khách hàng (nếu có)

### UI/UX
- **TV-optimized**: Thiết kế cho màn hình lớn trong bếp
- **Color coding**: Màu sắc theo trạng thái đơn hàng
- **Large fonts**: Dễ đọc từ xa
- **Responsive**: Tự động điều chỉnh theo kích thước màn hình

## 🚀 Cài đặt

### 1. Cập nhật Database
```bash
cd backend
npm run ts-node src/scripts/addMetadataToOrders.ts
```

### 2. Khởi động Backend
```bash
cd backend
npm run dev
```

### 3. Khởi động Frontend
```bash
npm run dev
```

## 📱 Cách sử dụng

### Truy cập Kitchen Dashboard
1. Đăng nhập vào POS system
2. Click vào tab "Kitchen" trong navigation
3. Kitchen dashboard sẽ hiển thị với kết nối real-time

### Quản lý đơn hàng
1. **Xem đơn hàng mới**: Đơn hàng sẽ xuất hiện tự động khi có khách đặt
2. **Cập nhật trạng thái**: Click nút để thay đổi trạng thái
   - **Pending** (Vàng): Chờ nấu
   - **In Progress** (Xanh dương): Đang nấu
   - **Done** (Xanh lá): Hoàn thành
3. **Theo dõi kết nối**: Icon WiFi hiển thị trạng thái kết nối

## 🔧 API Endpoints

### Kitchen API
- `GET /api/kitchen/orders` - Lấy danh sách đơn hàng
- `PUT /api/kitchen/orders/:orderId/status` - Cập nhật trạng thái
- `GET /api/kitchen/updates` - Kết nối SSE cho real-time updates

### Real-time Events
- `new_order`: Đơn hàng mới
- `status_update`: Cập nhật trạng thái
- `connected`: Kết nối thành công

## 🎯 Tích hợp với POS

### Tự động thông báo
- Khi tạo đơn hàng mới trong POS → Kitchen dashboard nhận ngay
- Khi cập nhật trạng thái trong Kitchen → POS có thể theo dõi

### Database Schema
```sql
-- Orders table với metadata
ALTER TABLE orders ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;

-- Kitchen status được lưu trong metadata
-- metadata: { "kitchen_status": "Pending|In Progress|Done" }
```

## 🖥️ Hiển thị trên TV

### Cấu hình tối ưu
1. **Fullscreen mode**: F11 để toàn màn hình
2. **Auto-refresh**: Tự động cập nhật mỗi giây
3. **Large display**: Font size tối ưu cho TV
4. **High contrast**: Màu sắc dễ nhìn từ xa

### Layout Responsive
- **1-2 columns**: Mobile/Tablet
- **3-4 columns**: Desktop
- **5+ columns**: Large TV screens

## 🔍 Troubleshooting

### Kết nối bị mất
- Kiểm tra backend có đang chạy không
- Refresh trang để kết nối lại
- Kiểm tra network connection

### Đơn hàng không hiển thị
- Kiểm tra console log
- Verify authentication token
- Kiểm tra database connection

### Performance Issues
- Giảm số lượng đơn hàng hiển thị (24h gần nhất)
- Tối ưu database queries
- Monitor memory usage

## 📊 Monitoring

### Connection Status
- ✅ **Connected**: Kết nối thành công
- ❌ **Disconnected**: Mất kết nối
- 🔄 **Reconnecting**: Đang kết nối lại

### Order Statistics
- Total Orders: Tổng số đơn hàng
- Pending: Chờ xử lý
- In Progress: Đang nấu
- Done: Hoàn thành

## 🎨 Customization

### Thay đổi màu sắc
```css
/* Pending status */
.status-pending { border-left: 8px solid #eab308; }

/* In Progress status */
.status-progress { border-left: 8px solid #3b82f6; }

/* Done status */
.status-done { border-left: 8px solid #22c55e; }
```

### Thay đổi layout
- Điều chỉnh grid columns trong `KitchenDashboard.tsx`
- Thay đổi card size và spacing
- Customize fonts và colors

## 🔐 Security

### Authentication
- Yêu cầu đăng nhập để truy cập
- Role-based access (admin/cashier)
- JWT token validation

### Data Protection
- HTTPS encryption
- Input validation
- SQL injection prevention

---

**Ngày cập nhật**: 28/08/2025  
**Phiên bản**: 1.0  
**Trạng thái**: Hoàn thành và sẵn sàng sử dụng
