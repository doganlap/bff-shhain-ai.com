@echo off
echo ========================================
echo SHAHIN GRC - Database Setup
echo ========================================
echo.

cd apps\bff

echo [1/4] Generating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Prisma generate failed
    pause
    exit /b 1
)
echo ✓ Prisma client generated
echo.

echo [2/4] Pushing schema to database...
call npx prisma db push --accept-data-loss
if %errorlevel% neq 0 (
    echo ERROR: Schema push failed
    pause
    exit /b 1
)
echo ✓ Schema pushed
echo.

echo [3/4] Seeding database...
call npx tsx prisma/seed-fixed.ts
if %errorlevel% neq 0 (
    echo ERROR: Database seeding failed
    pause
    exit /b 1
)
echo ✓ Database seeded
echo.

echo [4/4] Opening Prisma Studio...
echo URL: http://localhost:5560
echo Press Ctrl+C to stop
echo.
start cmd /k "cd /d %CD% && npx prisma studio --port 5560"

echo.
echo ========================================
echo SUCCESS! Database is ready
echo ========================================
echo.
echo You can now:
echo  - View data in Prisma Studio (http://localhost:5560)
echo  - Start backend: npm run dev
echo  - Start frontend: cd to root and npm run dev
echo.
pause
