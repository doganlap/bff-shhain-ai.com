# Migration Script: ShahinAI -> Assessment-GRC
# This script migrates files from ShahinAI to Assessment-GRC following the ABI structure

$ErrorActionPreference = "Stop"
$SourceRoot = "D:\Projects\GRC-Master\ShahinAI"
$DestRoot = "D:\Projects\GRC-Master\Assessmant-GRC"

# Function to safely copy directory
function Copy-DirectorySafe {
    param($Source, $Dest, $Exclude = @())
    if (Test-Path $Source) {
        Write-Host "Copying: $Source -> $Dest" -ForegroundColor Yellow
        $destParent = Split-Path $Dest -Parent
        if (-not (Test-Path $destParent)) {
            New-Item -ItemType Directory -Path $destParent -Force | Out-Null
        }
        Copy-Item -Path $Source -Destination $Dest -Recurse -Exclude $Exclude -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Copied" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Source not found: $Source" -ForegroundColor Red
    }
}

# Function to safely copy file
function Copy-FileSafe {
    param($Source, $Dest)
    if (Test-Path $Source) {
        Write-Host "Copying: $Source -> $Dest" -ForegroundColor Yellow
        $destParent = Split-Path $Dest -Parent
        if (-not (Test-Path $destParent)) {
            New-Item -ItemType Directory -Path $destParent -Force | Out-Null
        }
        Copy-Item -Path $Source -Destination $Dest -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Copied" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Source not found: $Source" -ForegroundColor Red
    }
}

Write-Host "Starting migration from $SourceRoot to $DestRoot" -ForegroundColor Green

Write-Host "`n=== 1. Moving Backend Code ===" -ForegroundColor Cyan
# Backend application files
$backendFiles = @(
    "server.js", "package.json", "package-lock.json", "jest.config.js", 
    "jest.setup.js", "babel.config.js", "check-tables.js", "setup-database-simple.js", "Dockerfile.dev"
)
foreach ($file in $backendFiles) {
    Copy-FileSafe "$SourceRoot\backend\$file" "$DestRoot\apps\services\grc-api\$file"
}

# Backend directories
$backendDirs = @(
    "config", "middleware", "routes", "services", "utils", "constants", 
    "src", "__tests__", "__mocks__", "core", "models", "jobs", "quarantine", "secure-storage"
)
foreach ($dir in $backendDirs) {
    Copy-DirectorySafe "$SourceRoot\backend\$dir" "$DestRoot\apps\services\grc-api\$dir" @("node_modules")
}

# Uploads and logs (optional, may be large)
if (Test-Path "$SourceRoot\backend\uploads") {
    Write-Host "Note: Skipping uploads directory (may contain large files)" -ForegroundColor Yellow
}
if (Test-Path "$SourceRoot\backend\logs") {
    Write-Host "Note: Skipping logs directory" -ForegroundColor Yellow
}

Write-Host "`n=== 2. Moving Frontend Code ===" -ForegroundColor Cyan
# Frontend - copy entire directory excluding build artifacts
$frontendExclude = @("node_modules", "build", "dist", "*.log")
Copy-DirectorySafe "$SourceRoot\frontend" "$DestRoot\apps\web" $frontendExclude

Write-Host "`n=== 3. Moving Database Migrations ===" -ForegroundColor Cyan
Copy-DirectorySafe "$SourceRoot\backend\migrations" "$DestRoot\infra\db\migrations"

Write-Host "`n=== 4. Moving Database Schemas ===" -ForegroundColor Cyan
Copy-DirectorySafe "$SourceRoot\database-schema" "$DestRoot\infra\db\schema"
Copy-DirectorySafe "$SourceRoot\backend\database" "$DestRoot\infra\db\schema\backend"

