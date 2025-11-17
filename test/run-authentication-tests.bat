@echo off
REM Authentication Full Path Test Execution Script for Windows
REM This script runs the comprehensive Robot Framework authentication tests

echo 🚀 Starting Shahin GRC Authentication Full Path Test Suite
echo ==================================================

REM Set test environment variables
set TEST_ENV=production
set BFF_URL=http://172.21.160.1:3007
set WEB_URL=http://172.21.160.1:5174
set API_URL=http://172.21.160.1:3007/api

REM Test credentials (using the partner users we created)
set TEST_USER_EMAIL=ahmet@doganconsult.com
set TEST_USER_PASSWORD=Shahin@2025
set TEST_PARTNER_EMAIL=amr@doganconsult.com
set TEST_PARTNER_PASSWORD=Shahin@2025
set TEST_TENANT_ID=75688778-0cf1-4a5c-9536-9acd2e5c9a0e

echo 📋 Test Configuration:
echo    BFF URL: %BFF_URL%
echo    Web URL: %WEB_URL%
echo    API URL: %API_URL%
echo    Test User: %TEST_USER_EMAIL%
echo    Test Partner: %TEST_PARTNER_EMAIL%
echo    Tenant ID: %TEST_TENANT_ID%
echo.

REM Create test results directory
if not exist "test-results\authentication" mkdir "test-results\authentication"

REM Get timestamp for results directory
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do set DATE_STAMP=%%c%%a%%b
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set TIME_STAMP=%%a%%b
set TIMESTAMP=%DATE_STAMP%_%TIME_STAMP%

set RESULTS_DIR=test-results\authentication\%TIMESTAMP%
mkdir "%RESULTS_DIR%"

echo 📁 Test results will be saved to: %RESULTS_DIR%
echo.

REM Run the authentication tests
echo 🧪 Running Authentication Full Path Tests...
robot ^
    --outputdir "%RESULTS_DIR%" ^
    --loglevel INFO ^
    --timestampoutputs ^
    --name "Shahin GRC Authentication Tests" ^
    --tagdoc "health:Health check tests" ^
    --tagdoc "login:Login flow tests" ^
    --tagdoc "registration:Registration flow tests" ^
    --tagdoc "authentication:General authentication tests" ^
    --tagdoc "partner:Partner-specific tests" ^
    --tagdoc "demo:Demo user tests" ^
    --tagdoc "security:Security-related tests" ^
    --tagdoc "error-handling:Error handling tests" ^
    --tagdoc "authorization:Authorization tests" ^
    --tagdoc "multi-tenant:Multi-tenant tests" ^
    --tagdoc "journey:End-to-end journey tests" ^
    --tagdoc "critical:Critical path tests" ^
    --include critical ^
    --criticaltag critical ^
    --noncriticaltag non-critical ^
    authentication-full-path-tests.robot

REM Check test execution result
if %errorlevel% equ 0 (
    echo ✅ All authentication tests passed!
    set TEST_STATUS=PASS
) else (
    echo ❌ Some authentication tests failed!
    set TEST_STATUS=FAIL
)

REM Generate summary report
echo.
echo 📊 Test Execution Summary
echo ========================
echo Test Status: %TEST_STATUS%
echo Results Directory: %RESULTS_DIR%
echo Timestamp: %TIMESTAMP%
echo.

echo 🔑 Key Test Results:
echo    - Health Check: Service availability
echo    - Standard User Login: %TEST_USER_EMAIL%
echo    - Partner User Login: %TEST_PARTNER_EMAIL%
echo    - Demo User Login: demo@shahin.grc
echo    - User Registration: New user creation
echo    - Partner Registration: Partner organization creation
echo    - Profile Access: Authenticated profile retrieval
echo    - Token Refresh: JWT token refresh mechanism
echo    - Error Handling: Invalid credentials, missing data
echo    - Security: Rate limiting, CORS, unauthorized access
echo    - Multi-tenant: Tenant isolation and data separation
echo    - Complete Journey: Registration → Login → Profile → Logout
echo.

REM Provide next steps
echo 📝 Next Steps:
echo    1. Review detailed test results in: %RESULTS_DIR%
echo    2. Check log.html for detailed execution logs
echo    3. Check report.html for comprehensive test report
echo    4. Address any failed tests before deployment
echo.

if "%TEST_STATUS%"=="PASS" (
    echo 🎉 Authentication system is fully functional and ready for production!
) else (
    echo ⚠️  Please review and fix any failing tests before proceeding.
)

echo.
echo 🔍 To run specific test cases, use:
echo    robot --test "TC001_Health_Check_All_Services" authentication-full-path-tests.robot
echo    robot --tag login authentication-full-path-tests.robot
echo    robot --tag partner authentication-full-path-tests.robot
echo.

pause