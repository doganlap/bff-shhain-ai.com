@echo off
title Shahin GRC - Complete Cloudflare Setup
color 0B
echo.
echo ========================================
echo   Complete Cloudflare Pages Setup
echo ========================================
echo.

echo ✅ Deployment Status: LIVE
echo ✅ Project: shahin-grc-landing
echo ✅ URL: https://shahin-grc-landing.pages.dev
echo.

echo ========================================
echo   Step 1: Set Environment Variables
echo ========================================
echo.

echo Opening Cloudflare Dashboard...
echo.
echo In the Dashboard:
echo 1. Go to: Pages → shahin-grc-landing → Settings
echo 2. Click: "Environment variables"
echo 3. Add for Production:
echo    - VITE_API_URL = https://api.shahin-ai.com/api
echo    - VITE_FRONTEND_URL = https://www.shahin-ai.com
echo 4. Click: "Save"
echo 5. Go to: Deployments → Trigger new deployment
echo.

timeout /t 3 /nobreak >nul
start https://dash.cloudflare.com/pages/view/shahin-grc-landing/settings/environment-variables

echo.
set /p ENV_DONE="Have you set the environment variables? (y/n): "

if /i "%ENV_DONE%"=="y" (
    echo.
    echo ✅ Environment variables set
    echo.
) else (
    echo.
    echo ⚠️  Please set environment variables before continuing
    echo.
)

echo ========================================
echo   Step 2: Add Custom Domain
echo ========================================
echo.

echo Opening Custom Domains settings...
echo.
echo In the Dashboard:
echo 1. Go to: Pages → shahin-grc-landing → Custom domains
echo 2. Click: "Set up a custom domain"
echo 3. Enter: www.shahin-ai.com
echo 4. Click: "Continue"
echo 5. Wait for SSL certificate (< 5 minutes)
echo.

timeout /t 2 /nobreak >nul
start https://dash.cloudflare.com/pages/view/shahin-grc-landing/domains

echo.
set /p DOMAIN_DONE="Have you added the custom domain? (y/n): "

if /i "%DOMAIN_DONE%"=="y" (
    echo.
    echo ✅ Custom domain added
    echo.
) else (
    echo.
    echo ⚠️  Custom domain can be added later
    echo.
)

echo ========================================
echo   Step 3: Connect GitHub (Optional)
echo ========================================
echo.

echo This will enable automatic deployments on Git push.
echo.
echo In the Dashboard:
echo 1. Go to: Pages → shahin-grc-landing → Settings
echo 2. Click: "Connect to Git"
echo 3. Select: GitHub
echo 4. Authorize Cloudflare (browser opens)
echo 5. Select repository: doganlap/shahin-landing
echo 6. Configure:
echo    - Production branch: master
echo    - Build command: cd landing-page && npm install && npm run build
echo    - Output directory: landing-page/dist
echo    - Root directory: /
echo    - Node version: 18
echo 7. Click: "Save and Deploy"
echo.

set /p GITHUB_CONNECT="Connect GitHub for auto-deploy? (y/n): "

if /i "%GITHUB_CONNECT%"=="y" (
    echo.
    echo Opening Git integration settings...
    timeout /t 2 /nobreak >nul
    start https://dash.cloudflare.com/pages/view/shahin-grc-landing/settings/git
    echo.
    echo ✅ GitHub connection guide opened
    echo.
) else (
    echo.
    echo ⚠️  GitHub connection skipped (can be done later)
    echo.
)

echo ========================================
echo   Step 4: Verify Deployment
echo ========================================
echo.

echo Opening deployment URL to verify...
timeout /t 2 /nobreak >nul
start https://shahin-grc-landing.pages.dev

echo.
echo ✅ Deployment URL opened in browser
echo.
echo Check that:
echo - Site loads correctly
echo - No console errors
echo - API calls work (if backend is deployed)
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.

echo ✅ Deployment: https://shahin-grc-landing.pages.dev
echo ✅ Custom Domain: https://www.shahin-ai.com (after setup)
echo ✅ GitHub: Connected (if enabled)
echo.

echo Next Steps:
echo 1. Deploy backend API (api.shahin-ai.com)
echo 2. Configure AI services in backend/.env
echo 3. Test all features
echo.

pause
