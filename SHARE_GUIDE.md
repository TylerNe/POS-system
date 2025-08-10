# Hướng dẫn chia sẻ POS System

## 🚀 Cách nhanh nhất (Không cần ngrok)

### Chạy script tự động:
```bash
share-without-ngrok.bat
```

### Hoặc thủ công:
```bash
# Build frontend
npm run build

# Chạy backend
cd backend && npm start

# Chạy frontend
npx serve -s dist -l 3000
```

### Chia sẻ trong mạng local:
1. Chạy `get-ip.bat` để lấy IP
2. Chia sẻ URL: `http://YOUR_IP:3000`
3. Người khác cần ở cùng mạng WiFi

---

## 🌐 Cách chia sẻ ra internet (Với ngrok)

### Bước 1: Setup ngrok
```bash
# Chạy script hướng dẫn
ngrok-setup.bat

# Hoặc thủ công:
# 1. Đăng ký: https://dashboard.ngrok.com/signup
# 2. Lấy token: https://dashboard.ngrok.com/get-started/your-authtoken
# 3. Cài token: ngrok config add-authtoken YOUR_TOKEN
```

### Bước 2: Chạy ứng dụng
```bash
quick-share.bat
```

---

## 📋 Các cách khác

### 1. Cloudflare Tunnel
```bash
# Cài đặt
choco install cloudflared

# Tạo tunnel
cloudflared tunnel login
cloudflared tunnel create pos-system
cloudflared tunnel run pos-system
```

### 2. Vercel (Deploy lên cloud)
```bash
npm install -g vercel
vercel
```

### 3. Netlify
```bash
npm run build
# Kéo thả thư mục dist lên netlify.com
```

### 4. GitHub Pages
```bash
npm install --save-dev gh-pages
npm run deploy
```

---

## 🔧 Troubleshooting

### Lỗi CORS
- Backend đã được cấu hình cho phép IP local
- Nếu vẫn lỗi, restart backend

### Lỗi ngrok
- Cần đăng ký tài khoản ngrok
- Cài đặt authtoken
- Chạy `ngrok-setup.bat`

### Lỗi port
- Đảm bảo port 3000 và 5000 không bị chiếm
- Kiểm tra firewall

---

## 📱 Scripts có sẵn

- `share-without-ngrok.bat` - Chia sẻ trong mạng local
- `quick-share.bat` - Chia sẻ với ngrok (cần setup)
- `ngrok-setup.bat` - Hướng dẫn setup ngrok
- `get-ip.bat` - Lấy IP address
- `share.bat` - Script đầy đủ với ngrok

---

## 🌍 Lưu ý quan trọng

1. **Mạng local**: Chỉ hoạt động trong cùng WiFi
2. **Internet**: Cần ngrok hoặc deploy lên cloud
3. **Database**: Nên dùng database cloud cho production
4. **Security**: Chỉ dùng cho demo, không production
