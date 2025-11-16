@echo off
title Shahin GRC - Open Cloudflare Setup Pages
color 0A
echo.
echo ========================================
echo   Cloudflare Pages Setup
echo ========================================
echo.

echo ✅ Deployment: LIVE
echo ✅ Project: shahin-grc-landing
echo ✅ URL: https://shahin-grc-landing.pages.dev
echo.

echo Opening Cloudflare Dashboard pages...
echo.

echo [1/3] Opening Environment Variables...
timeout /t 1 /nobreak >nul
start https://dash.cloudflare.com/pages/view/shahin-grc-landing/settings/environment-variables

echo [2/3] Opening Custom Domains...
timeout /t 2 /nobreak >nul
start https://dash.cloudflare.com/pages/view/shahin-grc-landing/domains

echo [3/3] Opening Git Settings...
timeout /t 2 /nobreak >nul
start https://dash.cloudflare.com/pages/view/shahin-grc-landing/settings/git

echo.
echo ✅ All pages opened in browser
echo.

echo ========================================
echo   Quick Setup Guide
echo ========================================
echo.

echo 1. SET ENVIRONMENT VARIABLES:
echo    - Add: VITE_API_URL = https://api.shahin-ai.com/api
echo    - Add: VITE_FRONTEND_URL = https://www.shahin-ai.com
echo    - Click: Save
echo    - Trigger new deployment
echo.

echo 2. ADD CUSTOM DOMAIN:
echo    - Enter: www.shahin-ai.com
echo    - Click: Continue
echo    - Wait for SSL certificate (< 5 minutes)
echo.

echo 3. CONNECT GITHUB (Optional):
echo    - Click: Connect to Git
echo    - Select: GitHub
echo    - Authorize Cloudflare
echo    - Select: doganlap/shahin-landing
echo    - Configure build settings
echo    - Click: Save and Deploy
echo.

echo ========================================
echo   Documentation
echo ========================================
echo.

echo See these files for detailed instructions:
echo - SET_ENV_VARS_CLOUDFLARE.md
echo - ADD_CUSTOM_DOMAIN_CLOUDFLARE.md
echo - CONNECT_GITHUB_CLOUDFLARE.md
echo - DEPLOYMENT_SUCCESS.md
echo.

pause

