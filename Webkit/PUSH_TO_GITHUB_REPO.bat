@echo off
title Shahin GRC - Push to GitHub Repository
color 0A
echo.
echo ========================================
echo   Shahin GRC - Push to GitHub
echo ========================================
echo.

:: Check git remote
echo Checking git remote...
git remote -v
echo.

:: Remove .env files from git
echo [Step 1/4] Removing .env files from git...
git rm --cached production-deployment/backend/.env.production 2>nul
git rm --cached backend/.env 2>nul
git rm --cached landing-page/.env 2>nul
git rm --cached .env 2>nul
git rm --cached --ignore-unmatch **/.env* 2>nul
echo ✅ Removed .env files
echo.

:: Add all changes
echo [Step 2/4] Staging changes...
git add .
echo ✅ Changes staged
echo.

:: Commit
echo [Step 3/4] Committing changes...
git commit -m "Configure for Cloudflare deployment - Remove secrets and update configuration"
if %errorlevel% neq 0 (
    echo ⚠️  No changes to commit or commit failed
) else (
    echo ✅ Changes committed
)
echo.

:: Push to GitHub
echo [Step 4/4] Pushing to GitHub...
echo.
echo Repository: https://github.com/DoganStore/Shahinpage.git
echo Branch: master
echo.
set /p PUSH="Push to GitHub? (y/n): "
if /i "%PUSH%"=="y" (
    git push -u origin master
    if %errorlevel% equ 0 (
        echo.
        echo ✅ Successfully pushed to GitHub!
        echo.
        echo Repository: https://github.com/DoganStore/Shahinpage
        echo.
        echo Next: Connect to Cloudflare Pages
        echo 1. Go to: https://dash.cloudflare.com
        echo 2. Pages → Create project → Connect to Git
        echo 3. Select: GitHub → DoganStore/Shahinpage
        echo 4. Configure build settings
        echo 5. Deploy!
        echo.
    ) else (
        echo.
        echo ❌ Push failed!
        echo.
        echo If GitHub blocks due to secrets:
        echo 1. Go to: https://github.com/DoganStore/Shahinpage/security/secret-scanning
        echo 2. Allow the secret (if it's a test key)
        echo 3. Or remove it from commit history
        echo.
    )
) else (
    echo Push cancelled
)

pause

