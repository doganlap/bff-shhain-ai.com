@echo off  
echo ========================================  
echo        GRC System Health Check            
echo ========================================  
echo.  
  
echo Checking Frontend (http://localhost:5173)...  
curl -s -o nul -w "Status: %%{http_code}" http://localhost:5173 || echo Not Running  
echo.  
  
echo Checking Backend API (http://localhost:3001)...  
curl -s -o nul -w "Status: %%{http_code}" http://localhost:3001/api/health || echo Not Running  
echo.  
  
echo Checking LLM Server (http://localhost:11434)...  
curl -s -o nul -w "Status: %%{http_code}" http://localhost:11434/health || echo Not Running  
echo.  
echo ========================================  
pause 
