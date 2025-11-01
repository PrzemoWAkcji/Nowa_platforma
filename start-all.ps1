# Professional Athletics Platform Development Environment
# Version: 1.0.0
# Author: Athletics Platform Team

param(
    [switch]$Production,
    [switch]$Setup,
    [switch]$Fresh,
    [switch]$Quiet,
    [string]$LogLevel = "info"
)

$ErrorActionPreference = "Stop"

# Professional banner
Write-Host @"
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║    🏃‍♂️ ATHLETICS PLATFORM - Professional Development Environment              ║
║                                                                              ║
║    🔧 Backend API (NestJS + Prisma)     🎨 Frontend Web (Next.js + React)   ║
║    📊 Database Management               🚀 Unified Development Server        ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Funkcja do sprawdzania czy port jest zajęty
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Setup - instalacja zależności
if ($Setup) {
    Write-Host "📦 Instalowanie zależności..." -ForegroundColor Yellow
    
    # Root dependencies
    npm install
    
    # Backend dependencies
    Write-Host "📦 Backend dependencies..." -ForegroundColor Yellow
    Set-Location "athletics-platform/backend"
    npm install
    
    # Database setup
    Write-Host "🗄️ Konfiguracja bazy danych..." -ForegroundColor Yellow
    npx prisma migrate dev --name init
    npx prisma generate
    
    # Frontend dependencies
    Write-Host "📦 Frontend dependencies..." -ForegroundColor Yellow
    Set-Location "../frontend"
    npm install
    
    Set-Location "../.."
    Write-Host "✅ Setup zakończony!" -ForegroundColor Green
    return
}

# Sprawdzanie portów
if (Test-Port 3002) {
    Write-Host "⚠️ Port 3002 (backend) jest już zajęty!" -ForegroundColor Red
    $continue = Read-Host "Czy chcesz kontynuować? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

if (Test-Port 3000) {
    Write-Host "⚠️ Port 3000 (frontend) jest już zajęty!" -ForegroundColor Red
    $continue = Read-Host "Czy chcesz kontynuować? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

# Uruchamianie serwerów
Write-Host "🔧 Uruchamianie Backend (NestJS)..." -ForegroundColor Blue
$backendJob = Start-Job -ScriptBlock {
    Set-Location "c:/nowa platforma/athletics-platform/backend"
    if ($using:Production) {
        npm run start:prod
    } else {
        npm run start:dev
    }
}

# Czekamy chwilę na uruchomienie backendu
Start-Sleep -Seconds 3

Write-Host "🎨 Uruchamianie Frontend (Next.js)..." -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "c:/nowa platforma/athletics-platform/frontend"
    if ($using:Production) {
        npm run start
    } else {
        npm run dev
    }
}

Write-Host ""
Write-Host "🎉 Oba serwery zostały uruchomione!" -ForegroundColor Cyan
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "🔧 Backend:  http://localhost:3002" -ForegroundColor Blue
Write-Host ""
Write-Host "Naciśnij Ctrl+C aby zatrzymać oba serwery" -ForegroundColor Yellow

# Monitorowanie jobów
try {
    while ($true) {
        # Sprawdzamy czy joby nadal działają
        if ($backendJob.State -eq "Failed" -or $backendJob.State -eq "Completed") {
            Write-Host "❌ Backend zatrzymany!" -ForegroundColor Red
            break
        }
        
        if ($frontendJob.State -eq "Failed" -or $frontendJob.State -eq "Completed") {
            Write-Host "❌ Frontend zatrzymany!" -ForegroundColor Red
            break
        }
        
        Start-Sleep -Seconds 2
    }
}
finally {
    # Cleanup - zatrzymywanie jobów
    Write-Host ""
    Write-Host "🛑 Zatrzymywanie serwerów..." -ForegroundColor Yellow
    
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    
    Write-Host "✅ Serwery zatrzymane!" -ForegroundColor Green
}