@echo off
title Shahin GRC - Auto Deploy to Cloudflare
color 0A
echo.
echo ========================================
echo   Shahin GRC - Auto Deploy to Cloudflare
echo ========================================
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

:: Check Wrangler
where wrangler >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Wrangler not found. Installing...
    npm install -g wrangler
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Wrangler
        pause
        exit /b 1
    )
)

echo ✅ Wrangler found
echo.

:: Build
echo [Step 1/5] Building for production...
cd landing-page
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
cd ..
echo ✅ Build complete!
echo.

:: Verify build
echo [Step 2/5] Verifying build output...
if not exist "landing-page\dist\index.html" (
    echo ❌ Build output not found!
    pause
    exit /b 1
)
echo ✅ Build output verified
echo.

:: Check login status
echo [Step 3/5] Checking Cloudflare login status...
wrangler whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Not logged in to Cloudflare
    echo.
    echo You need to login to Cloudflare first.
    echo This will open your browser for authentication.
    echo.
    pause
    echo.
    echo Logging in to Cloudflare...
    wrangler login
    if %errorlevel% neq 0 (
        echo ❌ Login failed!
        echo.
        echo Please login manually:
        echo   wrangler login
        pause
        exit /b 1
    )
) else (
    echo ✅ Already logged in to Cloudflare
)
echo.

:: Deploy
echo [Step 4/5] Deploying to Cloudflare Pages...
echo.
echo Project: shahin-grc-landing
echo Directory: landing-page\dist
echo.
wrangler pages deploy landing-page\dist --project-name=shahin-grc-landing
if %errorlevel% neq 0 (
    echo.
    echo ❌ Deployment failed!
    echo.
    echo Please check:
    echo 1. You are logged in to Cloudflare
    echo 2. You have permission to deploy
    echo 3. Project name is correct
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Deployment Complete! ✅
echo ========================================
echo.

:: Post-deployment instructions
echo [Step 5/5] Post-Deployment Configuration
echo.
echo ⚠️  IMPORTANT: Configure the following in Cloudflare Dashboard:
echo.
echo 1. Environment Variables:
echo    - Go to: https://dash.cloudflare.com
echo    - Navigate to: Pages → shahin-grc-landing → Settings → Environment Variables
echo    - Add:
echo      * VITE_API_URL = https://api.shahin-ai.com/api
echo      * VITE_FRONTEND_URL = https://www.shahin-ai.com
echo.
echo 2. Custom Domain:
echo    - Go to: Pages → shahin-grc-landing → Custom domains
echo    - Add: www.shahin-ai.com
echo    - Wait for SSL certificate (< 5 minutes)
echo.
echo 3. Test Deployment:
echo    - Visit your deployed site
echo    - Test AI agent
echo    - Test all features
echo.
echo ========================================
echo   Deployment Successful! 🎉
echo ========================================
echo.
echo Your site is now deployed to Cloudflare Pages!
echo.
echo Next: Configure environment variables and custom domain
echo.
pause

