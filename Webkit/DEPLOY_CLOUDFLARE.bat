@echo off
title Shahin GRC - Deploy to Cloudflare
color 0B
echo.
echo ========================================
echo   Shahin GRC - Cloudflare Deployment
echo   Domain: www.shahin-ai.com
echo ========================================
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

:: Check if Wrangler is installed
where wrangler >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Wrangler CLI not found. Installing...
    npm install -g wrangler
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Wrangler
        pause
        exit /b 1
    )
)

echo ✅ Wrangler CLI found
echo.

:: Install frontend dependencies
echo [1/4] Installing frontend dependencies...
cd landing-page
if not exist "node_modules" (
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)
cd ..

:: Build frontend
echo.
echo [2/4] Building frontend for production...
cd landing-page
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
cd ..

echo ✅ Build complete!
echo.

:: Check if dist folder exists
if not exist "landing-page\dist" (
    echo ❌ Build output not found!
    pause
    exit /b 1
)

echo ✅ Build output found: landing-page\dist
echo.

:: Test build locally
echo [3/4] Testing build locally...
cd landing-page
start "Test Build" cmd /k "npm run preview"
timeout /t 3 /nobreak >nul
cd ..

echo.
echo [4/4] Deployment Options:
echo.
echo Option 1: Deploy via Cloudflare Dashboard
echo   1. Go to https://dash.cloudflare.com
echo   2. Navigate to Pages
echo   3. Create new project or connect Git repository
echo   4. Upload landing-page\dist folder
echo   5. Set environment variables:
echo      - VITE_API_URL = https://api.shahin-ai.com/api
echo      - VITE_FRONTEND_URL = https://www.shahin-ai.com
echo.
echo Option 2: Deploy via Wrangler CLI
echo   1. Run: wrangler login
echo   2. Run: wrangler pages deploy landing-page\dist --project-name=shahin-grc-landing
echo.
echo Option 3: Deploy via Git (Recommended)
echo   1. Push code to Git repository
echo   2. Connect repository to Cloudflare Pages
echo   3. Configure build settings:
echo      - Build command: cd landing-page && npm install && npm run build
echo      - Output directory: landing-page/dist
echo      - Root directory: /
echo.
echo ========================================
echo   Build Complete - Ready for Deployment
echo ========================================
echo.
echo Build output: landing-page\dist
echo Preview running at: http://localhost:4173
echo.
echo Press any key to open Cloudflare Dashboard...
pause >nul

:: Open Cloudflare dashboard
start https://dash.cloudflare.com

echo.
echo ========================================
echo   Deployment Setup Complete!
echo ========================================
echo.
pause