Write-Host "`n=== 5. Moving Docker Files ===" -ForegroundColor Cyan
$dockerFiles = @(
    "docker-compose.yml", "docker-compose.dev.yml", "docker-compose.production.yml",
    "docker-compose.monitoring.yml", "docker-compose.simple.yml",
    "Dockerfile", "Dockerfile.simple", "Dockerfile.haproxy",
    "nginx.Dockerfile", "varnish.Dockerfile", "nginx.conf", "nginx-ssl.conf"
)
foreach ($file in $dockerFiles) {
    Copy-FileSafe "$SourceRoot\$file" "$DestRoot\infra\docker\$file"
}
if (Test-Path "$SourceRoot\nginx-production.conf") {
    Copy-DirectorySafe "$SourceRoot\nginx-production.conf" "$DestRoot\infra\docker\nginx-production.conf"
}

Write-Host "`n=== 6. Moving Scripts ===" -ForegroundColor Cyan
# Root level scripts
Copy-FileSafe "$SourceRoot\analyze-database-structure.js" "$DestRoot\scripts\db\analyze-database-structure.js"
Copy-FileSafe "$SourceRoot\analyze-schema.js" "$DestRoot\scripts\db\analyze-schema.js"
Copy-FileSafe "$SourceRoot\check-db-stats.js" "$DestRoot\scripts\db\check-db-stats.js"
Copy-FileSafe "$SourceRoot\database-summary.js" "$DestRoot\scripts\db\database-summary.js"
Copy-FileSafe "$SourceRoot\create-owner.js" "$DestRoot\scripts\db\create-owner.js"
Copy-FileSafe "$SourceRoot\list-db-assets.js" "$DestRoot\scripts\db\list-db-assets.js"

Copy-FileSafe "$SourceRoot\direct-database-import.js" "$DestRoot\scripts\data\direct-database-import.js"
Copy-FileSafe "$SourceRoot\import-comprehensive-data.js" "$DestRoot\scripts\data\import-comprehensive-data.js"
Copy-FileSafe "$SourceRoot\import_to_trackers.py" "$DestRoot\scripts\data\import_to_trackers.py"
Copy-FileSafe "$SourceRoot\implement-unified-flow.js" "$DestRoot\scripts\data\implement-unified-flow.js"

Copy-FileSafe "$SourceRoot\start-advanced-ui.js" "$DestRoot\scripts\dev\start-advanced-ui.js"
Copy-FileSafe "$SourceRoot\docker-build.sh" "$DestRoot\scripts\infra\docker-build.sh"
Copy-FileSafe "$SourceRoot\docker-build.bat" "$DestRoot\scripts\infra\docker-build.bat"

# Backend scripts
Copy-DirectorySafe "$SourceRoot\backend\scripts" "$DestRoot\scripts\db\backend-scripts"

# Root scripts directory
if (Test-Path "$SourceRoot\scripts") {
    Copy-DirectorySafe "$SourceRoot\scripts" "$DestRoot\scripts\shahinai-scripts"
}

Write-Host "`n=== 7. Moving Documentation ===" -ForegroundColor Cyan
# Runbooks
Copy-FileSafe "$SourceRoot\DOCKER_SETUP.md" "$DestRoot\docs\runbooks\Docker-Setup.md"
Copy-FileSafe "$SourceRoot\QUICK_DOCKER_START.md" "$DestRoot\docs\runbooks\Quick-Docker-Start.md"
Copy-FileSafe "$SourceRoot\PRODUCTION_DEPLOYMENT_GUIDE.md" "$DestRoot\docs\runbooks\Production-Deployment.md"

# ADR
Copy-FileSafe "$SourceRoot\UNIFIED_FLOW_STRUCTURE.md" "$DestRoot\docs\adr\0001-unified-flow-structure.md"
Copy-FileSafe "$SourceRoot\BACKEND_ANALYSIS.md" "$DestRoot\docs\adr\0002-backend-architecture.md"
Copy-FileSafe "$SourceRoot\SYSTEM_COMPLETION_SUMMARY.md" "$DestRoot\docs\adr\0003-system-completion.md"

