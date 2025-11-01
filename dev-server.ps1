# Zaawansowany skrypt developmentu z hot-reload i monitorowaniem
param(
    [switch]$Fresh,
    [switch]$Logs,
    [string]$Port = "3000"
)

$ErrorActionPreference = "Stop"

Write-Host @"
╔══════════════════════════════════════════════════════════════╗
║                🏃‍♂️ Athletics Platform Dev Server              ║
║                     Unified Development Environment          ║
╚══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Fresh start - czyszczenie cache'ów
if ($Fresh) {
    Write-Host "🧹 Czyszczenie cache'ów..." -ForegroundColor Yellow
    
    # Next.js cache
    if (Test-Path "athletics-platform/frontend/.next") {
        Remove-Item "athletics-platform/frontend/.next" -Recurse -Force
        Write-Host "   ✅ Next.js cache wyczyszczony" -ForegroundColor Green
    }
    
    # Node modules reinstall
    Write-Host "📦 Reinstalacja zależności..." -ForegroundColor Yellow
    Set-Location "athletics-platform/backend"
    Remove-Item "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    npm install --silent
    
    Set-Location "../frontend"
    Remove-Item "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    npm install --silent
    
    Set-Location "../.."
    Write-Host "   ✅ Zależności zainstalowane" -ForegroundColor Green
}

# Sprawdzanie środowiska
Write-Host "🔍 Sprawdzanie środowiska..." -ForegroundColor Yellow

# Sprawdzenie czy istnieją pliki konfiguracyjne
$backendEnv = "athletics-platform/backend/.env"
if (-not (Test-Path $backendEnv)) {
    Write-Host "⚠️ Brak pliku .env w backend!" -ForegroundColor Red
    Write-Host "   Kopiowanie z .env.example..." -ForegroundColor Yellow
    Copy-Item "athletics-platform/backend/.env.example" $backendEnv
}

# Sprawdzenie bazy danych
$dbPath = "athletics-platform/backend/prisma/dev.db"
if (-not (Test-Path $dbPath)) {
    Write-Host "🗄️ Inicjalizacja bazy danych..." -ForegroundColor Yellow
    Set-Location "athletics-platform/backend"
    npx prisma migrate dev --name init --skip-generate
    npx prisma generate
    Set-Location "../.."
    Write-Host "   ✅ Baza danych gotowa" -ForegroundColor Green
}

# Funkcja do kolorowego logowania
function Write-ColorLog {
    param(
        [string]$Message,
        [string]$Source,
        [string]$Color = "White"
    )
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] [$Source] $Message" -ForegroundColor $Color
}

# Uruchamianie w tle z przekierowaniem logów
Write-Host "🚀 Uruchamianie serwerów..." -ForegroundColor Cyan

# Backend job z logowaniem
$backendScript = {
    param($LogsEnabled)
    Set-Location "c:/nowa platforma/athletics-platform/backend"
    
    if ($LogsEnabled) {
        npm run start:dev 2>&1 | ForEach-Object {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] [BACKEND] $_" -ForegroundColor Blue
        }
    } else {
        npm run start:dev > $null 2>&1
    }
}

$backendJob = Start-Job -ScriptBlock $backendScript -ArgumentList $Logs

# Frontend job z logowaniem
$frontendScript = {
    param($Port, $LogsEnabled)
    Set-Location "c:/nowa platforma/athletics-platform/frontend"
    $env:PORT = $Port
    
    if ($LogsEnabled) {
        npm run dev 2>&1 | ForEach-Object {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] [FRONTEND] $_" -ForegroundColor Green
        }
    } else {
        npm run dev > $null 2>&1
    }
}

$frontendJob = Start-Job -ScriptBlock $frontendScript -ArgumentList $Port, $Logs

# Czekanie na uruchomienie
Write-Host "⏳ Czekanie na uruchomienie serwerów..." -ForegroundColor Yellow

$maxWait = 30
$waited = 0
$backendReady = $false
$frontendReady = $false

while ($waited -lt $maxWait -and (-not $backendReady -or -not $frontendReady)) {
    Start-Sleep -Seconds 1
    $waited++
    
    # Sprawdzanie backendu
    if (-not $backendReady) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3002" -TimeoutSec 1 -ErrorAction SilentlyContinue
            $backendReady = $true
            Write-ColorLog "Backend gotowy!" "SYSTEM" "Blue"
        } catch {}
    }
    
    # Sprawdzanie frontendu
    if (-not $frontendReady) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$Port" -TimeoutSec 1 -ErrorAction SilentlyContinue
            $frontendReady = $true
            Write-ColorLog "Frontend gotowy!" "SYSTEM" "Green"
        } catch {}
    }
    
    # Progress bar
    $progress = [math]::Round(($waited / $maxWait) * 100)
    Write-Progress -Activity "Uruchamianie serwerów" -Status "$waited/$maxWait sekund" -PercentComplete $progress
}

Write-Progress -Activity "Uruchamianie serwerów" -Completed

if ($backendReady -and $frontendReady) {
    Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║                        🎉 GOTOWE!                            ║
║                                                              ║
║  📱 Frontend:  http://localhost:$Port                        ║
║  🔧 Backend:   http://localhost:3002                         ║
║  📊 API Docs:  http://localhost:3002/api                     ║
║                                                              ║
║  💡 Naciśnij Ctrl+C aby zatrzymać                           ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan
} else {
    Write-Host "⚠️ Nie wszystkie serwery uruchomiły się poprawnie!" -ForegroundColor Red
    if (-not $backendReady) { Write-Host "   ❌ Backend nie odpowiada" -ForegroundColor Red }
    if (-not $frontendReady) { Write-Host "   ❌ Frontend nie odpowiada" -ForegroundColor Red }
}

# Monitorowanie i obsługa logów
try {
    while ($true) {
        # Sprawdzanie statusu jobów
        if ($backendJob.State -eq "Failed") {
            Write-ColorLog "Backend crashed!" "ERROR" "Red"
            Receive-Job $backendJob
            break
        }
        
        if ($frontendJob.State -eq "Failed") {
            Write-ColorLog "Frontend crashed!" "ERROR" "Red"
            Receive-Job $frontendJob
            break
        }
        
        # Wyświetlanie logów jeśli włączone
        if ($Logs) {
            Receive-Job $backendJob -Keep | ForEach-Object { 
                Write-ColorLog $_ "BACKEND" "Blue" 
            }
            Receive-Job $frontendJob -Keep | ForEach-Object { 
                Write-ColorLog $_ "FRONTEND" "Green" 
            }
        }
        
        Start-Sleep -Seconds 1
    }
}
catch {
    Write-Host "`n🛑 Otrzymano sygnał zatrzymania..." -ForegroundColor Yellow
}
finally {
    Write-Host "🧹 Czyszczenie..." -ForegroundColor Yellow
    
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    
    Remove-Job $backendJob -Force -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -Force -ErrorAction SilentlyContinue
    
    Write-Host "✅ Serwery zatrzymane!" -ForegroundColor Green
}