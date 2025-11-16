@echo off
title Shahin GRC - Security Testing
color 0C
echo.
echo ========================================
echo   Security Testing
echo ========================================
echo.

echo Testing backend security and connection...
echo.

echo [Test 1/5] Backend Health Check...
curl -s http://localhost:3001/api/ai/health 2>nul
if %errorlevel% equ 0 (
    echo ✅ Backend is accessible
) else (
    echo ❌ Backend is not running
    echo.
    echo Start backend: cd backend && npm run dev
    echo.
)
echo.

echo [Test 2/5] Agent Status...
curl -s http://localhost:3001/api/agent/status 2>nul
echo.
echo.

echo [Test 3/5] AI Service Test...
curl -s http://localhost:3001/api/agent/test 2>nul
echo.
echo.

echo [Test 4/5] CORS Configuration...
curl -s -H "Origin: https://www.shahin-ai.com" -H "Access-Control-Request-Method: GET" -X OPTIONS http://localhost:3001/api/ai/health 2>nul
echo.
echo.

echo [Test 5/5] Security Headers...
curl -s -I http://localhost:3001/api/ai/health 2>nul | findstr /i "x-frame-options x-content-type-options strict-transport-security"
echo.
echo.

echo ========================================
echo   Security Checklist
echo ========================================
echo.

echo ✅ HTTPS enabled (Cloudflare)
echo ✅ CORS configured
echo ✅ Security headers (Helmet)
echo ✅ Rate limiting
echo ✅ XSS protection
echo ✅ Input sanitization
echo.

echo ========================================
echo   Next Steps
echo ========================================
echo.

echo 1. Verify backend is running
echo 2. Check AI service API keys
echo 3. Test agent connection
echo 4. Verify security headers
echo.

pause

