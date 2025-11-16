@echo off
title Shahin GRC - Fix Secrets and Push to GitHub
color 0A
echo.
echo ========================================
echo   Fix Secrets and Push to GitHub
echo ========================================
echo.

echo [Step 1/3] Removing secrets from git history...
echo.

:: Remove .env files from git cache
git rm --cached production-deployment/backend/.env.production 2>nul
git rm --cached backend/.env 2>nul
git rm --cached landing-page/.env 2>nul
git rm --cached .env 2>nul

echo ✅ Removed .env files from git
echo.

echo [Step 2/3] Staging changes...
git add -A
echo ✅ Changes staged
echo.

echo [Step 3/3] Committing changes...
git commit -m "Remove API keys - use .env file for local configuration"
if %errorlevel% neq 0 (
    echo ⚠️  No changes to commit
) else (
    echo ✅ Changes committed
)
echo.

echo ========================================
echo   Push to GitHub
echo ========================================
echo.
echo Repository: https://github.com/doganlap/shahin-landing.git
echo.
echo ⚠️  GitHub may still block if secrets are in commit history
echo.
echo Options:
echo 1. Push now (may fail if secrets in old commits)
echo 2. Use GitHub UI to allow secrets (if test keys)
echo 3. Rewrite git history (advanced)
echo.
set /p PUSH_CHOICE="Push to GitHub? (y/n): "

if /i "%PUSH_CHOICE%"=="y" (
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
        echo ❌ Push failed due to secrets in commit history
        echo.
        echo Solutions:
        echo 1. Allow the secret in GitHub UI:
        echo    https://github.com/doganlap/shahin-landing/security/secret-scanning
        echo.
        echo 2. Or rewrite history to remove secrets:
        echo    git filter-branch --force --index-filter "git rm --cached --ignore-unmatch production-deployment/backend/.env.production" --prune-empty --tag-name-filter cat -- --all
        echo.
    )
) else (
    echo.
    echo Push cancelled.
    echo.
)

pause

