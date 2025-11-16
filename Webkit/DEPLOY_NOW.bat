@echo off
title Shahin GRC - Deploy to Cloudflare Pages NOW
color 0A
echo.
echo ========================================
echo   Deploy to Cloudflare Pages
echo ========================================
echo.

cd /d "%~dp0"

echo [Step 1/4] Checking build...
if not exist "landing-page\dist\index.html" (
    echo ❌ Build not found. Building now...
    cd landing-page
    call npm install
    call npm run build
    cd ..
    if not exist "landing-page\dist\index.html" (
        echo ❌ Build failed!
        pause
        exit /b 1
    )
    echo ✅ Build complete
) else (
    echo ✅ Build found
)
echo.

echo [Step 2/4] Checking Cloudflare login...
wrangler whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Not logged in to Cloudflare
    echo.
    echo Logging in to Cloudflare...
    wrangler login
    if %errorlevel% neq 0 (
        echo ❌ Login failed!
        pause
        exit /b 1
    )
) else (
    echo ✅ Logged in to Cloudflare
)
echo.

echo [Step 3/4] Deploying to Cloudflare Pages...
echo.
echo Project: shahin-grc-landing
echo Directory: landing-page\dist
echo.

wrangler pages deploy landing-page\dist --project-name=shahin-grc-landing --commit-dirty=true

if %errorlevel% equ 0 (
    echo.
    echo ✅ Successfully deployed to Cloudflare Pages!
    echo.
    echo ========================================
    echo   Next Steps
    echo ========================================
    echo.
    echo 1. Set Environment Variables:
    echo    - Go to: https://dash.cloudflare.com
    echo    - Pages → shahin-grc-landing → Settings
    echo    - Environment Variables:
    echo      * VITE_API_URL = https://api.shahin-ai.com/api
    echo      * VITE_FRONTEND_URL = https://www.shahin-ai.com
    echo.
    echo 2. Add Custom Domain:
    echo    - Pages → shahin-grc-landing → Custom domains
    echo    - Add: www.shahin-ai.com
    echo    - Wait for SSL certificate (< 5 minutes)
    echo.
    echo 3. Your site will be live at:
    echo    https://www.shahin-ai.com
    echo.
) else (
    echo.
    echo ❌ Deployment failed!
    echo.
    echo Troubleshooting:
    echo 1. Check Cloudflare login: wrangler whoami
    echo 2. Verify build exists: landing-page\dist
    echo 3. Check Cloudflare Dashboard: https://dash.cloudflare.com
    echo.
)

pause