# Technical docs
Copy-FileSafe "$SourceRoot\COMPLETE_DATABASE_STRUCTURE.md" "$DestRoot\docs\technical\database-structure.md"
Copy-FileSafe "$SourceRoot\COMPLETE_DIRECTORY_STRUCTURE.md" "$DestRoot\docs\technical\directory-structure.md"
Copy-FileSafe "$SourceRoot\DATABASE_SCHEMA_FIXED.md" "$DestRoot\docs\technical\database-schema-fixes.md"
Copy-FileSafe "$SourceRoot\DATABASE_MISMATCHES_ANALYSIS.md" "$DestRoot\docs\technical\database-mismatches.md"
Copy-FileSafe "$SourceRoot\PAGES_COMPONENTS_SERVICES_MAPPING.md" "$DestRoot\docs\technical\ui-architecture.md"
Copy-FileSafe "$SourceRoot\COMPONENTS_INTEGRATION_SUMMARY.md" "$DestRoot\docs\technical\components-integration.md"
Copy-FileSafe "$SourceRoot\SOURCE_CODE_INVENTORY.md" "$DestRoot\docs\technical\source-code-inventory.md"

# Features
Copy-FileSafe "$SourceRoot\FEATURES.md" "$DestRoot\docs\features\features.md"
Copy-FileSafe "$SourceRoot\ADVANCED_UI_README.md" "$DestRoot\docs\features\advanced-ui.md"
Copy-FileSafe "$SourceRoot\AA_INI_IMPLEMENTATION_STATUS.md" "$DestRoot\docs\features\aa-ini-implementation.md"

# Reports
Copy-FileSafe "$SourceRoot\COMPREHENSIVE_TEST_REPORT.md" "$DestRoot\docs\reports\test-report.md"
Copy-FileSafe "$SourceRoot\UI_DATABASE_INTEGRATION_TEST_REPORT.md" "$DestRoot\docs\reports\ui-database-integration.md"
Copy-FileSafe "$SourceRoot\PRODUCTION_REPORT.md" "$DestRoot\docs\reports\production-report.md"
Copy-FileSafe "$SourceRoot\PRODUCTION_SUMMARY.md" "$DestRoot\docs\reports\production-summary.md"
Copy-FileSafe "$SourceRoot\BACKEND_FIXES_SUMMARY.md" "$DestRoot\docs\reports\backend-fixes.md"
Copy-FileSafe "$SourceRoot\PROBLEMS_FIXED.md" "$DestRoot\docs\reports\problems-fixed.md"
Copy-FileSafe "$SourceRoot\MANDATORY_REPORTS_CHECKLIST.md" "$DestRoot\docs\reports\mandatory-checklist.md"

# Guides
Copy-FileSafe "$SourceRoot\START_HERE.md" "$DestRoot\docs\guides\start-here.md"
if (Test-Path "$SourceRoot\QUICK_START.txt") {
    Copy-FileSafe "$SourceRoot\QUICK_START.txt" "$DestRoot\docs\guides\quick-start.txt"
}
Copy-FileSafe "$SourceRoot\README_IMPORT.md" "$DestRoot\docs\guides\data-import.md"
Copy-FileSafe "$SourceRoot\SECURITY.md" "$DestRoot\docs\guides\security.md"
Copy-FileSafe "$SourceRoot\UI_INSTRUCTIONS_ACTION_PLAN.md" "$DestRoot\docs\guides\ui-instructions.md"
Copy-FileSafe "$SourceRoot\UIagentinistrucions.md" "$DestRoot\docs\guides\ui-agent-instructions.md"

# Templates
Copy-FileSafe "$SourceRoot\TEMPLATE_SUMMARY.md" "$DestRoot\docs\templates\template-summary.md"
Copy-FileSafe "$SourceRoot\TEMPLATE_CONTENTS.md" "$DestRoot\docs\templates\template-contents.md"
Copy-FileSafe "$SourceRoot\INDEX.md" "$DestRoot\docs\index.md"

# Documentation directory
if (Test-Path "$SourceRoot\documentation") {
    Copy-DirectorySafe "$SourceRoot\documentation" "$DestRoot\docs\documentation"
}

# Reports directory
if (Test-Path "$SourceRoot\reports") {
    Copy-DirectorySafe "$SourceRoot\reports" "$DestRoot\reports"
}

