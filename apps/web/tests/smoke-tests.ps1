# ============================================
# GRC Platform Smoke Test Suite (PowerShell)
# ============================================

param(
    [string]$BaseUrl = "http://localhost:3005",
    [string]$FrontendUrl = "http://localhost:5173"
)

$ErrorActionPreference = "Continue"
$testResults = @()
$passedTests = 0
$failedTests = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [hashtable]$Headers = @{},
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "`nTesting: $Name" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Headers $Headers -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "✅ PASSED - Status: $($response.StatusCode)" -ForegroundColor Green
            $script:passedTests++
            return @{ Name = $Name; Status = "PASSED"; StatusCode = $response.StatusCode; Response = $response }
        } else {
            Write-Host "❌ FAILED - Expected: $ExpectedStatus, Got: $($response.StatusCode)" -ForegroundColor Red
            $script:failedTests++
            return @{ Name = $Name; Status = "FAILED"; StatusCode = $response.StatusCode }
        }
    } catch {
        Write-Host "❌ FAILED - Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:failedTests++
        return @{ Name = $Name; Status = "FAILED"; Error = $_.Exception.Message }
    }
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   GRC PLATFORM SMOKE TEST SUITE" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor Gray
Write-Host "Frontend: $FrontendUrl" -ForegroundColor Gray
Write-Host "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

# ============================================
# TEST 1: Basic Health Check
# ============================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST SUITE 1: HEALTH CHECKS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$result = Test-Endpoint -Name "Basic Health Check" -Url "$BaseUrl/health"
$testResults += $result

if ($result.Status -eq "PASSED") {
    try {
        $healthData = $result.Response.Content | ConvertFrom-Json
        Write-Host "  Service: $($healthData.service)" -ForegroundColor Gray
        Write-Host "  Status: $($healthData.status)" -ForegroundColor Gray
        Write-Host "  Uptime: $($healthData.uptime) seconds" -ForegroundColor Gray
    } catch {
        Write-Host "  (Could not parse health data)" -ForegroundColor Yellow
    }
}

# ============================================
# TEST 2: Detailed Health Check
# ============================================
$result = Test-Endpoint -Name "Detailed Health Check" -Url "$BaseUrl/health/detailed"
$testResults += $result

if ($result.Status -eq "PASSED") {
    try {
        $detailedHealth = $result.Response.Content | ConvertFrom-Json
        Write-Host "  Services Summary:" -ForegroundColor Gray
        Write-Host "    Total: $($detailedHealth.summary.total)" -ForegroundColor Gray
        Write-Host "    Healthy: $($detailedHealth.summary.healthy)" -ForegroundColor Green
        Write-Host "    Unhealthy: $($detailedHealth.summary.unhealthy)" -ForegroundColor $(if ($detailedHealth.summary.unhealthy -gt 0) { "Red" } else { "Gray" })
        
        if ($detailedHealth.services) {
            foreach ($service in $detailedHealth.services.PSObject.Properties) {
                $statusColor = if ($service.Value.status -eq "healthy") { "Green" } else { "Red" }
                Write-Host "    - $($service.Name): $($service.Value.status)" -ForegroundColor $statusColor
            }
        }
    } catch {
        Write-Host "  (Could not parse detailed health data)" -ForegroundColor Yellow
    }
}

# ============================================
# TEST 3: Readiness Probe
# ============================================
$result = Test-Endpoint -Name "Readiness Probe" -Url "$BaseUrl/health/ready"
$testResults += $result

# ============================================
# TEST 4: Liveness Probe
# ============================================
$result = Test-Endpoint -Name "Liveness Probe" -Url "$BaseUrl/health/live"
$testResults += $result

# ============================================
# TEST SUITE 2: REQUEST TRACKING
# ============================================
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST SUITE 2: REQUEST TRACKING" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`nTesting: Request ID Tracking" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/health" -UseBasicParsing -TimeoutSec 10
    $requestId = $response.Headers["X-Request-ID"]
    $responseTime = $response.Headers["X-Response-Time"]
    
    if ($requestId) {
        Write-Host "✅ PASSED - Request ID present" -ForegroundColor Green
        Write-Host "  Request ID: $requestId" -ForegroundColor Gray
        if ($responseTime) {
            Write-Host "  Response Time: $responseTime" -ForegroundColor Gray
        }
        $script:passedTests++
        $testResults += @{ Name = "Request ID Tracking"; Status = "PASSED"; RequestId = $requestId }
    } else {
        Write-Host "❌ FAILED - No Request ID in headers" -ForegroundColor Red
        $script:failedTests++
        $testResults += @{ Name = "Request ID Tracking"; Status = "FAILED" }
    }
} catch {
    Write-Host "❌ FAILED - Error: $($_.Exception.Message)" -ForegroundColor Red
    $script:failedTests++
    $testResults += @{ Name = "Request ID Tracking"; Status = "FAILED"; Error = $_.Exception.Message }
}

