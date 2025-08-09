@echo off
title POS System Reset
color 0E

echo.
echo ========================================
echo    🔄 POS SYSTEM - FULL RESET
echo ========================================
echo.

echo ⚠️ This will:
echo    - Stop all running services
echo    - Reset database to initial state
echo    - Clear any cached data
echo    - Restart the system
echo.

set /p confirm="Continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo ❌ Reset cancelled
    pause
    exit /b 0
)

echo.
echo 🛑 Stopping current system...
call stop-pos-system.bat

echo.
echo 🗄️ Resetting database...
cd backend
npm run init-db
cd ..

echo.
echo 📦 Clearing npm cache...
npm cache clean --force >nul 2>&1
cd backend
npm cache clean --force >nul 2>&1
cd ..

echo.
echo 🔄 Installing fresh dependencies...
cd backend
rmdir /s /q node_modules >nul 2>&1
del package-lock.json >nul 2>&1
npm install
cd ..

rmdir /s /q node_modules >nul 2>&1
del package-lock.json >nul 2>&1
npm install

echo.
echo ========================================
echo ✅ RESET COMPLETED SUCCESSFULLY!
echo ========================================
echo.

echo 🚀 Starting fresh system...
call start-pos-system.bat
