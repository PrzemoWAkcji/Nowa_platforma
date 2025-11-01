# Quick Test Script for Import Functionality
# Run this script to quickly test the import feature

Write-Host "🚀 Quick Test - Import List Startowych" -ForegroundColor Green
Write-Host ""

# Check if applications are running
Write-Host "📋 Sprawdzanie aplikacji..." -ForegroundColor Yellow

$backendRunning = $false
$frontendRunning = $false

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 3 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend działa (port 3000)" -ForegroundColor Green
        $backendRunning = $true
    }
} catch {
    Write-Host "❌ Backend nie działa (port 3000)" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -TimeoutSec 3 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend działa (port 3001)" -ForegroundColor Green
        $frontendRunning = $true
    }
} catch {
    Write-Host "❌ Frontend nie działa (port 3001)" -ForegroundColor Red
}

Write-Host ""

if (-not $backendRunning -or -not $frontendRunning) {
    Write-Host "🔧 Uruchamianie aplikacji..." -ForegroundColor Yellow
    
    if (-not $backendRunning) {
        Write-Host "Uruchamianie backendu..."
        Start-Process powershell -ArgumentList "-Command", "cd 'c:/nowa platforma/athletics-platform/backend'; npm run start:dev"
        Start-Sleep -Seconds 5
    }
    
    if (-not $frontendRunning) {
        Write-Host "Uruchamianie frontendu..."
        Start-Process powershell -ArgumentList "-Command", "cd 'c:/nowa platforma/athletics-platform/frontend'; npm run dev"
        Start-Sleep -Seconds 5
    }
    
    Write-Host "Czekanie na uruchomienie aplikacji..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

Write-Host ""
Write-Host "📁 Pliki testowe:" -ForegroundColor Cyan
Write-Host "   • test-pzla.csv - Format PZLA (starter.pzla.pl)"
Write-Host "   • test-roster.csv - Format Roster Athletics"
Write-Host ""

Write-Host "🌐 Linki:" -ForegroundColor Cyan
Write-Host "   • Frontend: http://localhost:3001"
Write-Host "   • Backend API: http://localhost:3000"
Write-Host ""

Write-Host "📋 Kroki testowania:" -ForegroundColor Yellow
Write-Host "1. Otwórz http://localhost:3001 w przeglądarce"
Write-Host "2. Przejdź do sekcji Zawody (Competitions)"
Write-Host "3. Utwórz nowe zawody lub wybierz istniejące"
Write-Host "4. W szczegółach zawodów znajdź przycisk 'Importuj listę startową'"
Write-Host "5. Przeciągnij plik test-pzla.csv lub test-roster.csv"
Write-Host "6. Sprawdź podgląd danych i kliknij 'Importuj'"
Write-Host "7. Sprawdź wyniki importu"
Write-Host ""

Write-Host "📚 Dokumentacja:" -ForegroundColor Cyan
Write-Host "   • TEST_IMPORT_INSTRUCTIONS.md - Szczegółowa instrukcja"
Write-Host "   • IMPORT_STARTLIST_DOCUMENTATION.md - Dokumentacja użytkownika"
Write-Host "   • IMPORT_IMPLEMENTATION_SUMMARY.md - Podsumowanie techniczne"
Write-Host ""

Write-Host "🎯 Funkcjonalność gotowa do testowania!" -ForegroundColor Green
Write-Host ""

# Open browser automatically
$openBrowser = Read-Host "Czy otworzyć przeglądarkę automatycznie? (y/n)"
if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    Start-Process "http://localhost:3001"
}

Write-Host "Happy testing! 🚀" -ForegroundColor Green