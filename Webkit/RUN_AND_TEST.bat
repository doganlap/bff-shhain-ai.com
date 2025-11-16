@echo off
title Shahin GRC - Run and Test
color 0A
echo.
echo ========================================
echo   Shahin GRC - Run and Test
echo ========================================
echo.

:: Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

:: Check if backend dependencies are installed
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo.
)

:: Check if frontend dependencies are installed
if not exist "landing-page\node_modules" (
    echo Installing frontend dependencies...
    cd landing-page
    call npm install
    cd ..
    echo.
)

:: Create .env file if it doesn't exist
if not exist "backend\.env" (
    echo Creating backend/.env file...
    (
        echo LOCAL_LLM_ENDPOINT=http://localhost:1234/v1
        echo LOCAL_LLM_MODEL=llama-3.2-3b-instruct
        echo LOCAL_LLM_TYPE=ollama
        echo PORT=3001
        echo FRONTEND_URL=http://localhost:3002
        echo NODE_ENV=development
    ) > backend\.env
    echo ✅ Created backend/.env
    echo.
)

:: Start backend server
echo [1/3] Starting Backend Server...
start "Shahin GRC Backend" cmd /k "cd backend && npm start"
timeout /t 5 /nobreak >nul

:: Wait for backend to start
echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

:: Test backend health
echo [2/3] Testing Backend Health...
curl -s http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running
) else (
    echo ⚠️ Backend may still be starting...
)

:: Test agent status
echo.
echo [3/3] Testing Agent Connection...
curl -s http://localhost:3001/api/agent/status >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Agent status endpoint responding
) else (
    echo ⚠️ Agent status endpoint not ready yet
)

:: Start frontend server
echo.
echo Starting Frontend Server...
start "Shahin GRC Frontend" cmd /k "cd landing-page && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   Servers Started!
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3002
echo Admin:    http://localhost:3001/admin
echo.
echo Agent Status: http://localhost:3001/api/agent/status
echo Agent Test:   http://localhost:3001/api/agent/test
echo.
echo Press any key to open browser...
pause >nul

:: Open browser
start http://localhost:3002

echo.
echo ========================================
echo   Testing Complete
echo ========================================
echo.
pause

