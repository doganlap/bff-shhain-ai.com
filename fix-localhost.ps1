# ========================================
# GRC Master - Localhost Fix Script
# ========================================
# Run this script if you encounter "connection refused" or localhost issues

Write-Host "🔧 GRC Master Localhost Fix Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check which ports are in use
Write-Host "📊 Step 1: Checking current port usage..." -ForegroundColor Yellow
$ports = @(80, 3000, 5173, 5174)
$connections = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | 
    Where-Object { $ports -contains $_.LocalPort } |
    Select-Object LocalAddress, LocalPort, OwningProcess

if ($connections) {
    Write-Host "Found processes listening on dev ports:" -ForegroundColor Green
    $connections | Format-Table -AutoSize
} else {
    Write-Host "No processes found on dev ports (80, 3000, 5173, 5174)" -ForegroundColor Yellow
}

# Step 2: Kill conflicting processes
Write-Host ""
Write-Host "🔄 Step 2: Clearing dev ports..." -ForegroundColor Yellow
foreach($port in $ports) {
    $pid = (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue).OwningProcess
    if ($pid) {
        Write-Host "  Stopping process on port $port (PID: $pid)..." -ForegroundColor Gray
        try {
            taskkill /PID $pid /F 2>$null | Out-Null
            Write-Host "  ✓ Port $port cleared" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ Could not stop process on port $port" -ForegroundColor Red
        }
    }
}

# Step 3: Configure firewall
Write-Host ""
Write-Host "🔥 Step 3: Configuring Windows Firewall..." -ForegroundColor Yellow
try {
    # Check if rules already exist
    $existingRule = Get-NetFirewallRule -DisplayName "GRC-Dev-Ports" -ErrorAction SilentlyContinue
    if ($existingRule) {
        Write-Host "  Removing existing firewall rule..." -ForegroundColor Gray
        Remove-NetFirewallRule -DisplayName "GRC-Dev-Ports"
    }
    
    # Add new rule for all dev ports
    New-NetFirewallRule -DisplayName "GRC-Dev-Ports" `
        -Direction Inbound `
        -Action Allow `
        -Protocol TCP `
        -LocalPort 3000,5173,5174 `
        -ErrorAction Stop | Out-Null
    Write-Host "  ✓ Firewall rules configured" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Could not configure firewall (run as Administrator)" -ForegroundColor Red
}

# Step 4: Configure proxy bypass
Write-Host ""
Write-Host "🌐 Step 4: Configuring proxy bypass..." -ForegroundColor Yellow
try {
    [System.Environment]::SetEnvironmentVariable('NO_PROXY', 'localhost,127.0.0.1,::1', 'User')
    $env:NO_PROXY = 'localhost,127.0.0.1,::1'
    Write-Host "  ✓ NO_PROXY environment variable set" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Could not set NO_PROXY variable" -ForegroundColor Red
}

# Step 5: Verify hosts file
Write-Host ""
Write-Host "📝 Step 5: Checking hosts file..." -ForegroundColor Yellow
$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$hostsContent = Get-Content $hostsPath -ErrorAction SilentlyContinue

$hasIPv4 = $hostsContent | Where-Object { $_ -match '^127\.0\.0\.1\s+localhost' }
$hasIPv6 = $hostsContent | Where-Object { $_ -match '^::1\s+localhost' }

if ($hasIPv4) {
    Write-Host "  ✓ IPv4 localhost entry found" -ForegroundColor Green
} else {
    Write-Host "  ✗ IPv4 localhost entry missing" -ForegroundColor Red
}

if ($hasIPv6) {
    Write-Host "  ✓ IPv6 localhost entry found" -ForegroundColor Green
} else {
    Write-Host "  ✗ IPv6 localhost entry missing" -ForegroundColor Red
}

# Step 6: Start the development server
Write-Host ""
Write-Host "🚀 Step 6: Starting development server..." -ForegroundColor Yellow
$webPath = "d:\Projects\GRC-Master\Assessmant-GRC\apps\web"

if (Test-Path $webPath) {
    Set-Location $webPath
    
    if (Test-Path "package.json") {
        Write-Host "  Starting Vite server on 0.0.0.0:5173..." -ForegroundColor Gray
        
        # Start server in background
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$webPath'; npm run dev" -WindowStyle Normal
        
        Write-Host "  ✓ Server starting..." -ForegroundColor Green
        Write-Host ""
        Write-Host "⏳ Waiting 5 seconds for server to start..." -ForegroundColor Cyan
        Start-Sleep -Seconds 5
        
        # Check if server started
        $serverRunning = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
        if ($serverRunning) {
            Write-Host "  ✓ Server is running on port 5173" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ Server may still be starting..." -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ✗ package.json not found in $webPath" -ForegroundColor Red
    }
} else {
    Write-Host "  ✗ Web directory not found: $webPath" -ForegroundColor Red
}

# Step 7: Test connectivity
Write-Host ""
Write-Host "🧪 Step 7: Testing connectivity..." -ForegroundColor Yellow
Write-Host ""

$testURLs = @(
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://[::1]:5173"
)

foreach ($url in $testURLs) {
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        Write-Host "  ✓ $url - Accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ $url - Not accessible" -ForegroundColor Red
    }
}

# Summary
Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ Fix Script Complete!" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Access your application at:" -ForegroundColor White
Write-Host "   • http://localhost:5173" -ForegroundColor Cyan
Write-Host "   • http://127.0.0.1:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Network URLs:" -ForegroundColor White
Write-Host "   • http://100.120.201.39:5173" -ForegroundColor Gray
Write-Host "   • http://192.168.1.74:5173" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "   • If localhost doesn't work, try 127.0.0.1" -ForegroundColor Gray
Write-Host "   • Make sure Windows Defender isn't blocking the port" -ForegroundColor Gray
Write-Host "   • Check that no VPN or proxy is interfering" -ForegroundColor Gray
Write-Host "   • Run this script as Administrator for full functionality" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
