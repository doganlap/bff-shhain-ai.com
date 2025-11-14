@echo off
echo ========================================
echo COMPLETE DATABASE MIGRATION TO PRISMA
echo ========================================
echo.
echo This will migrate ALL data from local PostgreSQL
echo to Prisma Postgres (5500+ controls + all tables)
echo.
pause

cd apps\bff

echo.
echo [1/5] Exporting data from local database...
echo ========================================
psql -U postgres -d shahin_ksa_compliance -f ..\..\export-local-data.sql
if %errorlevel% neq 0 (
    echo ERROR: Export failed
    pause
    exit /b 1
)
echo ✓ Export complete
echo.

echo [2/5] Installing required packages...
echo ========================================
call npm install csv-parser
if %errorlevel% neq 0 (
    echo ERROR: Package installation failed
    pause
    exit /b 1
)
echo ✓ Packages installed
echo.

echo [3/5] Ensuring Prisma schema is pushed...
echo ========================================
call npx prisma db push --accept-data-loss
if %errorlevel% neq 0 (
    echo ERROR: Schema push failed
    pause
    exit /b 1
)
echo ✓ Schema ready
echo.

echo [4/5] Importing data to Prisma Postgres...
echo ========================================
echo This may take several minutes for 5500+ records...
call npx tsx prisma/import-to-prisma.ts
if %errorlevel% neq 0 (
    echo ERROR: Import failed
    pause
    exit /b 1
)
echo ✓ Import complete
echo.

echo [5/5] Opening Prisma Studio to verify...
echo ========================================
echo URL: http://localhost:5560
echo.
start cmd /k "npx prisma studio --port 5560"

echo.
echo ========================================
echo ✅ MIGRATION COMPLETE!
echo ========================================
echo.
echo Your data has been migrated:
echo  • 5500+ GRC Controls
echo  • All frameworks
echo  • All tenants and users
echo  • All organizations
echo  • All other tables
echo.
echo Verify in Prisma Studio: http://localhost:5560
echo.
pause