# ============================================
# TEST SUITE 3: SECURITY & RATE LIMITING
# ============================================
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST SUITE 3: SECURITY & RATE LIMITING" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`nTesting: Rate Limiting" -ForegroundColor Yellow
$rateLimitTriggered = $false
$requestCount = 0

for ($i = 1; $i -le 20; $i++) {
    try {
        Invoke-WebRequest -Uri "$BaseUrl/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop | Out-Null
        $requestCount++
    } catch {
        if ($_.Exception.Response.StatusCode -eq 429) {
            $rateLimitTriggered = $true
            Write-Host "✅ PASSED - Rate limit triggered after $requestCount requests" -ForegroundColor Green
            $script:passedTests++
            $testResults += @{ Name = "Rate Limiting"; Status = "PASSED"; RequestCount = $requestCount }
            break
        }
    }
    Start-Sleep -Milliseconds 100
}

if (-not $rateLimitTriggered) {
    Write-Host "⚠️  WARNING - Rate limit not triggered after $requestCount requests" -ForegroundColor Yellow
    Write-Host "  (May be configured with high limits for testing)" -ForegroundColor Gray
    $testResults += @{ Name = "Rate Limiting"; Status = "WARNING"; RequestCount = $requestCount }
}

# ============================================
# TEST SUITE 4: TENANT ISOLATION
# ============================================
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST SUITE 4: TENANT ISOLATION" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`nTesting: Tenant Context Header" -ForegroundColor Yellow
try {
    $headers = @{
        "X-Tenant-ID" = "00000000-0000-0000-0000-000000000000"
    }
    $response = Invoke-WebRequest -Uri "$BaseUrl/health" -Headers $headers -UseBasicParsing -TimeoutSec 10
    
    if ($response.Headers["X-Tenant-ID"]) {
        Write-Host "✅ PASSED - Tenant ID echoed in response" -ForegroundColor Green
        Write-Host "  Tenant ID: $($response.Headers['X-Tenant-ID'])" -ForegroundColor Gray
        $script:passedTests++
        $testResults += @{ Name = "Tenant Context"; Status = "PASSED" }
    } else {
        Write-Host "⚠️  WARNING - Tenant ID not in response headers" -ForegroundColor Yellow
        $testResults += @{ Name = "Tenant Context"; Status = "WARNING" }
    }
} catch {
    Write-Host "❌ FAILED - Error: $($_.Exception.Message)" -ForegroundColor Red
    $script:failedTests++
    $testResults += @{ Name = "Tenant Context"; Status = "FAILED"; Error = $_.Exception.Message }
}

# ============================================
# TEST SUITE 5: FRONTEND
# ============================================
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST SUITE 5: FRONTEND" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$result = Test-Endpoint -Name "Frontend Availability" -Url $FrontendUrl
$testResults += $result

# ============================================
# TEST SUITE 6: ERROR HANDLING
# ============================================
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST SUITE 6: ERROR HANDLING" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$result = Test-Endpoint -Name "404 Handling" -Url "$BaseUrl/nonexistent-endpoint" -ExpectedStatus 404
$testResults += $result

# ============================================
# SUMMARY
# ============================================
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   TEST SUMMARY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$totalTests = $passedTests + $failedTests
$successRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 2) } else { 0 }

Write-Host ""
Write-Host "Total Tests: $totalTests" -ForegroundColor Gray
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor $(if ($failedTests -gt 0) { "Red" } else { "Gray" })
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })
Write-Host ""

if ($failedTests -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "System is ready for further testing." -ForegroundColor Green
} elseif ($failedTests -le 2) {
    Write-Host "⚠️  SOME TESTS FAILED" -ForegroundColor Yellow
    Write-Host "Please review failed tests before proceeding." -ForegroundColor Yellow
} else {
    Write-Host "❌ MULTIPLE TESTS FAILED" -ForegroundColor Red
    Write-Host "System requires attention before proceeding." -ForegroundColor Red
}

Write-Host ""
Write-Host "Completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "============================================" -ForegroundColor Cyan

# Export results
$resultsFile = "smoke-test-results-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$testResults | ConvertTo-Json -Depth 10 | Out-File $resultsFile
Write-Host "`nResults saved to: $resultsFile" -ForegroundColor Gray

# Exit with appropriate code
exit $(if ($failedTests -eq 0) { 0 } else { 1 })
