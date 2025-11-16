@echo off
REM Health Endpoint Tester for Shahin GRC Landing Page

echo.
echo ========================================
echo   Health Endpoint Tester
echo   Shahin GRC Landing Page
echo ========================================
echo.

set URL=%1
if "%URL%"=="" set URL=http://localhost:4000

echo Testing health endpoints on: %URL%
echo.

echo [1] Testing /health endpoint...
curl -s -w "\nStatus Code: %%{http_code}\n" %URL%/health
echo.

echo [2] Testing /healthz endpoint...
curl -s -w "\nStatus Code: %%{http_code}\n" %URL%/healthz
echo.

echo [3] Testing /ready endpoint...
curl -s -w "\nStatus Code: %%{http_code}\n" %URL%/ready
echo.

echo [4] Testing /live endpoint...
curl -s -w "\nStatus Code: %%{http_code}\n" %URL%/live
echo.

echo ========================================
echo   Test Complete
echo ========================================
echo.
echo All endpoints should return Status Code: 200
echo.
echo Usage: test-health.bat [URL]
echo Example: test-health.bat https://shahin-ai.azurewebsites.net
echo.

pause
