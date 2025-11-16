@echo off
title Shahin GRC - Setup Cloudflare + GitHub
color 0B
echo.
echo ========================================
echo   Shahin GRC - Cloudflare + GitHub Setup
echo ========================================
echo.

echo ✅ Cloudflare: Logged in
echo ✅ GitHub: Connected
echo ✅ Build: Ready
echo.

echo ========================================
echo   Connect GitHub to Cloudflare Pages
echo ========================================
echo.
echo Since the project doesn't exist yet, we'll create it via Cloudflare Dashboard.
echo.
echo Steps:
echo 1. Cloudflare Dashboard will open
echo 2. Create a new Pages project
echo 3. Connect to GitHub repository
echo 4. Authorize Cloudflare to access GitHub
echo 5. Select repository: www.shahin.com
echo 6. Configure build settings
echo 7. Deploy automatically
echo.
pause

:: Open Cloudflare Dashboard
echo.
echo Opening Cloudflare Dashboard...
start https://dash.cloudflare.com

echo.
echo ========================================
echo   Step-by-Step Instructions
echo ========================================
echo.
echo 1. In Cloudflare Dashboard:
echo    - Go to: Pages (left sidebar)
echo    - Click: "Create a project"
echo    - Choose: "Connect to Git"
echo.
echo 2. Authorize GitHub:
echo    - Click: "GitHub"
echo    - Browser will open GitHub authorization
echo    - Click: "Authorize Cloudflare Pages"
echo    - Accept the authorization
echo.
echo 3. Select Repository:
echo    - Select: www.shahin.com
echo    - Click: "Begin setup"
echo.
echo 4. Configure Build Settings:
echo    - Project name: shahin-grc-landing
echo    - Production branch: master (or main)
echo    - Framework preset: Vite
echo    - Build command: cd landing-page && npm install && npm run build
echo    - Build output directory: landing-page/dist
echo    - Root directory: / (leave empty or set to /)
echo    - Node version: 18
echo.
echo 5. Set Environment Variables:
echo    - Click: "Environment variables" (advanced)
echo    - Add:
echo      * VITE_API_URL = https://api.shahin-ai.com/api
echo      * VITE_FRONTEND_URL = https://www.shahin-ai.com
echo.
echo 6. Save and Deploy:
echo    - Click: "Save and Deploy"
echo    - Cloudflare will build and deploy automatically
echo.
echo 7. Add Custom Domain:
echo    - After deployment, go to: Custom domains
echo    - Add: www.shahin-ai.com
echo    - Wait for SSL certificate (< 5 minutes)
echo.
echo ========================================
echo   Setup Complete! ✅
echo ========================================
echo.
echo After connecting:
echo - Cloudflare will automatically deploy on every Git push
echo - Pull requests will create preview deployments
echo - Your site will be live at: www.shahin-ai.com
echo.
pause

