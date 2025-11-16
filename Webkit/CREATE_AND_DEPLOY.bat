@echo off
title Shahin GRC - Create and Deploy to Cloudflare
color 0A
echo.
echo ========================================
echo   Shahin GRC - Create and Deploy
echo ========================================
echo.

:: Check login
wrangler whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Not logged in to Cloudflare
    echo Logging in...
    wrangler login
    if %errorlevel% neq 0 (
        echo ❌ Login failed
        pause
        exit /b 1
    )
)
echo ✅ Logged in to Cloudflare
echo.

:: Build
echo [Step 1/3] Building...
cd landing-page
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Build complete!
echo.

:: Create project and deploy
echo [Step 2/3] Creating Cloudflare Pages project and deploying...
echo.
echo Project will be created automatically on first deploy.
echo.
set PROJECT_NAME=shahin-grc-landing
wrangler pages deploy landing-page/dist --project-name=%PROJECT_NAME% --commit-dirty=true
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Deployment may have issues
    echo.
    echo Alternative: Create project via Cloudflare Dashboard
    echo 1. Go to: https://dash.cloudflare.com
    echo 2. Pages → Create a project
    echo 3. Choose: "Upload assets"
    echo 4. Upload: landing-page\dist folder
    echo.
) else (
    echo.
    echo ✅ Deployed successfully!
    echo.
)
echo.

:: Instructions
echo [Step 3/3] Post-Deployment Configuration
echo.
echo ========================================
echo   Next Steps
echo ========================================
echo.
echo 1. Set Environment Variables:
echo    - Go to: https://dash.cloudflare.com
echo    - Pages → %PROJECT_NAME% → Settings → Environment Variables
echo    - Add:
echo      * VITE_API_URL = https://api.shahin-ai.com/api
echo      * VITE_FRONTEND_URL = https://www.shahin-ai.com
echo.
echo 2. Connect GitHub (for auto-deploy):
echo    - Pages → %PROJECT_NAME% → Settings → Builds & deployments
echo    - Click: "Connect to Git"
echo    - Select: GitHub → www.shahin.com
echo.
echo 3. Add Custom Domain:
echo    - Pages → %PROJECT_NAME% → Custom domains
echo    - Add: www.shahin-ai.com
echo.
echo Opening Cloudflare Dashboard...
timeout /t 2 /nobreak >nul
start https://dash.cloudflare.com

pause