Write-Host "`n=== 8. Moving Test Files ===" -ForegroundColor Cyan
# Test files to backend tests
$testFiles = @{
    "test-api-routes.js" = "__tests__\integration\api-routes.test.js"
    "test-assessment-templates.js" = "__tests__\integration\assessment-templates.test.js"
    "test-auth.js" = "__tests__\integration\auth.test.js"
    "test-database-integration.js" = "__tests__\integration\database.test.js"
    "test-document-pipeline.js" = "__tests__\integration\document-pipeline.test.js"
    "test-microsoft-auth.js" = "__tests__\integration\microsoft-auth.test.js"
    "test-security.js" = "__tests__\security\security.test.js"
    "test-security-simple.js" = "__tests__\security\security-simple.test.js"
    "test-templates-simple.js" = "__tests__\unit\templates-simple.test.js"
    "test-table-to-ui-mapping.js" = "__tests__\integration\table-to-ui-mapping.test.js"
}
foreach ($test in $testFiles.GetEnumerator()) {
    $destPath = "$DestRoot\apps\services\grc-api\$($test.Value)"
    Copy-FileSafe "$SourceRoot\$($test.Key)" $destPath
}

# Tests directory
if (Test-Path "$SourceRoot\tests") {
    Copy-DirectorySafe "$SourceRoot\tests" "$DestRoot\apps\services\grc-api\__tests__\shahinai-tests"
}

Write-Host "`n=== 9. Moving Data Files ===" -ForegroundColor Cyan
# Data files (check for duplicates first)
$dataFiles = @(
    "grc_execution_tasks_smart.csv",
    "filtered_data_ksa_mapped_bilingual.csv",
    "azdo_bulk_import.csv",
    "jira_bulk_payload.json",
    "teams_template.csv",
    "tenants_template.csv",
    "routing_rules.yaml"
)
foreach ($file in $dataFiles) {
    if (Test-Path "$SourceRoot\$file") {
        if (Test-Path "$DestRoot\$file") {
            Write-Host "  ⚠ File exists, skipping: $file (compare manually)" -ForegroundColor Yellow
        } else {
            Copy-FileSafe "$SourceRoot\$file" "$DestRoot\$file"
        }
    }
}

# Config files
Copy-FileSafe "$SourceRoot\tracker_import.env" "$DestRoot\tracker_import.env"
Copy-FileSafe "$SourceRoot\aa.ini" "$DestRoot\apps\services\grc-api\config\aa.ini"

# Data directories
if (Test-Path "$SourceRoot\data") {
    Copy-DirectorySafe "$SourceRoot\data" "$DestRoot\data"
}
if (Test-Path "$SourceRoot\data-import") {
    Copy-DirectorySafe "$SourceRoot\data-import" "$DestRoot\data-import"
}

Write-Host "`n=== 10. Moving Infrastructure Files ===" -ForegroundColor Cyan
# Monitoring
if (Test-Path "$SourceRoot\monitoring") {
    Copy-DirectorySafe "$SourceRoot\monitoring" "$DestRoot\infra\monitoring"
}
if (Test-Path "$SourceRoot\performance") {
    Copy-DirectorySafe "$SourceRoot\performance" "$DestRoot\infra\monitoring\performance"
}

# Security
if (Test-Path "$SourceRoot\security") {
    Copy-DirectorySafe "$SourceRoot\security" "$DestRoot\infra\security"
}
if (Test-Path "$SourceRoot\ssl") {
    Copy-DirectorySafe "$SourceRoot\ssl" "$DestRoot\infra\security\ssl"
}

# Deployment
if (Test-Path "$SourceRoot\deployment") {
    Copy-DirectorySafe "$SourceRoot\deployment" "$DestRoot\infra\deployment"
}

Write-Host "`n=== Migration Complete! ===" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Review moved files and compare duplicates" -ForegroundColor White
Write-Host "2. Update paths in moved files (imports, configs, etc.)" -ForegroundColor White
Write-Host "3. Update docker-compose.yml paths" -ForegroundColor White
Write-Host "4. Update package.json scripts" -ForegroundColor White
Write-Host "5. Generate OpenAPI contracts from routes" -ForegroundColor White
Write-Host "6. Test the migrated code" -ForegroundColor White

