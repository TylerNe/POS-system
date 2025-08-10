@echo off
echo ========================================
echo    Ngrok Setup Guide
echo ========================================
echo.

echo [1/3] Đăng ký tài khoản ngrok:
echo.
echo 1. Truy cập: https://dashboard.ngrok.com/signup
echo 2. Đăng ký tài khoản miễn phí
echo 3. Xác thực email
echo.
pause

echo.
echo [2/3] Lấy authtoken:
echo.
echo 1. Truy cập: https://dashboard.ngrok.com/get-started/your-authtoken
echo 2. Copy authtoken của bạn
echo 3. Nhập authtoken vào terminal khi được yêu cầu
echo.
pause

echo.
echo [3/3] Cài đặt authtoken:
echo.
echo Chạy lệnh sau và nhập authtoken:
echo ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
echo.
echo Thay YOUR_AUTHTOKEN_HERE bằng authtoken thật của bạn
echo.
pause

echo.
echo ✓ Setup hoàn tất! Bây giờ bạn có thể chạy quick-share.bat
echo.
