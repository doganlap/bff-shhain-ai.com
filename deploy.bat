@echo off
REM GRC Platform - Production Deployment Script (Windows)
REM Version: 1.0.0
REM Date: 2024-11-13

echo ==========================================
echo 🚀 GRC Platform - Production Deployment
echo ==========================================
echo.

REM Check if we're in the right directory
if not exist "apps\web" (
    echo ❌ Error: Must run from project root directory
    exit /b 1
)

echo 📦 Step 1: Installing dependencies...
cd apps\web
call npm install
if %errorlevel% neq 0 (
    echo ❌ Dependency installation failed
    exit /b 1
)
echo ✅ Dependencies installed
echo.

echo 🔨 Step 2: Building for production...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    exit /b 1
)
echo ✅ Build successful
echo.

echo ✨ Step 3: Build output summary...
dir dist
echo.

echo ==========================================
echo ✅ DEPLOYMENT READY!
echo ==========================================
echo.
echo 📁 Deploy the 'apps\web\dist' folder to your hosting:
echo.
echo Option 1: Manual Upload
echo   - Upload dist\ folder to your web server
echo.
echo Option 2: Vercel
echo   - Run: vercel --prod
echo.
echo Option 3: Netlify
echo   - Run: netlify deploy --prod --dir=dist
echo.
echo Option 4: Azure
echo   - Run: az webapp up --name your-app-name
echo.
echo 🎉 Your GRC Platform is ready for production!
echo.
pause
