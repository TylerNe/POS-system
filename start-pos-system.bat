@echo off
title POS System Startup
color 0A

echo.
echo ========================================
echo    🏪 POS SYSTEM - STARTING UP...
echo ========================================
echo.

echo 📋 Checking requirements...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm not found! Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm found
echo.

echo 🔧 Installing dependencies (if needed)...
cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    npm install
)
cd ..

if not exist node_modules (
    echo Installing frontend dependencies...
    npm install
)

echo.
echo 🗄️ Checking PostgreSQL service...
sc query postgresql-x64-17 | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo ⚠️ PostgreSQL service not running. Starting PostgreSQL...
    net start postgresql-x64-17
    timeout /t 3 >nul
)

echo ✅ PostgreSQL is running
echo.

echo 🚀 Starting Backend API Server (Port 5000)...
start "Backend API" cmd /k "cd backend && npm run dev"

echo ⏳ Waiting for backend to start...
timeout /t 5 >nul

echo 🎨 Starting Frontend React App (Port 5173)...
start "Frontend React" cmd /k "npm run dev"

echo.
echo ========================================
echo ✅ POS SYSTEM STARTED SUCCESSFULLY!
echo ========================================
echo.
echo 🔗 URLs:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000/api
echo    Health:   http://localhost:5000/api/health
echo.
echo 👤 Login Credentials:
echo    Admin:    admin / admin123
echo    Cashier:  cashier1 / cashier123
echo.
echo 📝 Commands:
echo    - Press Ctrl+C in any window to stop that service
echo    - Close this window when done
echo.

echo 🌐 Opening frontend in browser...
timeout /t 3 >nul
start http://localhost:5173

echo.
echo ✨ System ready! Happy selling! ✨
echo.
pause
