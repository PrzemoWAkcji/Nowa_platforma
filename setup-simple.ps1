# Prosty setup platformy lekkoatletycznej
Write-Host "Konfiguracja Platformy Lekkoatletycznej..." -ForegroundColor Green

# Sprawdz wymagania
Write-Host "Sprawdzanie wymagań..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js nie jest zainstalowany!" -ForegroundColor Red
    exit 1
}

try {
    $dockerVersion = docker --version
    Write-Host "Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "Docker nie jest zainstalowany!" -ForegroundColor Red
    exit 1
}

# Stworz folder projektu
$projectName = "athletics-platform"
if (Test-Path $projectName) {
    Write-Host "Folder $projectName juz istnieje!" -ForegroundColor Yellow
    $response = Read-Host "Czy chcesz kontynuowac? (y/n)"
    if ($response -ne "y") {
        exit 0
    }
}

New-Item -ItemType Directory -Force -Path $projectName
Set-Location $projectName

Write-Host "Struktura projektu utworzona" -ForegroundColor Green
Write-Host "Teraz wykonaj kolejne kroki manualnie:" -ForegroundColor Cyan
Write-Host "1. cd athletics-platform" -ForegroundColor White
Write-Host "2. Uruchom komendy z QUICK_START.md" -ForegroundColor White