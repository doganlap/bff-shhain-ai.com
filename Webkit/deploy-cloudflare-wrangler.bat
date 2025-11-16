@echo off
title Shahin GRC - Deploy via Wrangler CLI
color 0C
echo.
echo ========================================
echo   Shahin GRC - Wrangler CLI Deployment
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

:: Check if Wrangler is installed
where wrangler >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Wrangler CLI not found. Installing...
    npm install -g wrangler
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Wrangler
        echo.
        echo Please install manually:
        echo   npm install -g wrangler
        pause
        exit /b 1
    )
)

echo ✅ Wrangler CLI found
echo.

:: Build
echo [Step 1/4] Building for production...
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

:: Verify build output
echo [Step 2/4] Verifying build output...
if not exist "landing-page\dist\index.html" (
    echo ❌ Build output not found!
    pause
    exit /b 1
)
echo ✅ Build output verified
echo.

:: Login to Cloudflare
echo [Step 3/4] Login to Cloudflare...
echo.
echo You will be prompted to login to Cloudflare.
echo Please follow the instructions in your browser.
echo.
wrangler login
if %errorlevel% neq 0 (
    echo ❌ Login failed!
    pause
    exit /b 1
)
echo ✅ Login successful
echo.

:: Deploy
echo [Step 4/4] Deploying to Cloudflare Pages...
echo.
echo Project name: shahin-grc-landing
echo Deployment directory: landing-page\dist
echo.
wrangler pages deploy landing-page\dist --project-name=shahin-grc-landing
if %errorlevel% neq 0 (
    echo ❌ Deployment failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Deployment Complete! ✅
echo ========================================
echo.
echo Next steps:
echo 1. Set environment variables in Cloudflare Dashboard:
echo    - VITE_API_URL = https://api.shahin-ai.com/api
echo    - VITE_FRONTEND_URL = https://www.shahin-ai.com
echo.
echo 2. Configure custom domain:
echo    - Add custom domain: www.shahin-ai.com
echo    - Wait for SSL certificate
echo.
echo 3. Test deployment:
echo    - Visit your deployed site
echo    - Test all features
echo.
pause

