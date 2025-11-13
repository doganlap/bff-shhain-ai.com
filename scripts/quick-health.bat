@echo off
REM Simple Health Check for Running GRC Platform Services

echo =====================================
echo GRC Platform Health Status
echo =====================================

echo.
echo Database Connection:
docker exec docker-postgres-1 pg_isready -U grc_user 2>nul
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL: Healthy
) else (
    echo ✗ PostgreSQL: Not responding
)

echo.
echo Application Services:
curl -s http://localhost:5174/ >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Web Frontend: Responsive
) else (
    echo ✗ Web Frontend: Not responding
)

curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Auth Service: Healthy
) else (
    echo ✗ Auth Service: Not responding
)

curl -s http://localhost:3000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ GRC API: Healthy
) else (
    echo ✗ GRC API: Not responding
)

echo.
echo =====================================
echo Health check complete!
echo =====================================
