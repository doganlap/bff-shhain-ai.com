# Start both Landing Page and Main App servers
# Landing Page: http://localhost:4000
# Main App: http://localhost:5173

Write-Host "Starting Shahin GRC Platform - Dual Server Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Start Main App (Port 5173) in new window
Write-Host "Starting Main App on port 5173..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev"

# Wait 3 seconds
Start-Sleep -Seconds 3

# Start Landing Page (Port 4000) in new window  
Write-Host "Starting Landing Page on port 4000..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\www.shahin.com\landing-page'; npm run dev"

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Landing Page: http://localhost:4000" -ForegroundColor Cyan
Write-Host "Main App:     http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Partner Login will redirect from Landing Page to Main App" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press any key to exit this launcher..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
