@echo off
echo ========================================
echo COMPLETE DATABASE MIGRATION TO PRISMA
echo ========================================
echo.
echo Migrating ALL data from local PostgreSQL
echo to Prisma Postgres (5500+ controls)
echo.

cd apps\bff

echo [1/5] Exporting data from local database...
echo ========================================
psql -U postgres -d shahin_ksa_compliance -f ..\..\export-local-data.sql
if %errorlevel% neq 0 (
    echo ERROR: Export failed - Check if PostgreSQL is running
    exit /b 1
)
echo.

echo [2/5] Installing csv-parser package...
echo ========================================
call npm install csv-parser --silent
echo.

echo [3/5] Pushing Prisma schema...
echo ========================================
call npx prisma db push --accept-data-loss
echo.

echo [4/5] Importing to Prisma (this takes 5-10 minutes)...
echo ========================================
call npx tsx prisma/import-to-prisma.ts
if %errorlevel% neq 0 (
    echo ERROR: Import failed
    exit /b 1
)
echo.

echo [5/5] Opening Prisma Studio...
start cmd /k "npx prisma studio --port 5560"
echo.

echo ========================================
echo ✅ MIGRATION COMPLETE!
echo ========================================
echo.
echo Verify at: http://localhost:5560
echo.
