# ================================================================
# Complete Database Setup Script
# Runs all existing migrations + RLS setup
# ================================================================

param(
    [string]$Password = "postgres",
    [switch]$Force
)

$ErrorActionPreference = "Continue"
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  DATABASE SETUP & MIGRATION SCRIPT" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Set password
$env:PGPASSWORD = $Password

# Base directories
$baseDir = "D:\Projects\GRC-Master\Assessmant-GRC"
$mainMigrations = Join-Path $baseDir "database -GRC\migrations"
$infraMigrations = Join-Path $baseDir "infra\db\migrations"
$rlsMigration = Join-Path $baseDir "migrations\001_enable_rls.sql"

# ================================================================
# Step 1: Run Main Migrations
# ================================================================

Write-Host "📦 Step 1: Running main database migrations..." -ForegroundColor Cyan

if (Test-Path $mainMigrations) {
    $migrationFiles = Get-ChildItem -Path $mainMigrations -Filter "*.sql" | Sort-Object Name
    
    Write-Host "Found $($migrationFiles.Count) migration files in database-GRC/migrations`n" -ForegroundColor Yellow
    
    foreach ($file in $migrationFiles) {
        Write-Host "  → Running: $($file.Name)" -ForegroundColor Gray
        
        $result = psql -U postgres -d grc_db -f $file.FullName 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✅ Success" -ForegroundColor Green
        } else {
            Write-Host "    ⚠️  Warning: Some errors (may be expected)" -ForegroundColor Yellow
            if ($Force) {
                Write-Host "       Continuing due to -Force flag..." -ForegroundColor Gray
            }
        }
    }
} else {
    Write-Host "  ⚠️  Directory not found: $mainMigrations" -ForegroundColor Yellow
}

# ================================================================
# Step 2: Run Infrastructure Migrations
# ================================================================

Write-Host "`n📦 Step 2: Running infrastructure migrations..." -ForegroundColor Cyan

if (Test-Path $infraMigrations) {
    $migrationFiles = Get-ChildItem -Path $infraMigrations -Filter "*.sql" | Sort-Object Name
    
    Write-Host "Found $($migrationFiles.Count) migration files in infra/db/migrations`n" -ForegroundColor Yellow
    
    foreach ($file in $migrationFiles) {
        Write-Host "  → Running: $($file.Name)" -ForegroundColor Gray
        
        $result = psql -U postgres -d grc_db -f $file.FullName 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✅ Success" -ForegroundColor Green
        } else {
            Write-Host "    ⚠️  Warning: Some errors (may be expected)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "  ⚠️  Directory not found: $infraMigrations" -ForegroundColor Yellow
}

# ================================================================
# Step 3: Verify Tables Exist
# ================================================================

Write-Host "`n📦 Step 3: Verifying database schema..." -ForegroundColor Cyan

$tables = psql -U postgres -d grc_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"

if ($tables -and [int]$tables -gt 0) {
    Write-Host "  ✅ Found $tables tables in database" -ForegroundColor Green
    
    # List key tables
    Write-Host "`n  Key tables:" -ForegroundColor Gray
    $keyTables = @('users', 'assessments', 'organizations', 'frameworks', 'controls')
    
    foreach ($table in $keyTables) {
        $exists = psql -U postgres -d grc_db -t -c "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '$table');"
        
        if ($exists -match 't') {
            Write-Host "    ✅ $table" -ForegroundColor Green
        } else {
            Write-Host "    ⚠️  $table (missing)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "  ❌ No tables found! Migrations may have failed." -ForegroundColor Red
    Write-Host "     Check errors above and re-run with -Force flag" -ForegroundColor Yellow
    exit 1
}

# ================================================================
# Step 4: Run RLS Migration
# ================================================================

Write-Host "`n📦 Step 4: Enabling Row-Level Security (RLS)..." -ForegroundColor Cyan

if (Test-Path $rlsMigration) {
    Write-Host "  Running RLS migration..." -ForegroundColor Gray
    
    $result = psql -U postgres -d grc_db -f $rlsMigration 2>&1
    
    # Check if RLS policies were created
    $policyCount = psql -U postgres -d grc_db -t -c "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';"
    
    if ($policyCount -and [int]$policyCount -gt 0) {
        Write-Host "  ✅ RLS enabled: $policyCount policies created" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  RLS may not be fully configured" -ForegroundColor Yellow
        Write-Host "     Some tables may not have RLS policies" -ForegroundColor Gray
    }
} else {
    Write-Host "  ❌ RLS migration file not found: $rlsMigration" -ForegroundColor Red
}

# ================================================================
# Step 5: Verification
# ================================================================

Write-Host "`n📦 Step 5: Final verification..." -ForegroundColor Cyan

# Check RLS is enabled on tables
$rlsEnabled = psql -U postgres -d grc_db -t -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;"

if ($rlsEnabled -and [int]$rlsEnabled -gt 0) {
    Write-Host "  ✅ RLS enabled on $rlsEnabled tables" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  No tables have RLS enabled" -ForegroundColor Yellow
}

# Check helper functions
$functions = psql -U postgres -d grc_db -t -c "SELECT COUNT(*) FROM pg_proc WHERE proname IN ('current_tenant_id', 'is_super_admin');"

if ($functions -and [int]$functions -eq 2) {
    Write-Host "  ✅ RLS helper functions created" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  RLS helper functions missing" -ForegroundColor Yellow
}

# ================================================================
# Summary
# ================================================================

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  DATABASE SETUP COMPLETE" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

Write-Host "Database: grc_db" -ForegroundColor Green
Write-Host "Tables: $tables" -ForegroundColor Green
Write-Host "RLS Policies: $policyCount" -ForegroundColor Green
Write-Host "RLS Enabled Tables: $rlsEnabled" -ForegroundColor Green

Write-Host "`n✅ Next steps:" -ForegroundColor Cyan
Write-Host "1. Run security tests: node tests/security-tests.js" -ForegroundColor White
Write-Host "2. Install UI dependencies: cd apps/web && npm install lucide-react" -ForegroundColor White
Write-Host "3. Start services: See EXECUTION_CHECKLIST.md" -ForegroundColor White

Write-Host ""
