@echo off
echo 🚀 Final Deployment to Vercel from GitHub...
echo ==================================================

REM Navigate to project root
cd /d "%~dp0"

echo Step 1: Update GitHub repository with latest changes...
git add .
git commit -m "Final deployment configuration - %date% %time%"
if %errorlevel% neq 0 (
    echo ⚠️  No changes to commit - continuing
)

echo Step 2: Push to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ❌ Failed to push to GitHub
    exit /b 1
)

echo Step 3: Deploy to Vercel from GitHub...
echo.
echo 📦 Deploying from: https://github.com/doganlap/shahin-ai-app
echo.

REM Deploy directly from GitHub
call npx vercel --prod --yes
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy to Vercel
    echo.
    echo Please check:
    echo 1. GitHub repository connection at: https://vercel.com/donganksa/shahin-ai-app/settings
    echo 2. Environment variables are properly set
    echo 3. Build settings are correct
    exit /b 1
)

echo.
echo ✅ Deployment Successful!
echo ==================================================
echo.
echo 🌐 Your application is now live!
echo 📁 Repository: https://github.com/doganlap/shahin-ai-app
echo 🚀 Deployment: Check Vercel dashboard for URL
echo.
echo 🔧 API Endpoints:
echo   - Health Check: /health
echo   - Authentication: /api/auth/login
echo   - Organizations: /api/organizations
echo   - All APIs: /api/*
echo.
echo 📱 Frontend: All React pages at root URL
echo.
echo Next steps:
echo 1. Test all API endpoints
echo 2. Verify frontend functionality
echo 3. Configure production database if needed
echo.
pause