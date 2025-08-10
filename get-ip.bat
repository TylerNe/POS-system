@echo off
echo ========================================
echo    Your Network Information
echo ========================================
echo.

echo Finding your IP addresses...
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set ip=%%a
    set ip=!ip: =!
    echo Local IP: !ip!
    echo Share URL: http://!ip!:3000
    echo.
)

echo ========================================
echo    Quick Share URLs
echo ========================================
echo.
echo For people on the same network:
echo - Frontend: http://YOUR_IP:3000
echo - Backend:  http://YOUR_IP:5000
echo.
echo For people outside your network:
echo - You need ngrok or similar service
echo - Run: ngrok-setup.bat first
echo.
pause
