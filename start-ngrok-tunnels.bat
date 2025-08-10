@echo off
echo ========================================
echo    Starting Ngrok Tunnels
echo ========================================
echo.

echo Starting ngrok with configuration file...
ngrok start --all --config ngrok.yml

echo.
echo Tunnels will be available at:
echo - Frontend: https://xxxx-xx-xx-xxx-xx.ngrok.io
echo - Backend:  https://yyyy-yy-yy-yyy-yy.ngrok.io
echo.
echo Check the ngrok window for actual URLs.
echo.
pause
