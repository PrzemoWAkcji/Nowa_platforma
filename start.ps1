# Athletics Platform - Professional Startup Script
# One command to rule them all

Clear-Host

Write-Host @"
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║    🏃‍♂️ ATHLETICS PLATFORM                                                      ║
║    Professional Competition Management System                               ║
║                                                                              ║
║    🚀 Starting unified development environment...                           ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

Write-Host ""
Write-Host "⚡ Initializing..." -ForegroundColor Yellow

# Quick environment check
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js >= 18.0.0" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting development servers..." -ForegroundColor Cyan
Write-Host ""

# Start the development environment
npm run dev

Write-Host "[2/3] Czekanie 3 sekundy..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "[3/3] Uruchamianie Frontend (port 3000)..." -ForegroundColor Yellow
Set-Location "..\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Aplikacja się uruchamia..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Konta testowe:" -ForegroundColor Magenta
Write-Host "- Admin:      admin@athletics.pl / password123" -ForegroundColor White
Write-Host "- Organizator: organizer@athletics.pl / password123" -ForegroundColor White
Write-Host "- Trener:     coach@athletics.pl / password123" -ForegroundColor White  
Write-Host "- Zawodnik:   athlete@athletics.pl / password123" -ForegroundColor White
Write-Host ""
Write-Host "Czekanie 5 sekund przed otwarciem przeglądarki..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Otwieranie przeglądarki..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Gotowe! Miłego korzystania! 🏃‍♂️🏃‍♀️" -ForegroundColor Green
Write-Host ""
Write-Host "Naciśnij Enter aby zakończyć..." -ForegroundColor Gray
Read-Host