@echo off
REM Quick Vercel Deployment Script
echo ==========================================
echo 🚀 Vercel Deployment for GRC Platform
echo ==========================================
echo.

cd apps\web

echo Step 1: Building application...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
echo ✅ Build successful!
echo.

echo Step 2: Deploying to Vercel...
echo.
echo Choose deployment type:
echo 1. Preview (test URL)
echo 2. Production (live URL)
echo.
set /p choice="Enter choice (1 or 2): "

if "%choice%"=="1" (
    echo Deploying to preview...
    vercel
) else if "%choice%"=="2" (
    echo Deploying to production...
    vercel --prod
) else (
    echo Invalid choice. Defaulting to preview...
    vercel
)

echo.
echo ==========================================
echo ✅ Deployment Complete!
echo ==========================================
echo.
echo Your GRC Platform is now live on Vercel!
echo Check the URL above to access it.
echo.
pause
