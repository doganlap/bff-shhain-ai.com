@echo off  
echo ========================================  
echo       GRC System DEV MODE Startup        
echo ========================================  
echo.  
echo Starting GRC System in Development Mode...  
echo ?? Authentication: DISABLED  
echo ?? Mock Data: ENABLED  
echo.  
  
echo [1/4] Starting LLM Server...  
cd D:\LLM  
start "LLM Server" cmd /k "node server.js"  
echo LLM Server starting at http://localhost:11434  
timeout /t 3 /nobreak >nul  
  
echo [2/4] Starting Backend in DEV MODE...  
cd /d "%~dp0\apps\services"  
start "Backend Server (DEV)" cmd /k "npm run dev"  
echo Backend API starting at http://localhost:3001  
timeout /t 3 /nobreak >nul  
  
echo [3/4] Starting Frontend Application...  
cd /d "%~dp0\apps\web"  
start "Frontend App" cmd /k "npm run dev"  
echo Frontend starting at http://localhost:5173  
timeout /t 5 /nobreak >nul  
  
echo ========================================  
echo     GRC DEV SYSTEM READY TO USE!         
echo ========================================  
echo.  
echo ?? Frontend:  http://localhost:5173  
echo ?? Backend:   http://localhost:3001  
echo ?? AI/LLM:    http://localhost:11434  
echo ?? Login:     NO LOGIN REQUIRED  
echo.  
echo Opening application in browser...  
timeout /t 2 /nobreak >nul  
start http://localhost:5173  
echo.  
echo Development system is running!  
pause 
