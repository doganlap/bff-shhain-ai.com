@echo off
title Shahin GRC - Connect to Cloudflare Pages
color 0A
echo.
echo ========================================
echo   Shahin GRC - Connect to Cloudflare Pages
echo ========================================
echo.

:: Check GitHub CLI
where gh >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  GitHub CLI not found
    echo Please install GitHub CLI first
    pause
    exit /b 1
)

echo ✅ GitHub CLI found
echo.

:: Check if logged in
gh auth status >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Not logged in to GitHub
    echo Logging in...
    gh auth login
    if %errorlevel% neq 0 (
        echo ❌ Login failed
        pause
        exit /b 1
    )
) else (
    echo ✅ Logged in to GitHub
)
echo.

:: Check Cloudflare CLI (Wrangler)
where wrangler >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Wrangler not found. Installing...
    npm install -g wrangler
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Wrangler
        pause
        exit /b 1
    )
)

echo ✅ Wrangler found
echo.

:: Login to Cloudflare
echo [Step 1/5] Logging in to Cloudflare...
echo This will open your browser for authorization.
echo Please accept and authorize the connection.
echo.
wrangler login
if %errorlevel% neq 0 (
    echo ❌ Login failed
    pause
    exit /b 1
)
echo ✅ Logged in to Cloudflare
echo.

:: Get account info
echo [Step 2/5] Getting Cloudflare account information...
wrangler whoami
echo.

:: Build
echo [Step 3/5] Building for production...
cd landing-page
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Build complete!
echo.

:: Create Pages project
echo [Step 4/5] Creating Cloudflare Pages project...
echo.
set /p PROJECT_NAME="Enter project name (e.g., shahin-grc-landing): "
if "%PROJECT_NAME%"=="" (
    set PROJECT_NAME=shahin-grc-landing
)

echo.
echo Creating project: %PROJECT_NAME%
echo.

:: Deploy
echo [Step 5/5] Deploying to Cloudflare Pages...
wrangler pages deploy landing-page/dist --project-name=%PROJECT_NAME%
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Deployment failed or project already exists
    echo.
    echo You can also connect via GitHub:
    echo 1. Go to: https://dash.cloudflare.com
    echo 2. Pages → Create project → Connect to Git
    echo 3. Select: GitHub
    echo 4. Authorize Cloudflare to access GitHub
    echo 5. Select repository: www.shahin.com
    echo 6. Configure build settings
    echo.
) else (
    echo.
    echo ✅ Deployed to Cloudflare Pages!
    echo.
)

echo.
echo ========================================
echo   Next Steps
echo ========================================
echo.
echo 1. Set Environment Variables:
echo    - Go to: Cloudflare Dashboard → Pages → %PROJECT_NAME% → Settings → Environment Variables
echo    - Add:
echo      * VITE_API_URL = https://api.shahin-ai.com/api
echo      * VITE_FRONTEND_URL = https://www.shahin-ai.com
echo.
echo 2. Connect GitHub Repository (for automatic deployments):
echo    - Go to: Cloudflare Dashboard → Pages → %PROJECT_NAME% → Settings → Builds & deployments
echo    - Click: "Connect to Git"
echo    - Select: GitHub
echo    - Authorize and select repository
echo.
echo 3. Add Custom Domain:
echo    - Go to: Cloudflare Dashboard → Pages → %PROJECT_NAME% → Custom domains
echo    - Add: www.shahin-ai.com
echo    - Wait for SSL certificate
echo.
echo 4. Setup Backend Tunnel:
echo    - Run: SETUP_CLOUDFLARE_TUNNEL.bat
echo    - This will connect api.shahin-ai.com to your backend
echo.
echo Opening Cloudflare Dashboard...
timeout /t 2 /nobreak >nul
start https://dash.cloudflare.com

pause

