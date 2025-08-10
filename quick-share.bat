@echo off
echo ========================================
echo    POS System - Quick Share
echo ========================================
echo.

echo Building and starting application...
call npm run build
call npm install -g serve ngrok

echo.
echo Starting servers...
start "Backend" cmd /k "cd backend && npm start"
timeout /t 2 /nobreak >nul
start "Frontend" cmd /k "npx serve -s dist -l 3000"
timeout /t 2 /nobreak >nul
start "Tunnel" cmd /k "npx ngrok http 3000"

echo.
echo ✓ Application is running!
echo ✓ Check ngrok window for public URL
echo.
pause
