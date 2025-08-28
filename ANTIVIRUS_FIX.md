# Hướng dẫn xử lý vấn đề Antivirus với lucide-react

## Vấn đề
Windows Defender hoặc các phần mềm antivirus khác có thể báo cáo sai (false positive) về file `chrome.js` trong thư viện `lucide-react`.

## Giải pháp đã áp dụng

### 1. Cập nhật phiên bản
- Đã hạ cấp `lucide-react` từ `^0.539.0` xuống `^0.263.1`
- Đã hạ cấp `react` và `react-dom` từ `^19.1.1` xuống `^18.2.0`

### 2. Cài đặt lại dependencies
```bash
npm cache clean --force
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install --legacy-peer-deps
```

## Nếu vẫn gặp vấn đề

### Thêm thư mục vào whitelist
1. Mở Windows Defender Security Center
2. Vào "Virus & threat protection"
3. Chọn "Manage settings"
4. Trong "Exclusions", thêm thư mục dự án

### Hoặc tạm thời tắt real-time protection
1. Mở Windows Defender Security Center
2. Vào "Virus & threat protection"
3. Tắt "Real-time protection" tạm thời
4. Chạy `npm install`
5. Bật lại real-time protection

### Sử dụng yarn thay vì npm
```bash
npm install -g yarn
yarn install
```

## Lưu ý
- Đây là false positive, không phải virus thật
- Thư viện `lucide-react` là an toàn và được sử dụng rộng rãi
- Có thể báo cáo false positive cho Microsoft để họ cập nhật database

## Kiểm tra
Sau khi áp dụng các giải pháp trên, chạy:
```bash
npm run dev
```

Ứng dụng sẽ chạy bình thường mà không có lỗi antivirus.
