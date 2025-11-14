@echo off
echo ============================================
echo CLEANING AND MERGING ALL CSV DATA
echo ============================================
echo.

cd D:\Projects\GRC-Master\Assessmant-GRC\apps\bff

echo Step 1: Regenerating Prisma Client...
call npx prisma generate
echo.

echo Step 2: Running Complete Import...
call npx tsx prisma/import-all-csv.ts
echo.

echo Step 3: Verifying Data...
call npx tsx prisma/verify-import.ts
echo.

echo ============================================
echo DONE! Database standardized and merged.
echo ============================================
pause
