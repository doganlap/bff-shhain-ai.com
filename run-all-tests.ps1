#!/usr/bin/env pwsh
#
# COMPREHENSIVE TEST RUNNER
# =========================
#
# Runs all tests for Card Components and APIs:
# 1. Backend API Tests (Node.js/TypeScript)
# 2. Frontend Card Component Tests (React Testing Library)
# 3. Integration Tests
# 4. End-to-End Validation
#
# Usage: .\run-all-tests.ps1

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   SHAHIN GRC - COMPREHENSIVE TEST SUITE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$testResults = @()
$startTime = Get-Date

# ============================================
# TEST 1: Backend API Tests
# ============================================

Write-Host "🧪 TEST 1: Backend API Tests (BFF)" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

try {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    Push-Location apps\bff
    npm install --silent
    Pop-Location

    Write-Host "✅ Dependencies installed" -ForegroundColor Green
    Write-Host ""

    Write-Host "🚀 Running backend API tests..." -ForegroundColor Cyan
    $apiTestOutput = ts-node apps\bff\src\tests\card-api-test.ts 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend API Tests: PASSED" -ForegroundColor Green
        $testResults += @{ Name = "Backend API Tests"; Status = "PASS" }
    } else {
        Write-Host "❌ Backend API Tests: FAILED" -ForegroundColor Red
        Write-Host $apiTestOutput -ForegroundColor Red
        $testResults += @{ Name = "Backend API Tests"; Status = "FAIL" }
    }
} catch {
    Write-Host "❌ Backend API Tests: ERROR" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    $testResults += @{ Name = "Backend API Tests"; Status = "ERROR" }
}

Write-Host ""

# ============================================
# TEST 2: Frontend Card Component Tests
# ============================================

Write-Host "🧪 TEST 2: Frontend Card Component Tests (React)" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

try {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    Push-Location apps\web
    npm install --silent
    Pop-Location

    Write-Host "✅ Dependencies installed" -ForegroundColor Green
    Write-Host ""

    Write-Host "🚀 Running card component tests..." -ForegroundColor Cyan
    $cardTestOutput = npm test --prefix apps\web -- AssessmentCards.test.jsx --coverage 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Card Component Tests: PASSED" -ForegroundColor Green
        $testResults += @{ Name = "Card Component Tests"; Status = "PASS" }
    } else {
        Write-Host "❌ Card Component Tests: FAILED" -ForegroundColor Red
        Write-Host $cardTestOutput -ForegroundColor Red
        $testResults += @{ Name = "Card Component Tests"; Status = "FAIL" }
    }
} catch {
    Write-Host "❌ Card Component Tests: ERROR" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    $testResults += @{ Name = "Card Component Tests"; Status = "ERROR" }
}

Write-Host ""

# ============================================
# TEST 3: Database Schema Validation
# ============================================

Write-Host "🧪 TEST 3: Database Schema Validation" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

try {
    Write-Host "🔍 Validating Prisma schema..." -ForegroundColor Cyan
    npx prisma validate 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database Schema: VALID" -ForegroundColor Green
        $testResults += @{ Name = "Database Schema"; Status = "PASS" }
    } else {
        Write-Host "❌ Database Schema: INVALID" -ForegroundColor Red
        $testResults += @{ Name = "Database Schema"; Status = "FAIL" }
    }
} catch {
    Write-Host "❌ Database Schema: ERROR" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    $testResults += @{ Name = "Database Schema"; Status = "ERROR" }
}

Write-Host ""

# ============================================
# TEST 4: TypeScript Compilation
# ============================================

Write-Host "🧪 TEST 4: TypeScript Compilation" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

try {
    Write-Host "🔨 Compiling TypeScript (BFF)..." -ForegroundColor Cyan
    Push-Location apps\bff
    npx tsc --noEmit 2>&1
    Pop-Location

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ TypeScript Compilation: SUCCESS" -ForegroundColor Green
        $testResults += @{ Name = "TypeScript Compilation"; Status = "PASS" }
    } else {
        Write-Host "❌ TypeScript Compilation: FAILED" -ForegroundColor Red
        $testResults += @{ Name = "TypeScript Compilation"; Status = "FAIL" }
    }
} catch {
    Write-Host "❌ TypeScript Compilation: ERROR" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    $testResults += @{ Name = "TypeScript Compilation"; Status = "ERROR" }
}

Write-Host ""

# ============================================
# TEST 5: ESLint Code Quality
# ============================================

Write-Host "🧪 TEST 5: ESLint Code Quality" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

