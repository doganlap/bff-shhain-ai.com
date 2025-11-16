@echo off
title Shahin GRC - Auto Push After Allowing Secrets
color 0A
echo.
echo ========================================
echo   Auto Push to GitHub
echo ========================================
echo.

echo ⏳ Waiting 10 seconds for you to allow secrets in GitHub...
echo.
echo If you haven't allowed the secrets yet:
echo 1. Go to the browser windows that opened
echo 2. Click "Allow secret" on both pages
echo 3. Come back here
echo.

timeout /t 10 /nobreak

echo.
echo ========================================
echo   Attempting Push
echo ========================================
echo.

cd d:\Projects\www.shahin.com
git push -u origin master

if %errorlevel% equ 0 (
    echo.
    echo ✅ Successfully pushed to GitHub!
    echo.
    echo Repository: https://github.com/doganlap/shahin-landing
    echo.
    echo ========================================
    echo   Next: Connect to Cloudflare Pages
    echo ========================================
    echo.
    echo Run: CONNECT_CLOUDFLARE.shahin-landing.bat
    echo.
    echo Or open Cloudflare Dashboard:
    echo https://dash.cloudflare.com
    echo.
) else (
    echo.
    echo ❌ Push failed
    echo.
    echo This means:
    echo 1. Secrets were not allowed in GitHub UI yet
    echo 2. Or GitHub is still blocking
    echo.
    echo Solutions:
    echo.
    echo Option 1: Allow secrets in GitHub UI (recommended)
    echo   - Go to the browser windows
    echo   - Click "Allow secret" on both pages
    echo   - Run this script again
    echo.
    echo Option 2: Rewrite git history (advanced)
    echo   - Run: REMOVE_SECRETS_FROM_HISTORY.bat
    echo   - This will remove secrets from all commits
    echo.
)

pause

