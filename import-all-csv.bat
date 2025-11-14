@echo off
echo ========================================
echo IMPORTING ALL 2700+ CSV RECORDS
echo ========================================
echo.

cd apps\bff

echo [1/3] Regenerating Prisma Client...
call npx prisma generate
echo.

echo [2/3] Pushing Schema to Prisma Postgres...
call npx prisma db push --accept-data-loss
echo.

echo [3/3] Importing ALL CSV Data...
echo   - 53 Frameworks
echo   - 2303 Controls
echo   - 262 Framework Mappings
echo   - 108 Sector Controls
echo.
call npx tsx prisma/import-all-csv.ts
echo.

echo ========================================
echo Opening Prisma Studio...
start cmd /k "npx prisma studio --port 5560"
echo.
echo Verify at: http://localhost:5560
echo.
