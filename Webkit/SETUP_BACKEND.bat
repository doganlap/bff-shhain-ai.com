@echo off
title Shahin GRC - Setup Backend Server
color 0A
echo.
echo ========================================
echo   Setup Backend Server
echo ========================================
echo.

cd /d "%~dp0\backend"

echo [Step 1/4] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js installed
echo.

echo [Step 2/4] Installing dependencies...
if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Installation failed!
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependencies already installed
)
echo.

echo [Step 3/4] Checking .env file...
if not exist ".env" (
    echo ⚠️  .env file not found!
    echo.
    echo Creating .env file template...
    (
        echo # Server Configuration
        echo PORT=3001
        echo NODE_ENV=development
        echo FRONTEND_URL=https://www.shahin-ai.com
        echo.
        echo # JWT Secret
        echo JWT_SECRET=your-jwt-secret-key-change-in-production
        echo.
        echo # Admin Secret
        echo ADMIN_SECRET=your-admin-secret-change-in-production
        echo.
        echo # AI Services - Add at least ONE:
        echo.
        echo # Option 1: OpenAI
        echo # OPENAI_API_KEY=sk-your-openai-api-key-here
        echo # OPENAI_MODEL=gpt-4
        echo.
        echo # Option 2: Google Gemini
        echo # GOOGLE_GEMINI_API_KEY=your-gemini-api-key-here
        echo # GOOGLE_GEMINI_MODEL=gemini-pro
        echo.
        echo # Option 3: Azure OpenAI
        echo # AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
        echo # AZURE_OPENAI_KEY=your-azure-openai-key
        echo # AZURE_OPENAI_DEPLOYMENT=gpt-4
        echo # AZURE_OPENAI_MODEL=gpt-4
        echo.
        echo # Option 4: Anthropic Claude
        echo # ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
        echo # ANTHROPIC_MODEL=claude-3-sonnet-20240229
        echo.
        echo # Option 5: Local LLM
        echo # LOCAL_LLM_ENDPOINT=http://localhost:1234/v1
        echo # LOCAL_LLM_MODEL=llama-3.2-3b-instruct
        echo # LOCAL_LLM_TYPE=ollama
    ) > .env
    echo ✅ .env file created
    echo.
    echo ⚠️  IMPORTANT: Add at least one AI service API key to backend\.env
    echo.
    echo Options:
    echo 1. OpenAI: https://platform.openai.com/api-keys
    echo 2. Google Gemini: https://makersuite.google.com/app/apikey
    echo 3. Azure OpenAI: Azure Portal
    echo 4. Anthropic: https://console.anthropic.com
    echo 5. Local LLM: Install Ollama or LM Studio
    echo.
) else (
    echo ✅ .env file exists
)
echo.

echo [Step 4/4] Starting backend server...
echo.
echo ⚠️  Make sure you have added at least one AI service API key to .env
echo.
echo Starting server on http://localhost:3001
echo Press Ctrl+C to stop
echo.

call npm run dev

pause

