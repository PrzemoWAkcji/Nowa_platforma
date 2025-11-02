# Sprawdzanie gotowosci do deployment

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   SPRAWDZANIE GOTOWOSCI DO DEPLOYMENT" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Sprawdz pliki
Write-Host "SPRAWDZANIE PLIKOW:" -ForegroundColor Yellow
Write-Host ""

$files = @(
    "athletics-platform\backend\vercel.json",
    "athletics-platform\backend\api\index.ts",
    "athletics-platform\backend\.env.production",
    "athletics-platform\frontend\.env.production",
    "DEPLOYMENT_OPTIONS_SUMMARY.md",
    "QUICK_DEPLOY_VERCEL.md",
    "RAILWAY_DEPLOYMENT.md"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  OK: $file" -ForegroundColor Green
    } else {
        Write-Host "  BRAK: $file" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""

# Sprawdz Git
Write-Host "SPRAWDZANIE GIT:" -ForegroundColor Yellow
Write-Host ""

$gitInstalled = Get-Command git -ErrorAction SilentlyContinue
if ($gitInstalled) {
    Write-Host "  OK: Git zainstalowany" -ForegroundColor Green
} else {
    Write-Host "  BRAK: Git nie zainstalowany" -ForegroundColor Red
    $allGood = $false
}

if (Test-Path ".git") {
    Write-Host "  OK: Git repository" -ForegroundColor Green
} else {
    Write-Host "  INFO: Git repo nie zainicjalizowane (uruchom: git init)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if ($allGood) {
    Write-Host "PROJEKT GOTOWY DO DEPLOYMENT!" -ForegroundColor Green
    Write-Host ""
    Write-Host "NASTEPNE KROKI:" -ForegroundColor Yellow
    Write-Host "1. Przeczytaj: Get-Content .\DEPLOYMENT_OPTIONS_SUMMARY.md" -ForegroundColor Gray
    Write-Host "2. Vercel: Get-Content .\QUICK_DEPLOY_VERCEL.md" -ForegroundColor Gray
    Write-Host "3. Railway: Get-Content .\RAILWAY_DEPLOYMENT.md" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "PROJEKT NIE JEST GOTOWY!" -ForegroundColor Red
    Write-Host "Popraw bledy powyzej." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""