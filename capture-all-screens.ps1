# ====================================================
# Shahin-AI Complete UI Screen Capture
# ====================================================

Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  Shahin-AI UI Screen Capture" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ProjectRoot = $PSScriptRoot
$WebAppPath = Join-Path $ProjectRoot "apps\web"
$TestResultsDir = Join-Path $ProjectRoot "test-results"
$ScreenshotsDir = Join-Path $TestResultsDir "screenshots"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$SessionDir = Join-Path $ScreenshotsDir $timestamp

# Create directories
New-Item -ItemType Directory -Force -Path $SessionDir | Out-Null
Write-Host "Screenshots will be saved to: $SessionDir" -ForegroundColor Green
Write-Host ""

# Check if dev server is running
function Test-ServerRunning {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 2 -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Start server if needed
$ServerProcess = $null
if (-not (Test-ServerRunning)) {
    Write-Host "Starting development server..." -ForegroundColor Yellow
    $ServerProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory $WebAppPath -PassThru -WindowStyle Minimized
    
    Write-Host "Waiting for server..." -ForegroundColor Yellow
    $waited = 0
    while ((-not (Test-ServerRunning)) -and ($waited -lt 60)) {
        Start-Sleep -Seconds 2
        $waited += 2
        Write-Host "." -NoNewline
    }
    Write-Host ""
    
    if (Test-ServerRunning) {
        Write-Host "Server ready!" -ForegroundColor Green
    } else {
        Write-Host "Server failed to start" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Development server is already running" -ForegroundColor Green
}

Write-Host ""
Write-Host "Running UI capture tests..." -ForegroundColor Cyan
Write-Host ""

# Run Robot tests
$robotArgs = @(
    "--outputdir", $SessionDir,
    "--loglevel", "INFO:INFO",
    "--console", "verbose",
    "--variable", "SCREENSHOT_DIR:$SessionDir",
    (Join-Path $ProjectRoot "tests\robot\complete_ui_tests.robot")
)

Write-Host "Executing: robot $($robotArgs -join ' ')" -ForegroundColor Gray
Write-Host ""

try {
    & robot @robotArgs
    $exitCode = $LASTEXITCODE
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    $exitCode = 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Capture Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Count screenshots
$screenshots = Get-ChildItem -Path $SessionDir -Filter "*.png" -ErrorAction SilentlyContinue
Write-Host "Screenshots captured: $($screenshots.Count)" -ForegroundColor Green
Write-Host "Location: $SessionDir" -ForegroundColor Cyan
Write-Host ""

# List captured screenshots
if ($screenshots.Count -gt 0) {
    Write-Host "Captured screens:" -ForegroundColor Yellow
    foreach ($screenshot in $screenshots | Sort-Object Name) {
        $size = [math]::Round($screenshot.Length / 1KB, 1)
        Write-Host "  - $($screenshot.Name) ($size KB)" -ForegroundColor White
    }
    Write-Host ""
}

# Open report
$reportPath = Join-Path $SessionDir "report.html"
if (Test-Path $reportPath) {
    Write-Host "Opening test report..." -ForegroundColor Yellow
    Start-Process $reportPath
}

# Open screenshots folder
Write-Host "Opening screenshots folder..." -ForegroundColor Yellow
Start-Process $SessionDir

# Cleanup
if ($ServerProcess) {
    Write-Host ""
    Write-Host "Stopping development server..." -ForegroundColor Yellow
    Stop-Process -Id $ServerProcess.Id -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Write-Host ""

exit $exitCode
