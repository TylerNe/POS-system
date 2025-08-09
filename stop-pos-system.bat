@echo off
title POS System Shutdown
color 0C

echo.
echo ========================================
echo    🛑 POS SYSTEM - SHUTTING DOWN...
echo ========================================
echo.

echo 🔍 Finding and stopping Node.js processes...

:: Kill all node processes (this will stop both frontend and backend)
tasklist /fi "imagename eq node.exe" 2>NUL | find /i /n "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo 🔴 Stopping all Node.js processes...
    taskkill /f /im node.exe >nul 2>&1
    echo ✅ Node.js processes stopped
) else (
    echo ℹ️ No Node.js processes found
)

:: Also kill any npm processes
tasklist /fi "imagename eq npm.cmd" 2>NUL | find /i /n "npm.cmd">NUL
if "%ERRORLEVEL%"=="0" (
    echo 🔴 Stopping npm processes...
    taskkill /f /im npm.cmd >nul 2>&1
)

:: Kill any cmd windows that might be running the servers
for /f "tokens=2" %%i in ('tasklist /fi "windowtitle eq Backend API*" /fo csv 2^>nul ^| find /v "INFO"') do (
    if not "%%i"=="PID" taskkill /f /pid %%i >nul 2>&1
)

for /f "tokens=2" %%i in ('tasklist /fi "windowtitle eq Frontend React*" /fo csv 2^>nul ^| find /v "INFO"') do (
    if not "%%i"=="PID" taskkill /f /pid %%i >nul 2>&1
)

echo.
echo 🧹 Cleaning up ports...
:: Kill anything on port 5000 (backend)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
    echo Killing process on port 5000: %%a
    taskkill /f /pid %%a >nul 2>&1
)

:: Kill anything on port 5173 (frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
    echo Killing process on port 5173: %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo ========================================
echo ✅ POS SYSTEM STOPPED SUCCESSFULLY!
echo ========================================
echo.
echo 💡 You can now:
echo    - Restart with start-pos-system.bat
echo    - Make code changes safely
echo    - Run individual services manually
echo.

timeout /t 3 >nul
exit
