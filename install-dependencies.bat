@echo off
REM Installation script for production dependencies
REM Run this after resolving npm cache issues

echo ========================================
echo Installing Production Dependencies
echo ========================================
echo.

cd /d "%~dp0apps\bff"

echo Current directory: %CD%
echo.

echo Step 1: Checking package.json...
if not exist package.json (
    echo ERROR: package.json not found!
    pause
    exit /b 1
)
echo ✓ package.json found
echo.

echo Step 2: Cleaning npm cache (optional)...
REM npm cache clean --force
echo ✓ Cache clean skipped (run manually if needed)
echo.

echo Step 3: Removing package-lock.json (if exists)...
if exist package-lock.json del package-lock.json
echo ✓ package-lock.json removed
echo.

echo Step 4: Installing dependencies...
echo This may take a few minutes...
echo.

npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✓ Installation Complete!
    echo ========================================
    echo.
    echo Installed packages:
    echo - openai ^(RAG embeddings^)
    echo - winston ^(structured logging^)
    echo - @sendgrid/mail ^(email notifications^)
    echo - node-cron ^(job scheduling^)
    echo.
    echo Verifying installation...
    if exist node_modules\openai echo ✓ openai installed
    if exist node_modules\winston echo ✓ winston installed
    if exist node_modules\@sendgrid echo ✓ @sendgrid/mail installed
    if exist node_modules\node-cron echo ✓ node-cron installed
    echo.
) else (
    echo.
    echo ========================================
    echo ✗ Installation Failed
    echo ========================================
    echo.
    echo Troubleshooting:
    echo 1. Try: npm cache clean --force
    echo 2. Try: Delete node_modules folder and retry
    echo 3. Check npm version: npm -v
    echo 4. Try: npm install --legacy-peer-deps
    echo.
    pause
    exit /b 1
)

echo Next steps:
echo 1. Start the BFF server: npm start
echo 2. Run database migration: ^(see database-GRC/NEW_SERVICES_MIGRATION.sql^)
echo 3. Configure .env with OPENAI_API_KEY, SENDGRID_API_KEY, REDIS_URL
echo.

pause
