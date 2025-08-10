@echo off
echo ========================================
echo    Restarting Backend Server
echo ========================================
echo.

echo Stopping existing backend processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Starting backend server...
cd backend
npm start
