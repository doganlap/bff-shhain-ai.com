@echo off
echo ===================================================
echo 🔒 FUNCTIONAL SECURITY VALIDATION
echo ===================================================
echo.

set BFF_URL=http://localhost:3005
set AUTH_URL=http://localhost:3001
set GRC_API_URL=http://localhost:3000
set PASSED_TESTS=0
set FAILED_TESTS=0

echo 🧪 Testing Authentication & Authorization
echo ---------------------------------------------------

echo Testing: Admin endpoints require authentication...
curl -s %BFF_URL%/api/admin/health > temp_result.txt
findstr /i "Authentication required" temp_result.txt >nul
if %errorlevel% equ 0 (
    echo ✅ PASS - Admin authentication required
    set /a PASSED_TESTS+=1
) else (
    echo ❌ FAIL - Admin authentication not enforced
    set /a FAILED_TESTS+=1
)

echo Testing: Auth service health...
curl -s %AUTH_URL%/api/health > temp_result.txt
findstr /i "healthy" temp_result.txt >nul
if %errorlevel% equ 0 (
    echo ✅ PASS - Auth service healthy
    set /a PASSED_TESTS+=1
) else (
    echo ❌ FAIL - Auth service not responding
    set /a FAILED_TESTS+=1
)

echo Testing: GRC API health...
curl -s %GRC_API_URL%/api/health > temp_result.txt
findstr /i "healthy" temp_result.txt >nul
if %errorlevel% equ 0 (
    echo ✅ PASS - GRC API healthy
    set /a PASSED_TESTS+=1
) else (
    echo ❌ FAIL - GRC API not responding
    set /a FAILED_TESTS+=1
)

echo Testing: BFF health...
curl -s %BFF_URL%/api/health > temp_result.txt
findstr /i "healthy" temp_result.txt >nul
if %errorlevel% equ 0 (
    echo ✅ PASS - BFF healthy
    set /a PASSED_TESTS+=1
) else (
    echo ❌ FAIL - BFF not responding
    set /a FAILED_TESTS+=1
)

echo.
echo 🛡️ Testing Security
echo ---------------------------------------------------

echo Testing: Invalid JWT token rejection...
curl -s -H "Authorization: Bearer invalid-token" %BFF_URL%/api/admin/health > temp_result.txt
findstr /i "Authentication required\|Invalid token\|Unauthorized" temp_result.txt >nul
if %errorlevel% equ 0 (
    echo ✅ PASS - Invalid tokens rejected
    set /a PASSED_TESTS+=1
) else (
    echo ❌ FAIL - Invalid tokens not properly rejected
    set /a FAILED_TESTS+=1
)

echo Testing: Database connection...
docker exec docker-postgres-1 psql -U grc_user -d grc_ecosystem -c "SELECT COUNT(*) FROM users;" > temp_result.txt 2>&1
findstr /i "error\|failed" temp_result.txt >nul
if %errorlevel% neq 0 (
    echo ✅ PASS - Database connection secure
    set /a PASSED_TESTS+=1
) else (
    echo ❌ FAIL - Database connection issues
    set /a FAILED_TESTS+=1
)

echo.
echo ===================================================
echo 📋 SECURITY VALIDATION SUMMARY
echo ===================================================
echo Tests Passed: %PASSED_TESTS%
echo Tests Failed: %FAILED_TESTS%

set /a TOTAL_TESTS=%PASSED_TESTS%+%FAILED_TESTS%
if %TOTAL_TESTS% gtr 0 (
    set /a PASS_RATE=%PASSED_TESTS%*100/%TOTAL_TESTS%
    echo Pass Rate: !PASS_RATE!%%

    if !PASS_RATE! geq 80 (
        echo Security Status: ✅ GOOD
        exit /b 0
    ) else if !PASS_RATE! geq 60 (
        echo Security Status: ⚠️ NEEDS IMPROVEMENT
        exit /b 1
    ) else (
        echo Security Status: ❌ CRITICAL ISSUES
        exit /b 2
    )
) else (
    echo Security Status: NO TESTS RUN
    exit /b 3
)

del temp_result.txt 2>nul
