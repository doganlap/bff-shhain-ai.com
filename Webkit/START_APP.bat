@echo off
title Shahin GRC - Start Application
color 0A
echo.
echo ========================================
echo   Shahin GRC - Starting Application
echo   Agent: فهد (Fahd) - Saudi AI Assistant
echo ========================================
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

:: Install backend dependencies if needed
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo.
)

:: Install frontend dependencies if needed
if not exist "landing-page\node_modules" (
    echo Installing frontend dependencies...
    cd landing-page
    call npm install
    cd ..
    echo.
)

:: Check if .env exists
if not exist "backend\.env" (
    echo Creating backend/.env file...
    (
        echo LOCAL_LLM_ENDPOINT=http://localhost:1234/v1
        echo LOCAL_LLM_MODEL=llama-3.2-3b-instruct
        echo LOCAL_LLM_TYPE=ollama
        echo PORT=3001
        echo FRONTEND_URL=http://localhost:3002
        echo NODE_ENV=development
        echo OPENAI_API_KEY=sk-your-openai-api-key-here
        echo OPENAI_MODEL=gpt-4
    ) > backend\.env
    echo ✅ Created backend/.env
    echo.
)

:: Start backend server
echo [1/2] Starting Backend Server (فهد - Fahd)...
start "Shahin GRC Backend - فهد" cmd /k "cd backend && npm start"
timeout /t 5 /nobreak >nul

:: Wait for backend to start
echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

:: Test backend health
echo Testing backend health...
curl -s http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running
) else (
    echo ⚠️ Backend may still be starting...
)

:: Start frontend server
echo.
echo [2/2] Starting Frontend Server...
start "Shahin GRC Frontend" cmd /k "cd landing-page && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   Application Started!
echo ========================================
echo.
echo Agent Name: فهد (Fahd)
echo Dialect: Saudi Arabic
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3002
echo Admin:    http://localhost:3001/admin
echo Config:   http://localhost:3001/ai-config
echo.
echo Agent Status: http://localhost:3001/api/agent/status
echo.
echo Press any key to open browser...
pause >nul

:: Open browser
start http://localhost:3002

echo.
echo ========================================
echo   Application Running!
echo ========================================
echo.
echo Click the AI agent icon (فهد) in the bottom right
echo to start chatting in Saudi Arabic!
echo.
pause

