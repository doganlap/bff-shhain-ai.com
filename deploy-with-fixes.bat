@echo off
setlocal enabledelayedexpansion

REM Quick Vercel Deployment Script for GRC Project (Windows)
REM This script updates environment variables and redeploys both applications

echo 🚀 Starting Vercel deployment for GRC project...

REM Check if vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Vercel CLI is not installed. Installing...
    npm install -g vercel
    if errorlevel 1 (
        echo ❌ Failed to install Vercel CLI
        pause
        exit /b 1
    )
)

REM Environment variables
set "FRONTEND_ORIGINS=https://app-shahin-ai-com.vercel.app,https://app-shahin-ai-1uwk5615e-donganksa.vercel.app,https://grc-dashboard-ivory.vercel.app,https://shahin-ai.com,https://www.shahin-ai.com,https://dogan-ai.com,http://localhost:5173,http://localhost:3000"
set "BFF_URL=https://bff-shahin-ai-com.vercel.app"

echo.
echo 📋 Step 1: Updating BFF Environment Variables
cd apps\bff

REM Remove old environment variables if they exist
echo Removing old environment variables...
vercel env rm FRONTEND_ORIGINS production --yes >nul 2>&1
vercel env rm PUBLIC_BFF_URL production --yes >nul 2>&1

REM Add new environment variables
echo Adding FRONTEND_ORIGINS...
echo !FRONTEND_ORIGINS! | vercel env add FRONTEND_ORIGINS production
if errorlevel 1 (
    echo ❌ Failed to add FRONTEND_ORIGINS
    pause
    exit /b 1
)

echo Adding PUBLIC_BFF_URL...
echo !BFF_URL! | vercel env add PUBLIC_BFF_URL production
if errorlevel 1 (
    echo ❌ Failed to add PUBLIC_BFF_URL
    pause
    exit /b 1
)

echo ✅ BFF environment variables updated

echo.
echo 📋 Step 2: Updating Web App Environment Variables
cd ..\web

REM Remove old environment variables if they exist
echo Removing old environment variables...
vercel env rm VITE_BFF_URL production --yes >nul 2>&1
vercel env rm VITE_API_BASE_URL production --yes >nul 2>&1

REM Add new environment variables
echo Adding VITE_BFF_URL...
echo !BFF_URL! | vercel env add VITE_BFF_URL production
if errorlevel 1 (
    echo ❌ Failed to add VITE_BFF_URL
    pause
    exit /b 1
)

echo Adding VITE_API_BASE_URL...
echo !BFF_URL!/api | vercel env add VITE_API_BASE_URL production
if errorlevel 1 (
    echo ❌ Failed to add VITE_API_BASE_URL
    pause
    exit /b 1
)

echo ✅ Web app environment variables updated

echo.
echo 📋 Step 3: Deploying BFF Application
cd ..\bff
echo Deploying BFF...
vercel --prod --yes
if errorlevel 1 (
    echo ❌ Failed to deploy BFF
    pause
    exit /b 1
)
echo ✅ BFF deployed successfully

echo.
echo 📋 Step 4: Deploying Web Application
cd ..\web
echo Deploying Web App...
vercel --prod --yes
if errorlevel 1 (
    echo ❌ Failed to deploy Web App
    pause
    exit /b 1
)
echo ✅ Web application deployed successfully

echo.
echo 📋 Step 5: Deployment Summary
echo.
echo 🎉 Deployment completed successfully!
echo.
echo 📊 Deployment URLs:
echo    BFF API: !BFF_URL!
echo    Web App: https://app-shahin-ai-com.vercel.app
echo.
echo 🔧 CORS Origins Configured:
echo    ✅ https://app-shahin-ai-com.vercel.app
echo    ✅ https://app-shahin-ai-1uwk5615e-donganksa.vercel.app
echo    ✅ https://grc-dashboard-ivory.vercel.app
echo    ✅ https://shahin-ai.com
echo    ✅ https://www.shahin-ai.com
echo    ✅ https://dogan-ai.com
echo    ✅ http://localhost:5173 (development)
echo    ✅ http://localhost:3000 (development)
echo.
echo 🧪 Testing URLs:
echo    API Health: !BFF_URL!/api/health
echo    Web App: https://app-shahin-ai-com.vercel.app
echo.
echo ✨ Your applications should now work without CORS errors!
echo    Wait 1-2 minutes for DNS propagation, then test your application.

cd ..\..

echo.
echo ✅ Deployment script completed
echo Press any key to exit...
pause >nul