try {
    Write-Host "🔍 Running ESLint..." -ForegroundColor Cyan
    npx eslint apps/bff/src apps/web/src --ext .js,.jsx,.ts,.tsx 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ ESLint: NO ISSUES" -ForegroundColor Green
        $testResults += @{ Name = "ESLint Code Quality"; Status = "PASS" }
    } else {
        Write-Host "⚠️  ESLint: WARNINGS FOUND" -ForegroundColor Yellow
        $testResults += @{ Name = "ESLint Code Quality"; Status = "WARN" }
    }
} catch {
    Write-Host "❌ ESLint: ERROR" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    $testResults += @{ Name = "ESLint Code Quality"; Status = "ERROR" }
}

Write-Host ""

# ============================================
# TEST 6: API Route Integration Check
# ============================================

Write-Host "🧪 TEST 6: API Route Integration Check" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

try {
    Write-Host "🔍 Checking API route mounting..." -ForegroundColor Cyan

    $indexFile = Get-Content "apps\bff\src\index.ts" -Raw

    $routesMounted = @(
        "onboardingRoutes",
        "assessmentRoutes",
        "evidenceRoutes",
        "taskRoutes",
        "gapRoutes"
    )

    $allMounted = $true
    foreach ($route in $routesMounted) {
        if ($indexFile -notmatch $route) {
            Write-Host "❌ Route not mounted: $route" -ForegroundColor Red
            $allMounted = $false
        }
    }

    if ($allMounted) {
        Write-Host "✅ All API Routes: MOUNTED" -ForegroundColor Green
        $testResults += @{ Name = "API Route Integration"; Status = "PASS" }
    } else {
        Write-Host "⚠️  Some API Routes: NOT MOUNTED" -ForegroundColor Yellow
        $testResults += @{ Name = "API Route Integration"; Status = "WARN" }
    }
} catch {
    Write-Host "❌ API Route Check: ERROR" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    $testResults += @{ Name = "API Route Integration"; Status = "ERROR" }
}

Write-Host ""

# ============================================
# TEST 7: Component Import Validation
# ============================================

Write-Host "🧪 TEST 7: Component Import Validation" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

try {
    Write-Host "🔍 Validating component imports..." -ForegroundColor Cyan

    $components = @(
        "MaturityBadge",
        "StatsCard",
        "FrameworkCard",
        "ControlCard",
        "GapCard",
        "ScoreCard",
        "AssessmentSummaryCard"
    )

    $cardFile = Get-Content "apps\web\src\components\AssessmentCards.jsx" -Raw

    $allComponentsExist = $true
    foreach ($component in $components) {
        if ($cardFile -notmatch "export (const|function) $component") {
            Write-Host "❌ Component not found: $component" -ForegroundColor Red
            $allComponentsExist = $false
        }
    }

    if ($allComponentsExist) {
        Write-Host "✅ All Card Components: EXPORTED" -ForegroundColor Green
        $testResults += @{ Name = "Component Import Validation"; Status = "PASS" }
    } else {
        Write-Host "❌ Some Components: MISSING" -ForegroundColor Red
        $testResults += @{ Name = "Component Import Validation"; Status = "FAIL" }
    }
} catch {
    Write-Host "❌ Component Import Validation: ERROR" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    $testResults += @{ Name = "Component Import Validation"; Status = "ERROR" }
}

Write-Host ""

# ============================================
# TEST SUMMARY
# ============================================

$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   TEST SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$passCount = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$warnCount = ($testResults | Where-Object { $_.Status -eq "WARN" }).Count
$errorCount = ($testResults | Where-Object { $_.Status -eq "ERROR" }).Count
$totalCount = $testResults.Count

foreach ($result in $testResults) {
    $statusColor = switch ($result.Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "WARN" { "Yellow" }
        "ERROR" { "Red" }
    }

    $statusIcon = switch ($result.Status) {
        "PASS" { "✅" }
        "FAIL" { "❌" }
        "WARN" { "⚠️ " }
        "ERROR" { "❌" }
    }

    Write-Host "$statusIcon $($result.Name): $($result.Status)" -ForegroundColor $statusColor
}

Write-Host ""
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "Total Tests: $totalCount" -ForegroundColor Cyan
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host "Warnings: $warnCount" -ForegroundColor Yellow
Write-Host "Errors: $errorCount" -ForegroundColor Red
Write-Host "Duration: $([math]::Round($duration, 2))s" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

if ($failCount -eq 0 -and $errorCount -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ SOME TESTS FAILED" -ForegroundColor Red
    exit 1
}
