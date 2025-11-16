@echo off
title Shahin GRC - Start Backend Server
color 0A
echo.
echo ========================================
echo   Start Backend Server
echo ========================================
echo.

cd /d "%~dp0\backend"

echo [Step 1/3] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js installed
echo.

echo [Step 2/3] Checking dependencies...
if not exist "node_modules" (
    echo ⚠️  Dependencies not installed
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Installation failed!
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependencies installed
)
echo.

echo [Step 3/3] Starting backend server...
echo.
echo ⚠️  IMPORTANT: Make sure you have:
echo    1. Created backend\.env file
echo    2. Added at least one AI service API key
echo    3. Configured all required environment variables
echo.
echo Starting server on http://localhost:3001
echo Press Ctrl+C to stop
echo.

:: Check if nodemon is available, otherwise use node
if exist "node_modules\nodemon\bin\nodemon.js" (
    call npx nodemon server.js
) else (
    call node server.js
)

pause

