@echo off
echo ========================================
echo    POS System - Share Application
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

echo [2/5] Installing serve globally...
call npm install -g serve
echo ✓ Serve installed
echo.

echo [3/5] Starting backend server...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul
echo ✓ Backend server started
echo.

echo [4/5] Starting frontend server...
start "Frontend Server" cmd /k "npx serve -s dist -l 3000"
timeout /t 3 /nobreak >nul
echo ✓ Frontend server started
echo.

echo [5/5] Creating ngrok tunnel...
echo Installing ngrok...
call npm install -g ngrok
echo.
echo Creating tunnel for frontend (port 3000)...
start "Ngrok Frontend" cmd /k "npx ngrok http 3000"
echo.
echo Creating tunnel for backend (port 5000)...
start "Ngrok Backend" cmd /k "npx ngrok http 5000"
echo.

echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo Your application is now running:
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:5000
echo.
echo Check the ngrok windows for public URLs:
echo - Frontend tunnel: https://xxxx-xx-xx-xxx-xx.ngrok.io
echo - Backend tunnel:  https://yyyy-yy-yy-yyy-yy.ngrok.io
echo.
echo Press any key to exit...
pause >nul
