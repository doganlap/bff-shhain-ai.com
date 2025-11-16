@echo off
title Shahin GRC - Test Backend Connection
color 0B
echo.
echo ========================================
echo   Test Backend Connection
echo ========================================
echo.

echo Testing backend API connection...
echo.

echo [Test 1/3] Backend Health Check...
curl -s http://localhost:3001/api/ai/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running
    curl -s http://localhost:3001/api/ai/health
    echo.
) else (
    echo ❌ Backend is not running!
    echo.
    echo Start backend server:
    echo   cd backend
    echo   npm run dev
    echo.
    pause
    exit /b 1
)

echo.
echo [Test 2/3] Agent Status...
curl -s http://localhost:3001/api/agent/status
echo.
echo.

echo [Test 3/3] AI Service Test...
curl -s http://localhost:3001/api/agent/test
echo.
echo.

echo ========================================
echo   Test Results
echo ========================================
echo.

echo If all tests pass, backend is ready!
echo.
echo Next steps:
echo 1. Set up Cloudflare Tunnel (if not already done)
echo 2. Verify frontend can connect
echo 3. Test AI agent in frontend
echo.

pause

