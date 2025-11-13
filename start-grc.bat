@echo off  
echo === GRC System Startup ===  
echo.  
echo Killing existing processes...  
taskkill /F /IM node.exe 2>nul  
timeout /t 2 /nobreak > nul  
  
echo Starting Backend Server on port 3001...  
start "Backend" cmd /k "echo Backend Server ^&^& node simple-backend.js"  
timeout /t 3 /nobreak > nul  
  
echo Starting Frontend Server on port 5173...  
start "Frontend" cmd /k "echo Frontend Server ^&^& node simple-frontend.js"  
timeout /t 3 /nobreak > nul  
  
echo === Services Started ===  
echo Backend: http://localhost:3001  
echo Frontend: http://localhost:5173  
echo.  
echo Opening browser...  
start http://localhost:5173  
pause 
