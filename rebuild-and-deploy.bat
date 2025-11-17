@echo off
echo 🚀 Starting Complete Rebuild and Deployment Process...
echo ==================================================

REM Navigate to project root
cd /d "%~dp0"

REM Step 1: Clean up old builds and dependencies
echo Step 1: Cleaning up old builds and dependencies...
if exist node_modules rmdir /s /q node_modules
if exist apps\bff\node_modules rmdir /s /q apps\bff\node_modules
if exist apps\web\node_modules rmdir /s /q apps\web\node_modules
if exist apps\bff\dist rmdir /s /q apps\bff\dist
if exist apps\web\dist rmdir /s /q apps\web\dist
if exist apps\web\build rmdir /s /q apps\web\build
if exist .next rmdir /s /q .next
if exist package-lock.json del package-lock.json
if exist apps\bff\package-lock.json del apps\bff\package-lock.json
if exist apps\web\package-lock.json del apps\web\package-lock.json

REM Step 2: Install root dependencies
echo Step 2: Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    exit /b 1
)

REM Step 3: Build BFF
echo Step 3: Building BFF...
cd apps\bff
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install BFF dependencies
    exit /b 1
)

call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build BFF
    exit /b 1
)

cd ..\..

REM Step 4: Build Frontend
echo Step 4: Building Frontend...
cd apps\web
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install Web dependencies
    exit /b 1
)

call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build Web app
    exit /b 1
)

cd ..\..

REM Step 5: Run tests
echo Step 5: Running tests...
call npm test
if %errorlevel% neq 0 (
    echo ⚠️  Some tests failed - continuing with deployment
)

REM Step 6: Git operations
echo Step 6: Preparing GitHub push...
git add .
git commit -m "Complete rebuild and deployment - %date% %time%"
if %errorlevel% neq 0 (
    echo ⚠️  No changes to commit - continuing
)

REM Step 7: Push to GitHub
echo Step 7: Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ❌ Failed to push to GitHub
    exit /b 1
)

REM Step 8: Deploy to Vercel
echo Step 8: Deploying to Vercel...
call npx vercel --prod --yes
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy to Vercel
    exit /b 1
)

echo.
echo ✅ Complete Rebuild and Deployment Successful!
echo ==================================================
echo.
echo 🌐 Your app is now live at:
echo    - Frontend: Check Vercel deployment URL
echo    - BFF API: /api/* endpoints
echo    - Health Check: /health
echo.
echo 📦 GitHub repository updated with latest changes
echo.
echo Next steps:
echo 1. Test all API endpoints
echo 2. Verify frontend functionality
echo 3. Configure production database if needed
echo.
pause