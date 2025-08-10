@echo off
echo ========================================
echo    POS System - Share with Ngrok
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

echo [2/4] Starting backend server...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 5 /nobreak >nul
echo ✓ Backend server started
echo.

echo [3/4] Starting frontend server...
start "Frontend Server" cmd /k "npx serve -s dist -l 3000"
timeout /t 3 /nobreak >nul
echo ✓ Frontend server started
echo.

echo [4/4] Starting ngrok tunnels...
start "Ngrok Tunnels" cmd /k "ngrok start --all --config ngrok.yml"
timeout /t 3 /nobreak >nul
echo ✓ Ngrok tunnels started
echo.

echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo Your application is now running:
echo - Frontend (Local): http://localhost:3000
echo - Backend (Local):  http://localhost:5000
echo.
echo Public URLs (check ngrok window):
echo - Frontend: https://xxxx-xx-xx-xxx-xx.ngrok.io
echo - Backend:  https://yyyy-yy-yy-yyy-yy.ngrok.io
echo.
echo IMPORTANT: When you access the frontend URL,
echo you'll be prompted to enter the backend URL.
echo.
echo Share the frontend URL after entering backend URL.
echo.
pause
