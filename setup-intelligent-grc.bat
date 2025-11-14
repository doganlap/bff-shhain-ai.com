@echo off
echo ========================================
echo INTELLIGENT GRC SYSTEM - SETUP
echo ========================================
echo.

cd apps\bff

echo [1/3] Regenerating Prisma Client...
echo ========================================
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Prisma generate failed
    pause
    exit /b 1
)
echo ✓ Prisma client generated
echo.

echo [2/3] Pushing Enhanced Schema to Database...
echo ========================================
call npx prisma db push --accept-data-loss
if %errorlevel% neq 0 (
    echo ERROR: Schema push failed
    pause
    exit /b 1
)
echo ✓ Schema pushed successfully
echo.

echo [3/3] Verifying System...
echo ========================================
call npx tsx src/services/verify-system.ts
echo.

echo ========================================
echo ✅ SETUP COMPLETE!
echo ========================================
echo.
echo Your Intelligent GRC System is ready to use.
echo.
echo Next Steps:
echo  1. Run demo examples: npx tsx src/services/grc-system-demo.ts
echo  2. Import your CSV data
echo  3. Start building the frontend
echo.
echo Documentation:
echo  - INTELLIGENT_GRC_SYSTEM.md - Full system guide
echo  - IMPLEMENTATION_COMPLETE.md - Implementation summary
echo.
pause
