@echo off
echo ========================================
echo Setting Up Environment Variables
echo ========================================
echo.

echo Creating backend/.env file...
(
echo LOCAL_LLM_ENDPOINT=http://localhost:1234/v1
echo LOCAL_LLM_MODEL=llama-3.2-3b-instruct
echo LOCAL_LLM_TYPE=ollama
echo PORT=3001
echo FRONTEND_URL=http://localhost:3002
echo NODE_ENV=development
echo.
echo # Database (configure as needed)
echo # DATABASE_URL=postgresql://user:pass@host:port/database
echo.
echo # JWT Secret (change in production)
echo # JWT_SECRET=your-secret-key
echo.
echo # Admin Secret (change in production)
echo # ADMIN_SECRET=your-admin-secret
echo.
echo # Azure OpenAI (optional)
echo # AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
echo # AZURE_OPENAI_KEY=your-api-key
echo.
echo # OpenAI Public API (optional)
echo # OPENAI_API_KEY=sk-...
) > backend\.env

echo ✅ Created backend/.env file
echo.

echo Creating landing-page/.env.local file...
(
echo VITE_API_URL=http://localhost:3001
echo VITE_FRONTEND_URL=http://localhost:3002
) > landing-page\.env.local

echo ✅ Created landing-page/.env.local file
echo.

echo ========================================
echo Environment Setup Complete
echo ========================================
echo.
echo Next steps:
echo 1. Install Ollama: winget install Ollama.Ollama
echo 2. Start Ollama: ollama serve
echo 3. Download model: ollama pull llama3.2:3b
echo 4. Start backend: cd backend && npm start
echo 5. Start frontend: cd landing-page && npm run dev
echo.
pause

