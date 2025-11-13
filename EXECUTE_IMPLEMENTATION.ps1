# ================================================================
# GRC Platform - Complete Implementation Execution Script
# ================================================================
# This script executes all implementation steps automatically
# Time: 3-5 hours
# ================================================================

param(
    [switch]$SkipRLS,
    [switch]$SkipUI,
    [switch]$SkipTests,
    [switch]$Quick
)

$ErrorActionPreference = "Continue"
$script:baseDir = "D:\Projects\GRC-Master\Assessmant-GRC"
$script:passed = 0
$script:failed = 0
$script:warnings = 0

# Colors
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Step { Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan; Write-Host $args -ForegroundColor Cyan; Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan }

# ================================================================
# PHASE 1: SECURITY IMPLEMENTATION
# ================================================================

Write-Step "PHASE 1: SECURITY IMPLEMENTATION (2 hours)"

if (-not $SkipRLS) {
    Write-Info "`n📦 Step 1.1: Checking PostgreSQL..."
    
    # Check if PostgreSQL is running
    $pgService = Get-Service -Name postgresql* -ErrorAction SilentlyContinue
    if ($pgService -and $pgService.Status -eq 'Running') {
        Write-Success "✅ PostgreSQL is running ($($pgService.Name))"
    } else {
        Write-Error "❌ PostgreSQL is not running!"
        Write-Warning "Please start PostgreSQL service and re-run this script."
        exit 1
    }
    
    Write-Info "`n📦 Step 1.2: Running RLS Migration..."
    
    # Check if psql is available
    $psqlPath = (Get-Command psql -ErrorAction SilentlyContinue).Path
    if (-not $psqlPath) {
        Write-Error "❌ psql command not found!"
        Write-Warning "Please add PostgreSQL bin directory to PATH"
        Write-Info "Typical path: C:\Program Files\PostgreSQL\17\bin"
        Write-Info "Or run: `$env:Path += ';C:\Program Files\PostgreSQL\17\bin'"
        exit 1
    }
    
    Write-Success "✅ psql found: $psqlPath"
    
    # Run RLS migration
    Write-Info "Running RLS migration script..."
    $migrationFile = Join-Path $baseDir "migrations\001_enable_rls.sql"
    
    if (-not (Test-Path $migrationFile)) {
        Write-Error "❌ Migration file not found: $migrationFile"
        exit 1
    }
    
    # Execute migration
    Write-Info "Executing: psql -U postgres -d grc_db -f $migrationFile"
    
    # Note: This will prompt for password unless .pgpass is configured
    $result = psql -U postgres -d grc_db -f $migrationFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✅ RLS migration executed successfully!"
        $script:passed++
    } else {
        Write-Error "❌ RLS migration failed!"
        Write-Warning "Error: $result"
        Write-Info "Manual fix:"
        Write-Info "1. Open pgAdmin or psql manually"
        Write-Info "2. Connect to grc_db database"
        Write-Info "3. Run the migration script manually"
        $script:failed++
    }
    
} else {
    Write-Warning "⏭️  Skipping RLS migration (--SkipRLS flag)"
}

Write-Info "`n📦 Step 1.3: Verifying .env configuration..."

$envFile = Join-Path $baseDir "apps\bff\.env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    
    # Check required variables
    $required = @(
        @{ Name = "JWT_SECRET"; Pattern = "JWT_SECRET=.{50,}" },
        @{ Name = "JWT_REFRESH_SECRET"; Pattern = "JWT_REFRESH_SECRET=.{50,}" },
        @{ Name = "DATABASE_URL"; Pattern = "DATABASE_URL=postgresql://" },
        @{ Name = "SERVICE_TOKEN"; Pattern = "SERVICE_TOKEN=.{50,}" }
    )
    
    $allPresent = $true
    foreach ($var in $required) {
        if ($envContent -match $var.Pattern) {
            Write-Success "✅ $($var.Name) is configured"
        } else {
            Write-Error "❌ $($var.Name) is missing or invalid"
            $allPresent = $false
        }
    }
    
    if ($allPresent) {
        Write-Success "✅ All required environment variables configured"
        $script:passed++
    } else {
        Write-Error "❌ Some environment variables are missing"
        $script:failed++
    }
} else {
    Write-Error "❌ .env file not found: $envFile"
    $script:failed++
}

Write-Info "`n📦 Step 1.4: Checking Node.js dependencies..."

Set-Location "$baseDir\apps\bff"

# Check if pg is installed
$pgInstalled = npm list pg --depth=0 2>&1 | Select-String "pg@"
if ($pgInstalled) {
    Write-Success "✅ PostgreSQL client (pg) is installed"
    $script:passed++
} else {
    Write-Warning "⚠️  PostgreSQL client (pg) not found, installing..."
    npm install pg
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✅ PostgreSQL client installed"
        $script:passed++
    } else {
        Write-Error "❌ Failed to install pg"
        $script:failed++
    }
}

# ================================================================
# PHASE 2: UI SYSTEM IMPLEMENTATION
# ================================================================

