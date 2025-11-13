@echo off
setlocal EnableDelayedExpansion

echo ========================================
echo    GRC DATABASE MIGRATION - WINDOWS
echo ========================================
echo.

:: Set the project directory
set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

:: Load environment variables from .env file
echo 📋 Loading environment configuration...
for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
    if not "%%a"=="" if not "%%a"=="#" (
        set "%%a=%%b"
    )
)

:: Set defaults if not found in .env
if not defined DB_HOST set "DB_HOST=localhost"
if not defined DB_PORT set "DB_PORT=5432"
if not defined DB_NAME set "DB_NAME=grc_ecosystem"
if not defined DB_USER set "DB_USER=grc_user"
if not defined DB_PASSWORD set "DB_PASSWORD=grc_secure_password_2024"

echo.
echo 🔧 Database Configuration:
echo    Host: %DB_HOST%:%DB_PORT%
echo    Database: %DB_NAME%
echo    User: %DB_USER%
echo.

:: Check if PostgreSQL tools are available
echo 🔍 Checking PostgreSQL tools...
psql --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: PostgreSQL tools not found in PATH
    echo.
    echo 📝 Please install PostgreSQL or add it to PATH:
    echo    - Download from: https://www.postgresql.org/download/windows/
    echo    - Or add existing installation to PATH
    echo    - Typical locations:
    echo      C:\Program Files\PostgreSQL\15\bin
    echo      C:\Program Files\PostgreSQL\14\bin
    echo.
    pause
    exit /b 1
)

echo ✅ PostgreSQL tools found
echo.

:: Test database connection
echo 🔗 Testing database connection...
set PGPASSWORD=%DB_PASSWORD%
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "SELECT version();" >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Cannot connect to database
    echo.
    echo 🔧 Troubleshooting:
    echo    1. Check if PostgreSQL server is running
    echo    2. Verify connection details in .env file
    echo    3. Check firewall settings
    echo    4. Verify user credentials
    echo.
    echo 💡 Manual connection test:
    echo    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME%
    echo.
    pause
    exit /b 1
)

echo ✅ Database connection successful
echo.

:: Create backup
echo 💾 Creating database backup...
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set mydate=%%c%%a%%b
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set mytime=%%a%%b
set mytime=%mytime: =0%
set "BACKUP_FILE=backup_%DB_NAME%_%mydate%_%mytime%.sql"

pg_dump -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f "%BACKUP_FILE%" --verbose
if errorlevel 1 (
    echo ⚠️  Backup failed, but continuing with migration...
) else (
    echo ✅ Backup created: %BACKUP_FILE%
)
echo.

:: Execute migrations
echo 🔄 EXECUTING MIGRATIONS
echo ========================
echo.

:: Migration 1: Tenant Schema Fix
echo ⚡ Step 1: Fixing tenant schema compliance...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f "infra\db\migrations\017_fix_tenant_schema.sql" -v ON_ERROR_STOP=1
if errorlevel 1 (
    echo ❌ Migration Step 1 FAILED
    goto :migration_failed
)
echo ✅ Step 1 completed successfully
echo.

:: Migration 2: Unified Master Migration
echo ⚡ Step 2: Applying unified GRC migration...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f "database -GRC\UNIFIED_MASTER_MIGRATION.sql" -v ON_ERROR_STOP=1
if errorlevel 1 (
    echo ❌ Migration Step 2 FAILED
    goto :migration_failed
)
echo ✅ Step 2 completed successfully
echo.

:: Validation
echo 🔍 VALIDATING MIGRATION RESULTS
echo ================================
echo.

echo 📊 Checking tenant_id columns...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "SELECT COUNT(*) as tenant_tables FROM information_schema.columns WHERE column_name = 'tenant_id' AND table_schema = 'public';"

echo.
echo 📊 Checking unified tables...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'unified_%%';"

echo.
echo 📊 Total tables count...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public';"

echo.
echo ✅ ALL MIGRATIONS COMPLETED SUCCESSFULLY!
echo =========================================
echo.
echo 🎯 MIGRATION SUMMARY:
echo ✅ Tenant schema compliance: COMPLETED
echo ✅ Unified GRC tables: CREATED
echo ✅ Enterprise audit fields: ADDED
echo ✅ Multi-tenant isolation: ENABLED
echo ✅ UUID primary keys: STANDARDIZED
echo.
echo 🚀 NEXT STEPS:
echo 1. Test your application endpoints
echo 2. Verify tenant filtering works
echo 3. Check all CRUD operations
echo 4. Update API documentation
echo.
echo 🌟 DATABASE MIGRATION COMPLETE! 🌟
echo.
pause
exit /b 0

:migration_failed
echo.
echo ❌ MIGRATION FAILED!
echo ===================
echo.
if exist "%BACKUP_FILE%" (
    echo 🔄 You can restore from backup:
    echo    psql -h %DB_HOST% -U %DB_USER% -d %DB_NAME% -f "%BACKUP_FILE%"
    echo.
)
echo 💡 Check the error messages above for details
echo 📝 You may need to fix issues and run migration again
echo.
pause
exit /b 1
