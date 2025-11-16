@echo off
echo ========================================
echo Testing Agent Connection
echo ========================================
echo.

echo Checking if backend is running...
curl -s http://localhost:3001/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Backend server is not running!
    echo Please start the backend server first: cd backend && npm start
    pause
    exit /b 1
)

echo ✅ Backend server is running
echo.

echo Testing Agent Status...
curl -s http://localhost:3001/api/agent/status
echo.
echo.

echo Testing Agent Health...
curl -s http://localhost:3001/api/agent/health
echo.
echo.

echo Testing Pre-Deployment Check...
curl -s http://localhost:3001/api/agent/test
echo.
echo.

echo ========================================
echo Test Complete
echo ========================================
pause

