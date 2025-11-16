@echo off
title Shahin GRC - Create and Deploy Cloudflare Pages
color 0B
echo.
echo ========================================
echo   Create Cloudflare Pages Project
echo ========================================
echo.

echo ⚠️  Project doesn't exist yet. Creating it...
echo.

echo Option 1: Create via Dashboard (Recommended)
echo   1. Go to: https://dash.cloudflare.com
echo   2. Pages → Create a project
echo   3. Connect to Git → GitHub → doganlap/shahin-landing
echo   4. Configure build settings
echo   5. Deploy automatically
echo.

echo Option 2: Create via Wrangler CLI (Then deploy)
echo   This will create the project, then deploy
echo.

set /p CREATE_METHOD="Create project via Dashboard (1) or Wrangler (2)? (1/2): "

if "%CREATE_METHOD%"=="1" (
    echo.
    echo Opening Cloudflare Dashboard...
    start https://dash.cloudflare.com/pages
    echo.
    echo Follow these steps:
    echo 1. Click "Create a project"
    echo 2. Click "Connect to Git"
    echo 3. Select "GitHub"
    echo 4. Authorize Cloudflare
    echo 5. Select repository: doganlap/shahin-landing
    echo 6. Configure:
    echo    - Project name: shahin-grc-landing
    echo    - Production branch: master
    echo    - Build command: cd landing-page && npm install && npm run build
    echo    - Output directory: landing-page/dist
    echo    - Node version: 18
    echo 7. Add environment variables:
    echo    - VITE_API_URL = https://api.shahin-ai.com/api
    echo    - VITE_FRONTEND_URL = https://www.shahin-ai.com
    echo 8. Click "Save and Deploy"
    echo.
    echo After deployment, press any key to continue...
    pause >nul
    goto :end
)

if "%CREATE_METHOD%"=="2" (
    echo.
    echo Creating project via Wrangler CLI...
    wrangler pages project create shahin-grc-landing --production-branch=master
    
    if %errorlevel% equ 0 (
        echo.
        echo ✅ Project created!
        echo.
        echo Deploying...
        wrangler pages deploy landing-page\dist --project-name=shahin-grc-landing --commit-dirty=true
        
        if %errorlevel% equ 0 (
            echo.
            echo ✅ Successfully deployed!
            echo.
            echo Next: Set environment variables in Dashboard
            echo https://dash.cloudflare.com
            echo.
        ) else (
            echo.
            echo ❌ Deployment failed
            echo.
        )
    ) else (
        echo.
        echo ❌ Project creation failed
        echo.
        echo Try creating via Dashboard instead (Option 1)
        echo.
    )
    goto :end
)

:end
pause

