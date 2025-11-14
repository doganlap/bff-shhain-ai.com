@echo off
REM Installation and Setup Script for Microsoft Auth, Stripe, and Zakat.ie Integrations
REM Run this to configure all three integrations

echo ============================================================
echo Shahin GRC Platform - Integrations Setup
echo Microsoft Authentication + Stripe Payments + Zakat.ie
echo ============================================================
echo.

cd /d "%~dp0apps\bff"

REM Step 1: Install Dependencies
echo [1/4] Installing Stripe dependency...
echo.
npm install stripe@^14.10.0

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to install Stripe package
    echo Try manually: cd apps\bff ^&^& npm install stripe
    pause
    exit /b 1
)

echo.
echo ✓ Stripe package installed successfully
echo.

REM Step 2: Database Migration
echo [2/4] Checking database migration...
echo.

if not exist "..\..\database-GRC\INTEGRATIONS_MIGRATION.sql" (
    echo ERROR: Migration file not found!
    pause
    exit /b 1
)

echo Database migration file found.
echo.
echo To execute the migration, run:
echo   cd database-GRC
echo   psql -U grc_user -d grc_ecosystem -f INTEGRATIONS_MIGRATION.sql
echo.
echo Press any key to continue after running the migration...
pause > nul

REM Step 3: Environment Configuration
echo.
echo [3/4] Checking environment configuration...
echo.

if not exist ".env" (
    echo WARNING: .env file not found
    echo Creating from .env.example...
    copy .env.example .env
)

echo.
echo Please configure the following in your .env file:
echo.
echo --- Microsoft Authentication ---
echo MICROSOFT_CLIENT_ID=your-client-id
echo MICROSOFT_CLIENT_SECRET=your-client-secret
echo MICROSOFT_TENANT_ID=common
echo MICROSOFT_REDIRECT_URI=http://localhost:3005/api/auth/microsoft/callback
echo.
echo --- Stripe Payments ---
echo STRIPE_SECRET_KEY=sk_test_xxxxx
echo STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
echo STRIPE_WEBHOOK_SECRET=whsec_xxxxx
echo.
echo --- Zakat.ie Integration ---
echo ZAKAT_API_KEY=your-api-key
echo ZAKAT_API_URL=https://api.zakat.ie/v1
echo ZAKAT_ORGANIZATION_ID=your-org-id
echo ZAKAT_WEBHOOK_SECRET=your-webhook-secret
echo.

echo Opening .env file in notepad...
start notepad .env

echo.
echo Press any key after configuring environment variables...
pause > nul

REM Step 4: Verification
echo.
echo [4/4] Verifying installation...
echo.

echo Checking installed packages...
if exist "node_modules\stripe" (
    echo ✓ Stripe package installed
) else (
    echo ✗ Stripe package NOT found
)

echo.
echo Checking integration files...
if exist "middleware\microsoftAuth.js" echo ✓ Microsoft Auth middleware
if exist "src\services\stripe.service.js" echo ✓ Stripe service
if exist "src\services\zakat.service.js" echo ✓ Zakat.ie service
if exist "routes\auth.js" echo ✓ Auth routes
if exist "routes\payments.js" echo ✓ Payment routes
if exist "routes\zakat.js" echo ✓ Zakat routes

echo.
echo ============================================================
echo Installation Complete!
echo ============================================================
echo.
echo Next Steps:
echo.
echo 1. Microsoft Authentication Setup:
echo    - Go to https://portal.azure.com
echo    - Register app in Azure AD
echo    - Configure redirect URI and permissions
echo    - Add credentials to .env
echo.
echo 2. Stripe Setup:
echo    - Sign up at https://dashboard.stripe.com
echo    - Get API keys from dashboard
echo    - Configure webhook endpoint
echo    - Add credentials to .env
echo.
echo 3. Zakat.ie Setup:
echo    - Contact Zakat.ie for API access
echo    - Get API key and organization ID
echo    - Add credentials to .env
echo.
echo 4. Start the server:
echo    npm start
echo.
echo 5. Test integrations:
echo    - Microsoft: GET http://localhost:3005/api/auth/microsoft
echo    - Stripe: POST http://localhost:3005/api/payments/customers
echo    - Zakat: GET http://localhost:3005/api/zakat/nisab
echo.
echo For detailed documentation, see:
echo    INTEGRATIONS_COMPLETE.md
echo.

pause
