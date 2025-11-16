@echo off
echo ========================================
echo Starting Shahin GRC Application
echo ========================================
echo.

echo [1/2] Starting Backend Server...
start "Shahin GRC Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server...
start "Shahin GRC Frontend" cmd /k "cd landing-page && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo Servers Starting...
echo ========================================
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3002
echo Admin:    http://localhost:3001/admin
echo.
echo Press any key to exit...
pause >nul

