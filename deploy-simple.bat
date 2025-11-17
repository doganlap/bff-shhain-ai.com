@echo off
echo Starting Vercel Production Deployment for Shahin GRC BFF...
echo.
REM Navigate to BFF directory
cd /d "%~dp0"

echo Step 1: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

echo Step 2: Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build project
    exit /b 1
)

echo Step 3: Running database migrations...
call npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo [WARNING] Database migration failed - will continue with deployment
)

echo Step 4: Deploying to Vercel Production...
call vercel --prod --yes
if %errorlevel% neq 0 (
    echo [ERROR] Vercel deployment failed
    exit /b 1
)

echo.
echo ✅ BFF Deployment Completed Successfully!
echo.
echo Next steps:
echo 1. Check deployment logs: vercel logs
echo 2. Test the deployed API endpoints
echo 3. Run database seeding if needed: npm run seed:production
echo.
pause