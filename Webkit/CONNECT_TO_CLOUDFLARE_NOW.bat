@echo off
title Shahin GRC - Connect to Cloudflare Pages NOW
color 0B
echo.
echo ========================================
echo   Connect to Cloudflare Pages
echo   Repository: doganlap/shahin-landing
echo ========================================
echo.

echo ✅ GitHub Repository: https://github.com/doganlap/shahin-landing
echo ✅ Code Status: Pushed to master branch
echo ✅ Build: Ready (0.54 MB)
echo.

echo ========================================
echo   Cloudflare Pages Setup
echo ========================================
echo.

echo Step 1: Go to Cloudflare Dashboard
echo   URL: https://dash.cloudflare.com
echo.
echo Step 2: Create Pages Project
echo   - Click: "Pages" in left sidebar
echo   - Click: "Create a project"
echo   - Click: "Connect to Git"
echo.
echo Step 3: Connect GitHub
echo   - Select: "GitHub"
echo   - Authorize Cloudflare (browser opens)
echo   - Select repository: "doganlap/shahin-landing"
echo   - Click: "Begin setup"
echo.
echo Step 4: Configure Build Settings
echo   - Project name: shahin-grc-landing
echo   - Production branch: master
echo   - Framework preset: Vite
echo   - Build command: cd landing-page && npm install && npm run build
echo   - Build output directory: landing-page/dist
echo   - Root directory: / (leave empty)
echo   - Node version: 18
echo.
echo Step 5: Set Environment Variables
echo   Click "Environment variables" and add:
echo   - VITE_API_URL = https://api.shahin-ai.com/api
echo   - VITE_FRONTEND_URL = https://www.shahin-ai.com
echo.
echo Step 6: Deploy
echo   - Click: "Save and Deploy"
echo   - Wait 2-3 minutes for build
echo   - Deployment URL: https://shahin-grc-landing.pages.dev
echo.

echo ========================================
echo   Opening Cloudflare Dashboard
echo ========================================
echo.

timeout /t 3 /nobreak >nul
start https://dash.cloudflare.com

echo.
echo ✅ Cloudflare Dashboard opened in browser
echo.
echo Follow the steps above to connect your repository.
echo.
echo After deployment:
echo 1. Add custom domain: www.shahin-ai.com
echo 2. Set up Cloudflare Tunnel for backend
echo 3. Configure AI services in backend/.env
echo.
echo ========================================
echo   Quick Links
echo ========================================
echo.
echo GitHub Repository:
echo https://github.com/doganlap/shahin-landing
echo.
echo Cloudflare Dashboard:
echo https://dash.cloudflare.com
echo.
echo Cloudflare Pages:
echo https://dash.cloudflare.com/pages
echo.
echo Zero Trust (for Tunnel):
echo https://one.dash.cloudflare.com
echo.

pause

