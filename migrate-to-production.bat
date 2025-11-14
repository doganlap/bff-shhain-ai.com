@echo off
REM =====================================================
REM Shahin-AI Production Migration Script (Windows)
REM Migrate to Vercel with 4 Database Architecture
REM =====================================================

setlocal enabledelayedexpansion

REM Configuration
set PROJECT_NAME=shahin-ai-grc
set VECTOR_DB_NAME=shahin-vector-db
set COMPLIANCE_DB_NAME=shahin-compliance-db
set MAIN_DB_NAME=shahin-main-db
set CONTROLS_DB_NAME=shahin-controls-db

REM Colors (using color codes)
REM Note: Windows CMD color support is limited

echo ============================================
echo  🚀 Shahin-AI Production Migration
echo ============================================
echo.

REM Check prerequisites
echo Checking prerequisites...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed
    pause
    exit /b 1
)

REM Check/install Vercel CLI
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
)

echo Prerequisites check completed.
echo.

REM Setup Vercel project
echo Setting up Vercel project...

vercel whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo Please login to Vercel first:
    echo Run: vercel login
    echo Then visit the provided URL in your browser
    echo.
    echo Press any key after logging in...
    pause >nul
)

vercel ls | findstr "%PROJECT_NAME%" >nul
if %errorlevel% equ 0 (
    echo ✅ Vercel project exists
) else (
    echo Creating Vercel project...
    vercel --yes
    vercel --name "%PROJECT_NAME%"
)

echo Vercel project setup completed.
echo.

REM Database creation guide
echo ============================================
echo DATABASE CREATION REQUIRED
echo ============================================
echo.
echo Since Vercel CLI doesn't support automated database creation,
echo please create the following databases manually:
echo.
echo 1. Go to: https://vercel.com/dashboard
echo 2. Select your project: %PROJECT_NAME%
echo 3. Go to Storage tab
echo 4. Click 'Create Database' → Select 'Postgres'
echo 5. Create these 4 databases:
echo    • %VECTOR_DB_NAME%
echo    • %COMPLIANCE_DB_NAME%
echo    • %MAIN_DB_NAME%
echo    • %CONTROLS_DB_NAME%
echo.
echo 6. Copy the connection strings for each database
echo.

set /p CREATE_DB="Have you created all 4 databases? (y/n): "
if /i not "!CREATE_DB!"=="y" (
    echo Please create the databases first, then run this script again
    pause
    exit /b 0
)

echo Database creation confirmed.
echo.

REM Setup environment variables
echo Setting up environment variables...
echo.
echo Please provide the database connection strings:
echo.

set /p VECTOR_DB_URL="Vector DB Connection String: "
set /p COMPLIANCE_DB_URL="Compliance DB Connection String: "
set /p MAIN_DB_URL="Main DB Connection String: "
set /p CONTROLS_DB_URL="Controls DB Connection String: "

REM Generate random secrets
for /f "delims=" %%i in ('powershell -command "$bytes = [System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32); [Convert]::ToBase64String($bytes)"') do set JWT_SECRET=%%i
for /f "delims=" %%i in ('powershell -command "$bytes = [System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32); [Convert]::ToBase64String($bytes)"') do set SERVICE_TOKEN=%%i

REM Create .env.production file
(
echo # Database Connections
echo DATABASE_URL=!MAIN_DB_URL!
echo VECTOR_DATABASE_URL=!VECTOR_DB_URL!
echo SHAHIN_COMPLIANCE_URL=!COMPLIANCE_DB_URL!
echo CONTROLS_DATABASE_URL=!CONTROLS_DB_URL!
echo.
echo # Security
echo JWT_SECRET=!JWT_SECRET!
echo BCRYPT_ROUNDS=12
echo SERVICE_TOKEN=!SERVICE_TOKEN!
echo.
echo # AI Services
echo OPENAI_API_KEY=
echo AZURE_OPENAI_KEY=
echo AZURE_COMPUTER_VISION_KEY=
echo.
echo # App Config
echo NODE_ENV=production
echo LOG_LEVEL=info
echo FRONTEND_URL=
) > .env.production

echo Environment variables configured.
echo WARNING: Please edit .env.production to add your API keys
echo.

REM Run Prisma migrations
echo Running Prisma migrations...

REM Vector Database
echo Migrating Vector Database...
cd apps\bff
npx prisma generate --schema=prisma/schema_vector.prisma
npx prisma db push --schema=prisma/schema_vector.prisma --accept-data-loss
if %errorlevel% equ 0 (
    echo ✅ Vector database migrated
) else (
    echo ❌ Vector database migration failed
)

REM Compliance Database
echo Migrating Compliance Database...
npx prisma generate --schema=prisma/schema_shahin_compliance.prisma
npx prisma db push --schema=prisma/schema_shahin_compliance.prisma --accept-data-loss
if %errorlevel% equ 0 (
    echo ✅ Compliance database migrated
) else (
    echo ❌ Compliance database migration failed
)

cd ..\..

echo Prisma migrations completed.
echo.

REM Note about data import
echo ============================================
echo DATA IMPORT NOTE
echo ============================================
echo.
echo For data import, run these commands manually after deployment:
echo.
echo # Import seed data
echo psql "!MAIN_DB_URL!" ^< seed_grc_data.sql
echo.
echo # Import enterprise controls
echo psql "!MAIN_DB_URL!" ^< apps/web/src/enterprise/populate-complete-controls.sql
echo.

REM Deploy to Vercel
echo Deploying to Vercel...
vercel --prod

if %errorlevel% equ 0 (
    echo ✅ Deployment completed
    echo.
    echo Get your production URL:
    vercel ls
) else (
    echo ❌ Deployment failed
)

echo.
echo ============================================
echo 🎊 MIGRATION COMPLETED!
echo ============================================
echo.
echo Next steps:
echo 1. Import data using the commands above
echo 2. Update DNS records if using custom domain
echo 3. Configure monitoring and alerts
echo 4. Set up backup procedures
echo 5. Test all features thoroughly
echo.
echo Welcome to Production! 🚀
echo.

pause
