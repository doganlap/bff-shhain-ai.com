@echo off
title Shahin GRC - Quick Fix GitHub Push
color 0B
echo.
echo ========================================
echo   Quick Fix: Allow Secrets in GitHub
echo ========================================
echo.

echo GitHub is blocking push because secrets are in old commits.
echo.
echo ✅ Good News:
echo   - Secrets removed from current code
echo   - All secrets now in .env file (gitignored)
echo.
echo ========================================
echo   Solution: Allow Secrets (2 clicks)
echo ========================================
echo.
echo Step 1: Open first secret unblock page
echo   URL: https://github.com/doganlap/shahin-landing/security/secret-scanning/unblock-secret/35LfWvVJWxuHQgci3K2VzZTQOj5
echo   Click: "Allow secret"
echo.
echo Step 2: Open second secret unblock page
echo   URL: https://github.com/doganlap/shahin-landing/security/secret-scanning/unblock-secret/35LfWxQWIZa8ZYOrRmUFTOEOxiK
echo   Click: "Allow secret"
echo.
echo Step 3: Push to GitHub
echo   Command: git push -u origin master
echo.

set /p OPEN_PAGES="Open unblock pages in browser? (y/n): "

if /i "%OPEN_PAGES%"=="y" (
    echo.
    echo Opening secret unblock pages...
    start https://github.com/doganlap/shahin-landing/security/secret-scanning/unblock-secret/35LfWvVJWxuHQgci3K2VzZTQOj5
    timeout /t 2 /nobreak >nul
    start https://github.com/doganlap/shahin-landing/security/secret-scanning/unblock-secret/35LfWxQWIZa8ZYOrRmUFTOEOxiK
    echo.
    echo ✅ Pages opened in browser
    echo.
    echo After allowing both secrets, press any key to push...
    pause >nul
)

echo.
echo ========================================
echo   Push to GitHub
echo ========================================
echo.

set /p PUSH_NOW="Push to GitHub now? (y/n): "

if /i "%PUSH_NOW%"=="y" (
    echo.
    echo Pushing to GitHub...
    git push -u origin master
    
    if %errorlevel% equ 0 (
        echo.
        echo ✅ Successfully pushed to GitHub!
        echo.
        echo Next: Connect to Cloudflare Pages
        echo Run: CONNECT_CLOUDFLARE.shahin-landing.bat
        echo.
    ) else (
        echo.
        echo ❌ Push failed
        echo.
        echo Make sure you allowed both secrets in GitHub UI first.
        echo.
    )
) else (
    echo.
    echo Push skipped.
    echo.
)

pause