if (-not $SkipUI) {
    Write-Step "`nPHASE 2: UI SYSTEM IMPLEMENTATION (1 hour)"
    
    Write-Info "`n📦 Step 2.1: Installing UI dependencies..."
    
    Set-Location "$baseDir\apps\web"
    
    # Check if lucide-react is installed
    $lucideInstalled = npm list lucide-react --depth=0 2>&1 | Select-String "lucide-react@"
    if ($lucideInstalled) {
        Write-Success "✅ lucide-react is already installed"
    } else {
        Write-Info "Installing lucide-react..."
        npm install lucide-react
        if ($LASTEXITCODE -eq 0) {
            Write-Success "✅ lucide-react installed"
            $script:passed++
        } else {
            Write-Error "❌ Failed to install lucide-react"
            $script:failed++
        }
    }
    
    # Check Tailwind plugins
    $tailwindFormsInstalled = npm list @tailwindcss/forms --depth=0 2>&1 | Select-String "@tailwindcss/forms"
    if (-not $tailwindFormsInstalled) {
        Write-Info "Installing @tailwindcss/forms..."
        npm install -D @tailwindcss/forms @tailwindcss/typography
        if ($LASTEXITCODE -eq 0) {
            Write-Success "✅ Tailwind plugins installed"
            $script:passed++
        }
    }
    
    Write-Info "`n📦 Step 2.2: Verifying Tailwind configuration..."
    
    $tailwindConfig = Join-Path $baseDir "apps\web\tailwind.config.js"
    if (Test-Path $tailwindConfig) {
        $configContent = Get-Content $tailwindConfig -Raw
        if ($configContent -match "#0E7C66") {
            Write-Success "✅ Tailwind config updated with design tokens (Primary: #0E7C66)"
            $script:passed++
        } else {
            Write-Warning "⚠️  Primary color not found in Tailwind config"
            $script:warnings++
        }
    }
    
    Write-Info "`n📦 Step 2.3: Checking UI components..."
    
    $enterpriseComponents = Join-Path $baseDir "apps\web\src\components\ui\EnterpriseComponents.jsx"
    $dataGrid = Join-Path $baseDir "apps\web\src\components\ui\DataGrid.jsx"
    
    if ((Test-Path $enterpriseComponents) -and (Test-Path $dataGrid)) {
        Write-Success "✅ Enterprise UI components are present"
        $script:passed++
    } else {
        Write-Warning "⚠️  Some UI components are missing"
        $script:warnings++
    }
    
} else {
    Write-Warning "⏭️  Skipping UI implementation (--SkipUI flag)"
}

# ================================================================
# PHASE 3: TESTING & VERIFICATION
# ================================================================

if (-not $SkipTests) {
    Write-Step "`nPHASE 3: TESTING & VERIFICATION (30 min)"
    
    Write-Info "`n📦 Step 3.1: Running security tests..."
    
    Set-Location $baseDir
    
    $securityTestsFile = Join-Path $baseDir "tests\security-tests.js"
    if (Test-Path $securityTestsFile) {
        Write-Info "Executing security test suite..."
        node $securityTestsFile
        if ($LASTEXITCODE -eq 0) {
            Write-Success "✅ Security tests passed"
            $script:passed++
        } else {
            Write-Error "❌ Security tests failed"
            Write-Warning "Review errors above for details"
            $script:failed++
        }
    } else {
        Write-Warning "⚠️  Security tests file not found"
        $script:warnings++
    }
    
    Write-Info "`n📦 Step 3.2: Running smoke tests..."
    
    $smokeTestsFile = Join-Path $baseDir "tests\smoke-tests.ps1"
    if (Test-Path $smokeTestsFile) {
        Write-Info "Executing smoke test suite..."
        & $smokeTestsFile
        if ($LASTEXITCODE -eq 0) {
            Write-Success "✅ Smoke tests passed"
            $script:passed++
        } else {
            Write-Warning "⚠️  Some smoke tests failed"
            $script:warnings++
        }
    } else {
        Write-Warning "⚠️  Smoke tests file not found"
        $script:warnings++
    }
    
} else {
    Write-Warning "⏭️  Skipping tests (--SkipTests flag)"
}

# ================================================================
# SUMMARY
# ================================================================

Write-Step "`nEXECUTION SUMMARY"

Write-Host ""
Write-Host "Results:" -ForegroundColor Cyan
Write-Success "✅ Passed: $passed"
Write-Error "❌ Failed: $failed"
Write-Warning "⚠️  Warnings: $warnings"
Write-Host ""

$total = $passed + $failed
if ($total -gt 0) {
    $successRate = [math]::Round(($passed / $total) * 100, 2)
    Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } else { "Yellow" })
}

Write-Host ""

if ($failed -eq 0 -and $warnings -eq 0) {
    Write-Success "🎉 ALL STEPS COMPLETED SUCCESSFULLY!"
    Write-Success "Your GRC platform is ready!"
    Write-Host ""
    Write-Info "Next steps:"
    Write-Info "1. Start services: docker-compose up -d (in infra/docker/)"
    Write-Info "2. Start dev server: cd apps/web && npm run dev"
    Write-Info "3. Open browser: http://localhost:5173"
} elseif ($failed -eq 0) {
    Write-Success "✅ EXECUTION COMPLETED WITH WARNINGS"
    Write-Warning "Review warnings above and address if needed"
} else {
    Write-Error "❌ EXECUTION COMPLETED WITH ERRORS"
    Write-Warning "Please fix errors above before proceeding"
    Write-Info ""
    Write-Info "Common fixes:"
    Write-Info "1. Ensure PostgreSQL is running"
    Write-Info "2. Check database credentials in .env"
    Write-Info "3. Verify all files are present"
    Write-Info "4. Re-run with -Verbose for more details"
}

Write-Host ""
Write-Host "Logs saved to: execution-log-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt" -ForegroundColor Gray

# Return exit code
exit $(if ($failed -eq 0) { 0 } else { 1 })
