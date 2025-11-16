@echo off
title Shahin GRC - Clean and Push to GitHub
color 0A
echo.
echo ========================================
echo   Shahin GRC - Clean and Push to GitHub
echo ========================================
echo.

:: Remove .env files from git
echo [Step 1/5] Removing .env files from git tracking...
git rm --cached production-deployment/backend/.env.production 2>nul
git rm --cached backend/.env 2>nul
git rm --cached landing-page/.env 2>nul
git rm --cached .env 2>nul
git rm --cached --ignore-unmatch **/.env* 2>nul
echo ✅ Removed .env files
echo.

:: Add .gitignore
echo [Step 2/5] Updating .gitignore...
git add .gitignore
echo ✅ .gitignore updated
echo.

:: Commit changes
echo [Step 3/5] Committing changes...
git commit -m "Remove secrets and update .gitignore for Cloudflare deployment"
if %errorlevel% neq 0 (
    echo ⚠️  No changes to commit or commit failed
) else (
    echo ✅ Changes committed
)
echo.

:: Check for secrets
echo [Step 4/5] Checking for secrets in staged changes...
git diff --cached | findstr /I "OPENAI_API_KEY sk-" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  WARNING: Secrets may be in staged changes!
    echo Please review before pushing!
    pause
) else (
    echo ✅ No obvious secrets found in staged changes
)
echo.

:: Push to GitHub
echo [Step 5/5] Pushing to GitHub...
echo.
set /p PUSH_CONFIRM="Push to GitHub? (y/n): "
if /i "!PUSH_CONFIRM!"=="y" (
    git push origin master
    if %errorlevel% equ 0 (
        echo.
        echo ✅ Successfully pushed to GitHub!
        echo.
        echo Next: Connect to Cloudflare Pages
        echo 1. Go to: https://dash.cloudflare.com
        echo 2. Pages → Create project → Connect to Git
        echo 3. Select: GitHub → Your repository
        echo 4. Configure build settings
        echo.
    ) else (
        echo.
        echo ❌ Push failed!
        echo.
        echo If GitHub still blocks due to secrets in history:
        echo 1. Go to: https://github.com/Dogana-Ai/www.shahin.com/security/secret-scanning
        echo 2. Allow the secret (if it's a test key)
        echo 3. Or remove it from commit history using git filter-branch
        echo.
    )
) else (
    echo.
    echo Push cancelled
    echo.
    echo To push manually:
    echo   git push origin master
    echo.
)

pause

