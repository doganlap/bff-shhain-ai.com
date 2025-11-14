# ====================================================
# Shahin-AI Visual Testing Script with Robot Framework
# ====================================================

param(
    [string]$Browser = "chrome",
    [switch]$Headless,
    [switch]$SkipServerStart
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Shahin-AI Visual Testing Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$ProjectRoot = $PSScriptRoot
$WebAppPath = Join-Path $ProjectRoot "apps\web"
$TestResultsDir = Join-Path $ProjectRoot "test-results"
$ScreenshotsDir = Join-Path $TestResultsDir "screenshots"
$VideosDir = Join-Path $TestResultsDir "videos"
$ReportsDir = Join-Path $TestResultsDir "reports"
$RobotTestsDir = Join-Path $ProjectRoot "tests\robot"

# Create directories
Write-Host "Creating test result directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $TestResultsDir | Out-Null
New-Item -ItemType Directory -Force -Path $ScreenshotsDir | Out-Null
New-Item -ItemType Directory -Force -Path $VideosDir | Out-Null
New-Item -ItemType Directory -Force -Path $ReportsDir | Out-Null

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
    return $connection.TcpTestSucceeded
}

# Start Development Server
$ServerProcess = $null
if (-not $SkipServerStart) {
    Write-Host ""
    Write-Host "Starting development server..." -ForegroundColor Yellow
    
    # Check if port 5173 is already in use
    if (Test-Port -Port 5173) {
        Write-Host "Development server already running on port 5173" -ForegroundColor Green
    } else {
        Write-Host "Starting Vite dev server..." -ForegroundColor Cyan
        
        # Start server in background
        $ServerProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory $WebAppPath -PassThru -WindowStyle Hidden
        
        Write-Host "Waiting for server to start..." -ForegroundColor Yellow
        $maxWait = 60
        $waited = 0
        
        while (-not (Test-Port -Port 5173) -and $waited -lt $maxWait) {
            Start-Sleep -Seconds 2
            $waited += 2
            Write-Host "." -NoNewline
        }
        
        if (Test-Port -Port 5173) {
            Write-Host ""
            Write-Host "Server started successfully!" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "Server failed to start within $maxWait seconds" -ForegroundColor Red
            if ($ServerProcess) {
                Stop-Process -Id $ServerProcess.Id -Force
            }
            exit 1
        }
    }
}

# Check Robot Framework installation
Write-Host ""
Write-Host "Checking Robot Framework installation..." -ForegroundColor Yellow
try {
    $robotVersion = robot --version 2>&1 | Select-String "Robot Framework"
    Write-Host "Found: $robotVersion" -ForegroundColor Green
} catch {
    Write-Host "Robot Framework not found! Installing..." -ForegroundColor Red
    pip install robotframework robotframework-seleniumlibrary
}

# Check Selenium WebDriver
Write-Host ""
Write-Host "Checking Selenium WebDriver..." -ForegroundColor Yellow
try {
    python -c "import selenium" 2>&1 | Out-Null
    Write-Host "Selenium is installed" -ForegroundColor Green
} catch {
    Write-Host "Installing Selenium..." -ForegroundColor Yellow
    pip install selenium
}

# Download ChromeDriver if needed
Write-Host ""
Write-Host "Checking ChromeDriver..." -ForegroundColor Yellow
try {
    chromedriver --version 2>&1 | Out-Null
    Write-Host "ChromeDriver is available" -ForegroundColor Green
} catch {
    Write-Host "ChromeDriver not found in PATH" -ForegroundColor Yellow
    Write-Host "Please install ChromeDriver from: https://chromedriver.chromium.org/" -ForegroundColor Yellow
}

# Run Robot Framework Tests
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Running Visual Tests..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outputDir = Join-Path $ReportsDir $timestamp

# Build Robot command
$robotArgs = @(
    "--outputdir", $outputDir,
    "--loglevel", "INFO",
    "--reporttitle", "Shahin-AI Visual Test Report",
    "--logtitle", "Shahin-AI Visual Test Log",
    "--variable", "BROWSER:$Browser"
)

if ($Headless) {
    $robotArgs += "--variable", "HEADLESS:True"
}

# Add test files
$robotArgs += Join-Path $RobotTestsDir "visual_tests.robot"

Write-Host "Running tests with command:" -ForegroundColor Cyan
Write-Host "robot $($robotArgs -join ' ')" -ForegroundColor Gray
Write-Host ""

# Run tests
try {
    & robot @robotArgs
    $testExitCode = $LASTEXITCODE
} catch {
    Write-Host "Error running tests: $_" -ForegroundColor Red
    $testExitCode = 1
}

# Generate summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Execution Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Read Robot output
$outputXml = Join-Path $outputDir "output.xml"
if (Test-Path $outputXml) {
    Write-Host ""
    Write-Host "Test Results:" -ForegroundColor Yellow
    Write-Host "  Report: $outputDir\report.html" -ForegroundColor Green
    Write-Host "  Log: $outputDir\log.html" -ForegroundColor Green
    Write-Host "  Screenshots: $ScreenshotsDir\" -ForegroundColor Green
    
    # Try to parse results
    try {
        [xml]$results = Get-Content $outputXml
        $stats = $results.robot.statistics.total.stat
        
        Write-Host ""
        Write-Host "Statistics:" -ForegroundColor Yellow
        Write-Host "  Total Tests: $($stats.pass + $stats.fail)" -ForegroundColor Cyan
        Write-Host "  Passed: $($stats.pass)" -ForegroundColor Green
        Write-Host "  Failed: $($stats.fail)" -ForegroundColor $(if ($stats.fail -eq 0) { "Green" } else { "Red" })
    } catch {
        Write-Host "Could not parse test results" -ForegroundColor Yellow
    }
}

# Open report in browser
Write-Host ""
$reportHtml = Join-Path $outputDir "report.html"
if (Test-Path $reportHtml) {
    Write-Host "Opening test report..." -ForegroundColor Yellow
    Start-Process $reportHtml
}

# Cleanup
if ($ServerProcess -and -not $SkipServerStart) {
    Write-Host ""
    Write-Host "Stopping development server..." -ForegroundColor Yellow
    Stop-Process -Id $ServerProcess.Id -Force
    Write-Host "Server stopped" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Copy screenshots to easy access location
Write-Host "Copying screenshots to test results..." -ForegroundColor Yellow
$seleniumScreenshots = Join-Path $RobotTestsDir "screenshots"
if (Test-Path $seleniumScreenshots) {
    Copy-Item -Path "$seleniumScreenshots\*" -Destination $ScreenshotsDir -Force -ErrorAction SilentlyContinue
}

Write-Host "All screenshots saved to: $ScreenshotsDir" -ForegroundColor Green
Write-Host ""

exit $testExitCode
