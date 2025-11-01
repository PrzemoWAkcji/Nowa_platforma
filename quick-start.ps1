# Quick Start Script for Import Testing
# Set console encoding to UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🚀 Quick Start - Import List Startowych" -ForegroundColor Green
Write-Host ""

# Kill all node processes
Write-Host "🛑 Zatrzymywanie procesów Node..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# Start backend
Write-Host "🔧 Uruchamianie backendu (port 3002)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd 'c:/nowa platforma/athletics-platform/backend'; npm run start:dev" -WindowStyle Minimized
Start-Sleep -Seconds 15

# Test backend
Write-Host "🔍 Testowanie backendu..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri "http://localhost:3002" -Method GET -TimeoutSec 5 -ErrorAction Stop | Out-Null
    Write-Host "✅ Backend działa (port 3002)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend nie odpowiada" -ForegroundColor Red
    Write-Host "Sprawdź logi w oknie backendu" -ForegroundColor Yellow
}

# Start frontend
Write-Host "🎨 Uruchamianie frontendu (port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd 'c:/nowa platforma/athletics-platform/frontend'; npm run dev -- --port 3001" -WindowStyle Minimized
Start-Sleep -Seconds 10

# Test frontend
Write-Host "🔍 Testowanie frontendu..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -TimeoutSec 5 -ErrorAction Stop | Out-Null
    Write-Host "✅ Frontend działa (port 3001)" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend nie odpowiada" -ForegroundColor Red
}

Write-Host ""
Write-Host "🌐 Linki do testowania:" -ForegroundColor Cyan
Write-Host "   • Quick Login: http://localhost:3001/quick-login" -ForegroundColor White
Write-Host "   • Główna strona: http://localhost:3001" -ForegroundColor White
Write-Host ""

Write-Host "📋 Kroki testowania:" -ForegroundColor Yellow
Write-Host "1. Otwórz http://localhost:3001/quick-login" -ForegroundColor White
Write-Host "2. Kliknij 'Test Backend Connection' aby sprawdzić połączenie" -ForegroundColor White
Write-Host "3. Zaloguj się (admin@athletics.pl / password123)" -ForegroundColor White
Write-Host "4. Przejdź do Zawody → Szczegóły → Import listy startowej" -ForegroundColor White
Write-Host "5. Przeciągnij plik test-pzla.csv" -ForegroundColor White
Write-Host ""

Write-Host "📁 Pliki testowe:" -ForegroundColor Cyan
Write-Host "   • test-pzla.csv - Format PZLA" -ForegroundColor White
Write-Host "   • test-roster.csv - Format Roster Athletics" -ForegroundColor White
Write-Host ""

# Open browser
$openBrowser = Read-Host "Czy otworzyć przeglądarkę? (y/n)"
if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    Start-Process "http://localhost:3001/quick-login"
}

Write-Host ""
Write-Host "🎯 Gotowe do testowania importu!" -ForegroundColor Green
Write-Host "Naciśnij Enter aby zakończyć..." -ForegroundColor Gray
Read-Host