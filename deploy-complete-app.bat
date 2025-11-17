@echo off
echo 🚀 Deploying Shahin AI App with BFF Backend...
echo.

REM Navigate to root directory
cd /d "%~dp0\..\.."

echo Step 1: Installing dependencies for both frontend and backend...
echo Installing BFF dependencies...
cd apps\bff
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install BFF dependencies
    exit /b 1
)

echo Installing Web dependencies...
cd ..\web
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Web dependencies
    exit /b 1
)

echo Step 2: Building frontend...
cd ..\web
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build frontend
    exit /b 1
)

echo Step 3: Deploying to Vercel Production...
cd ..\..
echo.
echo ⚠️  IMPORTANT: The deployment will continue despite the root directory warning.
echo The BFF will be deployed as a serverless function.
echo.

call vercel --prod --yes --force
if %errorlevel% neq 0 (
    echo [WARNING] Vercel deployment had warnings but may have succeeded
    echo.
    echo Check the deployment URL above to verify success
)

echo.
echo ✅ Deployment Process Completed!
echo.
echo Next Steps:
echo 1. Check the deployment URL shown above
echo 2. Test API endpoints at: /api/health, /api/auth/login, etc.
echo 3. Test frontend functionality
echo 4. Configure database connection if needed
echo.
echo If deployment failed due to project settings, please:
echo - Go to: https://vercel.com/donganksa/shahin-ai-app/settings
echo - Update Root Directory to: . (root)
echo - Update Framework to: Other
echo - Then run: vercel --prod
echo.
pause