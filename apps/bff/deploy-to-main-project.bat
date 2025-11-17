@echo off
echo 🚀 Deploying BFF to shahin-ai-app project on Vercel...
echo.

REM Navigate to BFF directory
cd /d "%~dp0"

echo Step 1: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

echo Step 2: Building the BFF...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build BFF
    exit /b 1
)

echo Step 3: Deploying BFF to Vercel (this will update the existing shahin-ai-app project)...
echo Note: This will change the project from React app to Node.js backend
echo.

call vercel --prod --yes --force
if %errorlevel% neq 0 (
    echo [ERROR] Vercel deployment failed
    echo.
    echo Please manually update the project settings at:
    echo https://vercel.com/donganksa/shahin-ai-app/settings
    echo.
    echo Change the following settings:
    echo - Framework Preset: None (or Node.js)
    echo - Root Directory: apps/bff
    echo - Build Command: npm run build
    echo - Output Directory: .
    exit /b 1
)

echo.
echo ✅ BFF Deployment to shahin-ai-app completed!
echo.
echo Next steps:
echo 1. Test the deployed API endpoints
echo 2. Update frontend to point to the new BFF URL
echo 3. Configure database connection if needed
echo.
pause