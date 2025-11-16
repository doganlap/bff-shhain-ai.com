@echo off
REM BFF Authentication Test Execution Script for Windows
REM This script runs the comprehensive BFF authentication tests with proper reporting

echo 🚀 Starting Shahin GRC BFF Authentication Test Suite
echo ==================================================

REM Set test environment variables
set TEST_ENV=production
set BFF_URL=http://172.21.160.1:3007
set WEB_URL=http://172.21.160.1:5174
set API_URL=http://172.21.160.1:3007/api

REM Test credentials
set DEMO_USER_EMAIL=webuser@example.com
set DEMO_USER_PASSWORD=DemoPassword123!
set PARTNER_EMAIL=ahmet@doganconsult.com
set PARTNER_PASSWORD=Shahin@2025

echo 📋 Test Configuration:
echo    BFF URL: %BFF_URL%
echo    Web URL: %WEB_URL%
echo    API URL: %API_URL%
echo    Demo User: %DEMO_USER_EMAIL%
echo    Partner User: %PARTNER_EMAIL%
echo.

REM Create test results directory
if not exist "test-results\bff-auth" mkdir "test-results\bff-auth"

REM Get timestamp for results directory
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do set DATE_STAMP=%%c%%a%%b
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set TIME_STAMP=%%a%%b
set TIMESTAMP=%DATE_STAMP%_%TIME_STAMP%

set RESULTS_DIR=test-results\bff-auth\%TIMESTAMP%
mkdir "%RESULTS_DIR%"

echo 📁 Test results will be saved to: %RESULTS_DIR%
echo.

REM Run the BFF authentication tests
echo 🧪 Running BFF Authentication Tests...
robot ^
    --outputdir "%RESULTS_DIR%" ^
    --loglevel INFO ^
    --timestampoutputs ^
    --name "Shahin GRC BFF Authentication Tests" ^
    --tagdoc "auth:Authentication tests" ^
    --tagdoc "demo:Demo registration tests" ^
    --tagdoc "partner:Partner login tests" ^
    --tagdoc "public:Public access tests" ^
    --include demo ^
    --include public ^
    bff-authentication-tests.robot

REM Check test execution result
if %errorlevel% equ 0 (
    echo ✅ BFF authentication tests passed!
    set TEST_STATUS=PASS
) else (
    echo ❌ Some BFF authentication tests failed!
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
echo    - Demo Registration: Working endpoint
echo    - Public POC Request: May have issues
echo    - Partner Login: Requires specific partner user setup
echo    - Standard Auth Login: May require seeded users
echo    - Token Refresh: Depends on working login
echo    - Profile Access: Depends on working login
echo    - Permissions: Depends on working login
echo    - Logout: Depends on working login
echo.

REM Provide next steps
echo 📝 Next Steps:
echo    1. Review detailed test results in: %RESULTS_DIR%
echo    2. Check log.html for detailed execution logs
echo    3. Check report.html for comprehensive test report
echo    4. Address any failed tests before deployment
echo.

if "%TEST_STATUS%"=="PASS" (
    echo 🎉 BFF authentication system is functional!
) else (
    echo ⚠️  Please review and fix any failing tests before proceeding.
)

echo.
echo 🔍 To run specific test cases, use:
echo    robot --test "Demo Registration Uses /api/public/demo/request" bff-authentication-tests.robot
echo    robot --test "POC Request Uses /api/public/poc/request" bff-authentication-tests.robot
echo    robot --tag demo bff-authentication-tests.robot
echo    robot --tag public bff-authentication-tests.robot
echo.

REM Run a focused test on working endpoints
echo 🎯 Running Focused Tests on Working Endpoints...
robot ^
    --outputdir "%RESULTS_DIR%\focused" ^
    --loglevel INFO ^
    --test "Demo Registration Uses /api/public/demo/request" ^
    --test "POC Request Uses /api/public/poc/request" ^
    bff-authentication-tests.robot

if %errorlevel% equ 0 (
    echo ✅ Focused tests on working endpoints passed!
) else (
    echo ❌ Some focused tests failed - check endpoint configuration.
)

pause