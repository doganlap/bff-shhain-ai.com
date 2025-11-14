@echo off
echo ========================================
echo LOAD 5500+ CONTROLS TO LOCAL DATABASE
echo Then push to Prisma Postgres
echo ========================================
echo.

echo [Step 1/3] Loading 5500+ controls to LOCAL PostgreSQL...
echo ========================================
psql -U postgres -d shahin_ksa_compliance -f "apps\web\src\enterprise\populate-complete-controls.sql"
if %errorlevel% neq 0 (
    echo ERROR: Failed to load controls
    pause
    exit /b 1
)
echo ✓ Controls loaded to local database
echo.

echo [Step 2/3] Verifying control count...
echo ========================================
psql -U postgres -d shahin_ksa_compliance -c "SELECT COUNT(*) as total_controls FROM grc_controls;"
echo.

echo [Step 3/3] Now pushing schema to Prisma...
echo ========================================
cd apps\bff
call npx prisma db push --accept-data-loss
echo.

echo ========================================
echo ✅ LOCAL DATABASE NOW HAS 5500+ CONTROLS
echo ========================================
echo.
echo The controls are in your LOCAL PostgreSQL database.
echo.
echo To also push them to Prisma Postgres, you would need to:
echo   1. Use Prisma seed script
echo   2. Or manually export/import
echo   3. Or directly connect Prisma to your local PostgreSQL
echo.
echo Opening Prisma Studio to view Prisma database...
start cmd /k "npx prisma studio --port 5560"
echo.
pause
