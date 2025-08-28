@echo off
echo 🚀 Railway Deployment Helper
echo ===========================

echo.
echo 📋 Pre-deployment checklist:
echo ✅ Code pushed to GitHub
echo ✅ Railway account created
echo ✅ Environment variables configured
echo.

echo 🔧 Building project locally (optional test)...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed! Please fix errors before deploying.
    pause
    exit /b 1
)

echo ✅ Build successful!
echo.

echo 📤 Next steps for Railway deployment:
echo.
echo 1. Go to https://railway.app/dashboard
echo 2. Click "New Project" → "Deploy from GitHub repo"
echo 3. Select your repository
echo 4. Add PostgreSQL database (+ New → Database → PostgreSQL)
echo 5. Configure environment variables:
echo    - NODE_ENV=production
echo    - JWT_SECRET=your-secure-secret
echo    - CORS_ORIGIN=https://your-app.railway.app
echo.
echo 6. Railway will auto-deploy from your GitHub repo
echo.

echo 🎉 Your app will be available at: https://your-app-name.up.railway.app
echo.

echo 📖 For detailed instructions, see: RAILWAY_DEPLOYMENT.md
echo.

pause
