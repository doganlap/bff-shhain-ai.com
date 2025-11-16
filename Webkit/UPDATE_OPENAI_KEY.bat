@echo off
echo ========================================
echo Updating OpenAI API Key
echo ========================================
echo.

set OPENAI_KEY=sk-your-openai-api-key-here

echo Adding OpenAI API Key to backend/.env...
echo.

cd backend

:: Check if .env exists, if not create it
if not exist .env (
    echo Creating .env file...
    (
        echo LOCAL_LLM_ENDPOINT=http://localhost:1234/v1
        echo LOCAL_LLM_MODEL=llama-3.2-3b-instruct
        echo LOCAL_LLM_TYPE=ollama
        echo PORT=3001
        echo FRONTEND_URL=http://localhost:3002
        echo NODE_ENV=development
    ) > .env
)

:: Update or add OPENAI_API_KEY
findstr /C:"OPENAI_API_KEY" .env >nul
if %errorlevel% equ 0 (
    echo Updating existing OPENAI_API_KEY...
    powershell -Command "(Get-Content .env) -replace 'OPENAI_API_KEY=.*', 'OPENAI_API_KEY=%OPENAI_KEY%' | Set-Content .env"
) else (
    echo Adding OPENAI_API_KEY...
    echo OPENAI_API_KEY=%OPENAI_KEY% >> .env
)

:: Update or add OPENAI_MODEL
findstr /C:"OPENAI_MODEL" .env >nul
if %errorlevel% equ 0 (
    powershell -Command "(Get-Content .env) -replace 'OPENAI_MODEL=.*', 'OPENAI_MODEL=gpt-4' | Set-Content .env"
) else (
    echo OPENAI_MODEL=gpt-4 >> .env
)

echo.
echo ✅ OpenAI API Key updated successfully!
echo.
echo Current configuration:
findstr /C:"OPENAI" .env
echo.
echo ⚠️  IMPORTANT: Restart the backend server for changes to take effect!
echo.
pause

