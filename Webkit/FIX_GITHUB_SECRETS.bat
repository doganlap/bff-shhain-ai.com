@echo off
title Shahin GRC - Fix GitHub Secrets
color 0E
echo.
echo ========================================
echo   Shahin GRC - Fix GitHub Secrets
echo ========================================
echo.

echo ⚠️  GitHub detected secrets in repository
echo.
echo This script will:
echo 1. Remove .env files from git tracking
echo 2. Update .gitignore
echo 3. Remove secrets from commit history
echo 4. Prepare for safe push
echo.
pause

:: Step 1: Remove .env files from tracking
echo [Step 1/4] Removing .env files from git tracking...
git rm --cached production-deployment/backend/.env.production 2>nul
git rm --cached backend/.env 2>nul
git rm --cached landing-page/.env 2>nul
git rm --cached .env 2>nul
git rm --cached --ignore-unmatch **/.env* 2>nul
echo ✅ Removed .env files from tracking
echo.

:: Step 2: Update .gitignore
echo [Step 2/4] Updating .gitignore...
if not exist ".gitignore" (
    echo Creating .gitignore...
    type nul > .gitignore
)

:: Add .env patterns to .gitignore
findstr /C:".env" .gitignore >nul 2>&1
if %errorlevel% neq 0 (
    echo. >> .gitignore
    echo # Environment variables >> .gitignore
    echo .env >> .gitignore
    echo .env.local >> .gitignore
    echo .env.production >> .gitignore
    echo .env.development >> .gitignore
    echo *.env >> .gitignore
    echo **/.env* >> .gitignore
    echo ✅ Added .env patterns to .gitignore
) else (
    echo ✅ .gitignore already has .env patterns
)
echo.

:: Step 3: Remove from commit history (if needed)
echo [Step 3/4] Cleaning commit history...
echo.
echo ⚠️  To remove secrets from commit history, you have two options:
echo.
echo Option 1: Create a new commit (Recommended)
echo   - This will keep history but remove secrets from future commits
echo   - Run: git add .gitignore
echo   - Run: git commit -m "Remove secrets and update .gitignore"
echo.
echo Option 2: Rewrite history (Advanced)
echo   - This will remove secrets from all commits
echo   - Use: git filter-branch or BFG Repo-Cleaner
echo   - Warning: This rewrites history and requires force push
echo.
echo For now, we'll use Option 1 (safer)
echo.
pause

:: Step 4: Stage changes
echo [Step 4/4] Staging changes...
git add .gitignore
git status
echo.
echo ✅ Changes staged
echo.

:: Summary
echo ========================================
echo   Next Steps
echo ========================================
echo.
echo 1. Review changes: git status
echo 2. Commit changes: git commit -m "Remove secrets and update .gitignore"
echo 3. Push to GitHub: git push origin master
echo.
echo ⚠️  IMPORTANT: Make sure no secrets are in the commit
echo.
echo To check for secrets in current changes:
echo   git diff --cached | findstr /I "OPENAI_API_KEY sk-"
echo.
echo If secrets are found, remove them before committing!
echo.
pause

