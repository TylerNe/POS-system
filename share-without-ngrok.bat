@echo off
echo ========================================
echo    POS System - Share Without Ngrok
echo ========================================
echo.

echo [1/4] Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo Error: Failed to build frontend
    pause
    exit /b 1
)
echo ✓ Frontend built successfully
echo.

echo [2/4] Installing serve globally...
call npm install -g serve
echo ✓ Serve installed
echo.

echo [3/4] Starting backend server...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul
echo ✓ Backend server started
echo.

echo [4/4] Starting frontend server...
start "Frontend Server" cmd /k "npx serve -s dist -l 3000"
timeout /t 2 /nobreak >nul
echo ✓ Frontend server started
echo.

echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo Your application is now running:
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:5000
echo.
echo To share with others on your network:
echo 1. Find your IP address: ipconfig
echo 2. Share this URL: http://YOUR_IP:3000
echo    Example: http://192.168.4.27:3000
echo.
echo Note: Others need to be on the same network
echo.
pause
