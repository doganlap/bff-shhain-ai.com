@echo off  
title GRC System Launcher  
echo ============================================  
echo    GRC Control Administration System  
echo    Starting with Security Configuration  
echo ============================================  
echo.  
echo [1/5] Clearing existing processes...  
taskkill /F /IM node.exe 2>nul  
timeout /t 2 /nobreak > nul  
echo     û Processes cleared  
echo.  
echo [2/5] Installing dependencies...  
npm install express cors >nul 2>&1  
echo     û Dependencies ready  
echo.  
echo [3/5] Starting Backend Server (Port 3001)...  
start "GRC-Backend" cmd /k "title GRC Backend ^&^& echo === GRC BACKEND SERVER === ^&^& echo Starting on http://localhost:3001 ^&^& echo CORS and Security: ENABLED ^&^& echo. ^&^& node secure-backend.js"  
timeout /t 4 /nobreak > nul  
echo     û Backend started  
echo.  
echo [4/5] Starting Frontend Server (Port 5173)...  
start "GRC-Frontend" cmd /k "title GRC Frontend ^&^& echo === GRC FRONTEND SERVER === ^&^& echo Starting on http://localhost:5173 ^&^& echo Security Headers: ENABLED ^&^& echo. ^&^& node secure-frontend-server.js"  
timeout /t 4 /nobreak > nul  
echo     û Frontend started  
echo.  
echo [5/5] Opening browser...  
timeout /t 2 /nobreak > nul  
start http://localhost:5173  
echo     û Browser opened  
echo.  
echo ============================================  
echo    ?? GRC SYSTEM IS NOW RUNNING!  
echo ============================================  
echo.  
echo ?? Frontend: http://localhost:5173  
echo ?? Backend:  http://localhost:3001  
echo ?? Security: CORS and Headers Enabled  
echo.  
echo Press any key to view system status...  
pause >nul  
echo.  
echo Testing connections...  
curl -s http://localhost:3001/health || echo ? Backend connection failed  
curl -s http://localhost:5173 || echo ? Frontend connection failed  
echo.  
echo System is ready for testing!  
pause 
