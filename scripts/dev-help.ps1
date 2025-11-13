# GRC Ecosystem Development Scripts
# Run from the root of the project

Write-Host "🚀 GRC Ecosystem Development Options" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

Write-Host "Available Commands:" -ForegroundColor Yellow
Write-Host "  1. npm run start:bff         - Run BFF on port 3006" -ForegroundColor Cyan
Write-Host "  2. npm run start:grc-api     - Run GRC API on port 3000" -ForegroundColor Cyan
Write-Host "  3. npm run docker:status     - Check Docker ecosystem status" -ForegroundColor Cyan
Write-Host "  4. npm run docker:up         - Start Docker ecosystem" -ForegroundColor Cyan
Write-Host "  5. npm run docker:down       - Stop Docker ecosystem" -ForegroundColor Cyan
Write-Host ""

Write-Host "VS Code Options:" -ForegroundColor Yellow
Write-Host "  • Press Ctrl+Shift+D to open Run and Debug panel" -ForegroundColor Cyan
Write-Host "  • Select 'Run BFF (Development)' from dropdown" -ForegroundColor Cyan
Write-Host "  • Or use F5 to start debugging" -ForegroundColor Cyan
Write-Host ""

Write-Host "Current Docker Status:" -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Select-String "docker-"

Write-Host ""
Write-Host "🌐 Access URLs:" -ForegroundColor Green
Write-Host "  Web Frontend:  http://localhost:5174" -ForegroundColor White
Write-Host "  BFF Gateway:   http://localhost:3005 (Docker) or 3006 (Local)" -ForegroundColor White
Write-Host "  GRC API:       http://localhost:3000" -ForegroundColor White
