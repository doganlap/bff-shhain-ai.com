@echo off
title Shahin GRC - Setup GitHub to Cloudflare
color 0B
echo.
echo ========================================
echo   Shahin GRC - GitHub to Cloudflare Setup
echo ========================================
echo.

:: Check Git
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed!
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

echo ✅ Git found
echo.

:: Check GitHub CLI
where gh >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  GitHub CLI not found. Installing...
    winget install --id GitHub.cli
    if %errorlevel% neq 0 (
        echo.
        echo ❌ Failed to install GitHub CLI automatically
        echo.
        echo Please install manually:
        echo   1. Download from: https://cli.github.com/
        echo   2. Or run: winget install --id GitHub.cli
        echo   3. Or run: scoop install gh
        echo.
        pause
        exit /b 1
    )
)

echo ✅ GitHub CLI found
echo.

:: Check if logged in to GitHub
echo [Step 1/5] Checking GitHub authentication...
gh auth status >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Not logged in to GitHub
    echo.
    echo You need to login to GitHub.
    echo This will open your browser for authentication.
    echo.
    pause
    echo.
    echo Logging in to GitHub...
    gh auth login
    if %errorlevel% neq 0 (
        echo ❌ Login failed!
        pause
        exit /b 1
    )
) else (
    echo ✅ Already logged in to GitHub
    gh auth status
)
echo.

:: Check if repository exists
echo [Step 2/5] Checking Git repository...
if not exist ".git" (
    echo ⚠️  Not a Git repository
    echo.
    echo Initializing Git repository...
    git init
    if %errorlevel% neq 0 (
        echo ❌ Failed to initialize Git repository
        pause
        exit /b 1
    )
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository found
)
echo.

:: Check if remote exists
echo [Step 3/5] Checking GitHub remote...
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  No GitHub remote configured
    echo.
    echo You need to create a GitHub repository and connect it.
    echo.
    set /p REPO_NAME="Enter GitHub repository name (e.g., shahin-grc): "
    if "!REPO_NAME!"=="" (
        set REPO_NAME=shahin-grc
    )
    echo.
    echo Creating GitHub repository: %REPO_NAME%
    echo.
    gh repo create %REPO_NAME% --public --source=. --remote=origin --push
    if %errorlevel% neq 0 (
        echo.
        echo ❌ Failed to create repository
        echo.
        echo Please create repository manually:
        echo   1. Go to: https://github.com/new
        echo   2. Create repository: %REPO_NAME%
        echo   3. Then run: git remote add origin https://github.com/YOUR_USERNAME/%REPO_NAME%.git
        echo   4. Then run: git push -u origin main
        echo.
        pause
        exit /b 1
    )
    echo ✅ Repository created and connected
) else (
    echo ✅ GitHub remote configured
    git remote get-url origin
)
echo.

:: Commit and push changes
echo [Step 4/5] Committing and pushing changes...
git add .
git status
echo.
set /p COMMIT_MSG="Enter commit message (or press Enter for default): "
if "!COMMIT_MSG!"=="" (
    set COMMIT_MSG=Deploy to Cloudflare Pages
)
git commit -m "!COMMIT_MSG!"
if %errorlevel% neq 0 (
    echo ⚠️  No changes to commit or commit failed
) else (
    echo ✅ Changes committed
)
echo.
echo Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Push failed. Trying to set upstream...
    git push -u origin main
    if %errorlevel% neq 0 (
        echo ❌ Failed to push to GitHub
        echo.
        echo Please push manually:
        echo   git push -u origin main
        echo.
        pause
        exit /b 1
    )
)
echo ✅ Pushed to GitHub
echo.

:: Connect to Cloudflare Pages
echo [Step 5/5] Connecting to Cloudflare Pages...
echo.
echo ========================================
echo   Cloudflare Pages Setup
echo ========================================
echo.
echo Now you need to connect your GitHub repository to Cloudflare Pages:
echo.
echo 1. Go to: https://dash.cloudflare.com
echo 2. Navigate to: Pages → Create a project
echo 3. Choose: "Connect to Git"
echo 4. Select: GitHub
echo 5. Authorize Cloudflare to access GitHub
echo 6. Select your repository: %REPO_NAME%
echo 7. Configure build settings:
echo    - Build command: cd landing-page && npm install && npm run build
echo    - Output directory: landing-page/dist
echo    - Root directory: /
echo    - Node version: 18
echo 8. Set environment variables:
echo    - VITE_API_URL = https://api.shahin-ai.com/api
echo    - VITE_FRONTEND_URL = https://www.shahin-ai.com
echo 9. Click: "Save and Deploy"
echo.
echo ========================================
echo   Setup Complete! ✅
echo ========================================
echo.
echo Next steps:
echo 1. Connect repository to Cloudflare Pages (see above)
echo 2. Configure build settings
echo 3. Set environment variables
echo 4. Add custom domain: www.shahin-ai.com
echo.
echo Opening Cloudflare Dashboard...
timeout /t 3 /nobreak >nul
start https://dash.cloudflare.com

pause

