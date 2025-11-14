# Apply Test Tables Schema to Database
# Run this script to add missing tables needed for tests

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "GRC TEST TABLES - SCHEMA APPLICATION" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

# Set environment
$env:DB_PASSWORD = "postgres"
$env:PGPASSWORD = "postgres"

# Configuration
$dbHost = "localhost"
$dbPort = "5432"
$dbUser = "postgres"
$dbName = "shahin_ksa_compliance"
$schemaFile = "database\test_tables_schema.sql"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Host: $dbHost"
Write-Host "  Port: $dbPort"
Write-Host "  Database: $dbName"
Write-Host "  User: $dbUser"
Write-Host "  Schema File: $schemaFile"
Write-Host ""

# Check if schema file exists
if (-not (Test-Path $schemaFile)) {
    Write-Host "ERROR: Schema file not found: $schemaFile" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "Step 1: Testing database connection..." -ForegroundColor Yellow
$testQuery = "SELECT version();"
try {
    $result = psql -U $dbUser -h $dbHost -p $dbPort -d $dbName -t -c $testQuery 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  SUCCESS: Connected to database" -ForegroundColor Green
        Write-Host "  PostgreSQL: $($result.Trim().Substring(0, 50))..." -ForegroundColor Gray
    } else {
        throw "Connection failed"
    }
} catch {
    Write-Host "  FAILED: Cannot connect to database" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Is PostgreSQL running? Check: Get-Service postgresql*"
    Write-Host "  2. Is password correct? Try: psql -U postgres"
    Write-Host "  3. Does database exist? Check: psql -U postgres -l"
    exit 1
}

Write-Host "`nStep 2: Applying schema (creating tables)..." -ForegroundColor Yellow
try {
    $output = psql -U $dbUser -h $dbHost -p $dbPort -d $dbName -f $schemaFile 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  SUCCESS: Schema applied" -ForegroundColor Green
        Write-Host "  Output:" -ForegroundColor Gray
        $output | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
    } else {
        throw "Schema application failed"
    }
} catch {
    Write-Host "  FAILED: Error applying schema" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 3: Verifying tables..." -ForegroundColor Yellow
$verifyQuery = @"
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tenants', 'grc_frameworks', 'grc_controls', 'workflows', 'assessment_workflow')
ORDER BY table_name;
"@

try {
    $tables = psql -U $dbUser -h $dbHost -p $dbPort -d $dbName -t -c $verifyQuery 2>&1
    $tableList = $tables -split "`n" | Where-Object { $_.Trim() -ne "" }
    
    Write-Host "  Tables created:" -ForegroundColor Green
    foreach ($table in $tableList) {
        Write-Host "    OK $($table.Trim())" -ForegroundColor Green
    }
    
    if ($tableList.Count -ge 5) {
        Write-Host "`n  SUCCESS: All required tables created!" -ForegroundColor Green
    } else {
        Write-Host "`n  WARNING: Some tables may be missing" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  WARNING: Could not verify tables" -ForegroundColor Yellow
}

Write-Host "`nStep 4: Checking sample data..." -ForegroundColor Yellow
$countQuery = @"
SELECT 
    (SELECT COUNT(*) FROM grc_frameworks) as frameworks,
    (SELECT COUNT(*) FROM grc_controls) as controls,
    (SELECT COUNT(*) FROM sector_controls) as sector_mappings;
"@

try {
    $counts = psql -U $dbUser -h $dbHost -p $dbPort -d $dbName -t -c $countQuery 2>&1
    Write-Host "  Sample data inserted:" -ForegroundColor Green
    Write-Host "    $counts" -ForegroundColor Gray
} catch {
    Write-Host "  WARNING: Could not check sample data" -ForegroundColor Yellow
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "SCHEMA APPLICATION COMPLETE!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "  1. Set environment: `$env:DB_PASSWORD=`"postgres`""
Write-Host "  2. Run tests: npm run test:features"
Write-Host "  3. Or run individual tests:"
Write-Host "     npm run test:auto-assessment"
Write-Host "     npm run test:workflow"

Write-Host "`nVerify everything is ready:" -ForegroundColor Yellow
Write-Host "  node tests/simple_diagnostic.js"
Write-Host ""
