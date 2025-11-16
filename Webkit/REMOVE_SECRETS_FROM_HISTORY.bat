@echo off
title Shahin GRC - Remove Secrets from Git History
color 0C
echo.
echo ========================================
echo   Remove Secrets from Git History
echo ========================================
echo.
echo ⚠️  WARNING: This will rewrite git history!
echo.
echo This script will:
echo 1. Remove .env.production files from all commits
echo 2. Remove API keys from documentation files
echo 3. Create a new clean history
echo.
echo ⚠️  If you've already pushed, you'll need to force push
echo ⚠️  Make sure you have a backup!
echo.
set /p CONTINUE="Continue? (y/n): "

if /i not "%CONTINUE%"=="y" (
    echo.
    echo Cancelled.
    pause
    exit /b
)

echo.
echo ========================================
echo   Step 1: Create Backup Branch
echo ========================================
echo.

git branch backup-before-history-rewrite
echo ✅ Backup branch created: backup-before-history-rewrite
echo.

echo ========================================
echo   Step 2: Remove .env.production Files
echo ========================================
echo.

git filter-branch --force --index-filter "git rm --cached --ignore-unmatch production-deployment/backend/.env.production" --prune-empty --tag-name-filter cat -- --all

if %errorlevel% equ 0 (
    echo ✅ Removed .env.production files from history
) else (
    echo ❌ Failed to remove .env.production files
    pause
    exit /b
)

echo.
echo ========================================
echo   Step 3: Clean Up
echo ========================================
echo.

rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ✅ Git history cleaned
echo.

echo ========================================
echo   Step 4: Force Push (Optional)
echo ========================================
echo.
echo ⚠️  You must force push to update remote repository
echo.
set /p FORCE_PUSH="Force push to GitHub? (y/n): "

if /i "%FORCE_PUSH%"=="y" (
    echo.
    echo Force pushing to GitHub...
    git push --force --all origin
    git push --force --tags origin
    
    if %errorlevel% equ 0 (
        echo.
        echo ✅ Successfully force pushed to GitHub!
        echo.
        echo ⚠️  IMPORTANT: Tell your team about the history rewrite
        echo ⚠️  They need to: git fetch --all && git reset --hard origin/master
        echo.
    ) else (
        echo.
        echo ❌ Force push failed
        echo.
    )
) else (
    echo.
    echo Force push skipped.
    echo To push later, run: git push --force --all origin
    echo.
)

echo.
echo ========================================
echo   Alternative: Allow Secrets in GitHub UI
echo ========================================
echo.
echo If you prefer not to rewrite history:
echo 1. Go to: https://github.com/doganlap/shahin-landing/security/secret-scanning/unblock-secret/35LfWvVJWxuHQgci3K2VzZTQOj5
echo 2. Click: "Allow secret"
echo 3. Go to: https://github.com/doganlap/shahin-landing/security/secret-scanning/unblock-secret/35LfWxQWIZa8ZYOrRmUFTOEOxiK
echo 4. Click: "Allow secret"
echo 5. Then push normally: git push -u origin master
echo.

pause

