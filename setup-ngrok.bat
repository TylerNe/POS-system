@echo off
echo ========================================
echo    POS System - Ngrok Setup
echo ========================================
echo.

echo [1/5] Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo Error: Failed to build frontend
    pause
    exit /b 1
)
echo ✓ Frontend built successfully
echo.

echo [2/5] Starting backend server...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 5 /nobreak >nul
echo ✓ Backend server started
echo.

echo [3/5] Starting frontend server...
start "Frontend Server" cmd /k "npx serve -s dist -l 3000"
timeout /t 3 /nobreak >nul
echo ✓ Frontend server started
echo.

echo [4/5] Creating ngrok tunnel for backend...
start "Ngrok Backend" cmd /k "npx ngrok http 5000"
timeout /t 3 /nobreak >nul
echo ✓ Backend tunnel created
echo.

echo [5/5] Creating ngrok tunnel for frontend...
start "Ngrok Frontend" cmd /k "npx ngrok http 3000"
timeout /t 3 /nobreak >nul
echo ✓ Frontend tunnel created
echo.

echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo Your application is now running:
echo - Frontend (Local): http://localhost:3000
echo - Backend (Local):  http://localhost:5000
echo.
echo Check the ngrok windows for public URLs:
echo - Frontend tunnel: https://xxxx-xx-xx-xxx-xx.ngrok.io
echo - Backend tunnel:  https://yyyy-yy-yy-yyy-yy.ngrok.io
echo.
echo IMPORTANT: When you access the frontend ngrok URL,
echo you'll be prompted to enter the backend ngrok URL.
echo.
pause
