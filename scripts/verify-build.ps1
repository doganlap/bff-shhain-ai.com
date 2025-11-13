# Verify Build Setup Script
# Checks if all required files exist for building

Write-Host "🔍 Verifying Build Setup..." -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# Function to check file
function Check-File {
    param(
        [string]$Path,
        [string]$Name
    )
    
    if (Test-Path $Path) {
        Write-Host "  ✅ $Name" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ❌ $Name (Missing: $Path)" -ForegroundColor Red
        return $false
    }
}

# Function to check directory
function Check-Directory {
    param(
        [string]$Path,
        [string]$Name
    )
    
    if (Test-Path $Path) {
        Write-Host "  ✅ $Name" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ❌ $Name (Missing: $Path)" -ForegroundColor Red
        return $false
    }
}

# Check Dockerfiles
Write-Host "Dockerfiles:" -ForegroundColor Yellow
$dockerfiles = @(
    @{Path="apps/bff/Dockerfile"; Name="BFF Dockerfile"},
    @{Path="apps/bff/Dockerfile.dev"; Name="BFF Dockerfile.dev"},
    @{Path="apps/services/auth-service/Dockerfile"; Name="Auth Service Dockerfile"},
    @{Path="apps/services/auth-service/Dockerfile.dev"; Name="Auth Service Dockerfile.dev"},
    @{Path="apps/services/document-service/Dockerfile"; Name="Document Service Dockerfile"},
    @{Path="apps/services/document-service/Dockerfile.dev"; Name="Document Service Dockerfile.dev"},
    @{Path="apps/services/partner-service/Dockerfile"; Name="Partner Service Dockerfile"},
    @{Path="apps/services/partner-service/Dockerfile.dev"; Name="Partner Service Dockerfile.dev"},
    @{Path="apps/services/notification-service/Dockerfile"; Name="Notification Service Dockerfile"},
    @{Path="apps/services/notification-service/Dockerfile.dev"; Name="Notification Service Dockerfile.dev"},
    @{Path="apps/services/grc-api/Dockerfile"; Name="GRC API Dockerfile"},
    @{Path="apps/services/grc-api/Dockerfile.dev"; Name="GRC API Dockerfile.dev"},
    @{Path="apps/web/Dockerfile.dev"; Name="Web Dockerfile.dev"}
)

foreach ($df in $dockerfiles) {
    if (-not (Check-File $df.Path $df.Name)) {
        $errors++
    }
}

Write-Host ""

# Check package.json files
Write-Host "Package.json Files:" -ForegroundColor Yellow
$packages = @(
    @{Path="apps/bff/package.json"; Name="BFF"},
    @{Path="apps/services/auth-service/package.json"; Name="Auth Service"},
    @{Path="apps/services/document-service/package.json"; Name="Document Service"},
    @{Path="apps/services/partner-service/package.json"; Name="Partner Service"},
    @{Path="apps/services/notification-service/package.json"; Name="Notification Service"},
    @{Path="apps/services/grc-api/package.json"; Name="GRC API"},
    @{Path="apps/web/package.json"; Name="Web"}
)

foreach ($pkg in $packages) {
    if (-not (Check-File $pkg.Path $pkg.Name)) {
        $errors++
    }
}

Write-Host ""

# Check docker-compose
Write-Host "Docker Compose:" -ForegroundColor Yellow
if (-not (Check-File "infra/docker/docker-compose.ecosystem.yml" "Docker Compose Ecosystem")) {
    $errors++
}

Write-Host ""

# Check build scripts
Write-Host "Build Scripts:" -ForegroundColor Yellow
if (-not (Check-File "scripts/build-all.ps1" "PowerShell Build Script")) {
    $warnings++
}
if (-not (Check-File "scripts/build-all.sh" "Bash Build Script")) {
    $warnings++
}

Write-Host ""

# Check service entry points
Write-Host "Service Entry Points:" -ForegroundColor Yellow
$entryPoints = @(
    @{Path="apps/bff/index.js"; Name="BFF"},
    @{Path="apps/services/auth-service/server.js"; Name="Auth Service"},
    @{Path="apps/services/document-service/server.js"; Name="Document Service"},
    @{Path="apps/services/partner-service/server.js"; Name="Partner Service"},
    @{Path="apps/services/notification-service/server.js"; Name="Notification Service"},
    @{Path="apps/services/grc-api/server.js"; Name="GRC API"}
)

foreach ($ep in $entryPoints) {
    if (-not (Check-File $ep.Path $ep.Name)) {
        $errors++
    }
}

Write-Host ""

# Summary
Write-Host "=============================" -ForegroundColor Cyan
if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "✅ All checks passed! Ready to build." -ForegroundColor Green
    exit 0
} elseif ($errors -eq 0) {
    Write-Host "⚠️  Build ready with $warnings warning(s)" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "❌ Build setup incomplete. $errors error(s) found." -ForegroundColor Red
    exit 1
}

