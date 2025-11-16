@echo off
title Shahin GRC - Push to GitHub
color 0A
echo.
echo ========================================
echo   Shahin GRC - Push to GitHub
echo ========================================
echo.

:: Check git status
echo Checking git status...
git status --short
echo.

:: Add all changes
echo Adding all changes...
git add .
echo ✅ Changes staged
echo.

:: Commit
echo Committing changes...
git commit -m "Configure GitHub to Cloudflare deployment - Remove secrets and update configuration"
if %errorlevel% neq 0 (
    echo ⚠️  Commit failed or no changes to commit
) else (
    echo ✅ Changes committed
)
echo.

:: Push
echo Pushing to GitHub...
echo.
echo ⚠️  NOTE: If GitHub blocks due to secrets in history:
echo   1. Go to: https://github.com/Dogana-Ai/www.shahin.com/security/secret-scanning
echo   2. Click "Allow secret" if it's a test key
echo   3. Or use git filter-branch to remove from history
echo.
set /p PUSH="Push to GitHub? (y/n): "
if /i "%PUSH%"=="y" (
    git push origin master
    if %errorlevel% equ 0 (
        echo.
        echo ✅ Successfully pushed to GitHub!
        echo.
        echo Next: Connect to Cloudflare Pages
        echo 1. Go to: https://dash.cloudflare.com
        echo 2. Pages → Create project → Connect to Git
        echo 3. Select: GitHub → www.shahin.com
        echo 4. Configure build settings
        echo.
    ) else (
        echo.
        echo ❌ Push failed!
        echo.
        echo If blocked by GitHub secrets protection:
        echo Option 1: Allow the secret in GitHub
        echo   - Go to the URL shown in error message
        echo   - Click "Allow secret" (if it's a test key)
        echo.
        echo Option 2: Remove secret from history
        echo   - Use: git filter-branch or BFG Repo-Cleaner
        echo   - Warning: This rewrites history
        echo.
    )
) else (
    echo Push cancelled
)

pause

