@echo off
title Shahin GRC - Connect to Cloudflare Pages
color 0B
echo.
echo ========================================
echo   Shahin GRC - Connect to Cloudflare Pages
echo   Repository: DoganStore/Shahinpage
echo ========================================
echo.

echo ✅ GitHub Repository: https://github.com/DoganStore/Shahinpage.git
echo ✅ Cloudflare: Logged in
echo ✅ Build: Ready
echo.

echo ========================================
echo   Connect to Cloudflare Pages
echo ========================================
echo.
echo Steps to connect:
echo.
echo 1. Go to Cloudflare Dashboard:
echo    https://dash.cloudflare.com
echo.
echo 2. Navigate to Pages:
echo    - Click: "Pages" in left sidebar
echo    - Click: "Create a project"
echo.
echo 3. Connect to Git:
echo    - Choose: "Connect to Git"
echo    - Select: "GitHub"
echo    - Authorize Cloudflare (browser will open)
echo    - Accept the authorization
echo    - Select repository: "DoganStore/Shahinpage"
echo    - Click: "Begin setup"
echo.
echo 4. Configure Build Settings:
echo    - Project name: shahin-grc-landing
echo    - Production branch: master
echo    - Framework preset: Vite
echo    - Build command: cd landing-page && npm install && npm run build
echo    - Build output directory: landing-page/dist
echo    - Root directory: / (leave empty)
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
echo.
echo Opening Cloudflare Dashboard...
timeout /t 2 /nobreak >nul
start https://dash.cloudflare.com

echo.
echo ========================================
echo   Repository Information
echo ========================================
echo.
echo GitHub Repository: https://github.com/DoganStore/Shahinpage
echo Cloudflare Account: doganlap@gmail.com
echo Project Name: shahin-grc-landing
echo Domain: www.shahin-ai.com
echo.
echo After connecting, Cloudflare will:
echo - Automatically deploy on every Git push
echo - Create preview deployments for pull requests
echo - Manage SSL certificates automatically
echo.
pause

