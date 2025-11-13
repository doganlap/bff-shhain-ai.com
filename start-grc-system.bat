@echo off  
echo ========================================  
echo       GRC System Startup Script          
echo ========================================  
echo.  
echo Starting GRC Control Administration System...  
echo.  
  
echo [1/4] Starting LLM Server...  
cd D:\LLM  
start "LLM Server" cmd /k "node server.js"  
echo LLM Server starting at http://localhost:11434  
timeout /t 3 /nobreak >nul  
  
echo [2/4] Starting Backend Services...  
cd /d "%~dp0\apps\services"  
start "Backend Server" cmd /k "npm start"  
echo Backend API starting at http://localhost:3001  
timeout /t 3 /nobreak >nul  
  
echo [3/4] Initializing Database...  
node scripts\init-db.js  
echo Database initialized  
timeout /t 2 /nobreak >nul  
  
echo [4/4] Starting Frontend Application...  
cd /d "%~dp0\apps\web"  
start "Frontend App" cmd /k "npm run dev"  
echo Frontend starting at http://localhost:5173  
timeout /t 3 /nobreak >nul  
  
echo ========================================  
echo     GRC System Started Successfully!      
echo ========================================  
echo.  
echo Access your GRC system at:  
echo   Frontend:  http://localhost:5173  
echo   Backend:   http://localhost:3001  
echo   AI/LLM:    http://localhost:11434  
echo.  
echo Press any key to open the application...  
pause >nul  
start http://localhost:5173  
echo.  
echo System is running. Close this window to stop all services.  
pause 
