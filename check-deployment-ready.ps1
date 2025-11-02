# 🔍 Sprawdzanie gotowości do deployment
# Ten skrypt weryfikuje czy projekt jest gotowy do wrzucenia online

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   SPRAWDZANIE GOTOWOSCI DO DEPLOYMENT" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true
$warnings = @()
$errors = @()

# Funkcja sprawdzająca plik
function Test-DeploymentFile {
    param(
        [string]$Path,
        [string]$Description
    )
    
    if (Test-Path $Path) {
        Write-Host "  ✅ $Description" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ❌ BRAK: $Description" -ForegroundColor Red
        Write-Host "     Ścieżka: $Path" -ForegroundColor Gray
        return $false
    }
}

# Sprawdź strukturę projektu
Write-Host "STRUKTURA PROJEKTU:" -ForegroundColor Yellow
Write-Host ""

$projectFiles = @{
    "athletics-platform\backend\package.json" = "Backend package.json"
    "athletics-platform\frontend\package.json" = "Frontend package.json"
    "athletics-platform\backend\src\main.ts" = "Backend main.ts"
    "athletics-platform\frontend\src\app\page.tsx" = "Frontend page.tsx"
}

foreach ($file in $projectFiles.GetEnumerator()) {
    if (-not (Test-DeploymentFile -Path $file.Key -Description $file.Value)) {
        $errors += "Brak pliku: $($file.Value)"
        $allGood = $false
    }
}

Write-Host ""

# Sprawdź pliki konfiguracyjne deployment
Write-Host "PLIKI KONFIGURACYJNE DEPLOYMENT:" -ForegroundColor Yellow
Write-Host ""

$deployFiles = @{
    "athletics-platform\backend\vercel.json" = "Backend Vercel config"
    "athletics-platform\backend\api\index.ts" = "Backend Serverless entry"
    "athletics-platform\backend\.env.production" = "Backend env template"
    "athletics-platform\frontend\.env.production" = "Frontend env template"
}

foreach ($file in $deployFiles.GetEnumerator()) {
    if (-not (Test-DeploymentFile -Path $file.Key -Description $file.Value)) {
        $errors += "Brak pliku deployment: $($file.Value)"
        $allGood = $false
    }
}

Write-Host ""

# Sprawdź pliki dokumentacji
Write-Host "DOKUMENTACJA DEPLOYMENT:" -ForegroundColor Yellow
Write-Host ""

$docFiles = @{
    "DEPLOYMENT_OPTIONS_SUMMARY.md" = "Podsumowanie opcji"
    "QUICK_DEPLOY_VERCEL.md" = "Quick start Vercel"
    "RAILWAY_DEPLOYMENT.md" = "Railway guide"
    "DEPLOYMENT_ONLINE_GUIDE.md" = "Kompletny przewodnik"
    "README_DEPLOYMENT.md" = "README deployment"
}

foreach ($file in $docFiles.GetEnumerator()) {
    if (-not (Test-DeploymentFile -Path $file.Key -Description $file.Value)) {
        $warnings += "Brak dokumentacji: $($file.Value)"
    }
}

Write-Host ""

# Sprawdź Git
Write-Host "GIT I DEPENDENCIES:" -ForegroundColor Yellow
Write-Host ""

$gitInstalled = Get-Command git -ErrorAction SilentlyContinue
if ($gitInstalled) {
    Write-Host "  ✅ Git zainstalowany" -ForegroundColor Green
} else {
    Write-Host "  ❌ Git NIE zainstalowany!" -ForegroundColor Red
    $errors += "Git nie jest zainstalowany - pobierz z https://git-scm.com/"
    $allGood = $false
}

if (Test-Path ".git") {
    Write-Host "  ✅ Git repository zainicjalizowane" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Git repository NIE zainicjalizowane" -ForegroundColor Yellow
    $warnings += "Uruchom: git init"
}

# Sprawdź node_modules
Write-Host ""
if (Test-Path "athletics-platform\backend\node_modules") {
    Write-Host "  ✅ Backend dependencies zainstalowane" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Backend dependencies NIE zainstalowane" -ForegroundColor Yellow
    $warnings += "Uruchom w backend: npm install"
}

if (Test-Path "athletics-platform\frontend\node_modules") {
    Write-Host "  ✅ Frontend dependencies zainstalowane" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Frontend dependencies NIE zainstalowane" -ForegroundColor Yellow
    $warnings += "Uruchom w frontend: npm install"
}

Write-Host ""

# PODSUMOWANIE
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "                   PODSUMOWANIE" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if ($allGood -and $errors.Count -eq 0) {
    Write-Host "PROJEKT GOTOWY DO DEPLOYMENT!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Wszystkie wymagane pliki są na miejscu!" -ForegroundColor Green
    Write-Host ""
    
    if ($warnings.Count -gt 0) {
        Write-Host "Ostrzezenia ($($warnings.Count)):" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "   • $warning" -ForegroundColor Yellow
        }
        Write-Host ""
        Write-Host "Możesz kontynuować deployment, ale rozważ poprawienie ostrzeżeń." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "           NASTEPNE KROKI:" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Przeczytaj porownanie opcji:" -ForegroundColor White
    Write-Host "   Get-Content .\DEPLOYMENT_OPTIONS_SUMMARY.md" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Dla najszybszego deployment (Vercel):" -ForegroundColor White
    Write-Host "   Get-Content .\QUICK_DEPLOY_VERCEL.md" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Dla produkcji (Railway + PostgreSQL):" -ForegroundColor White
    Write-Host "   Get-Content .\RAILWAY_DEPLOYMENT.md" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Przygotuj Git:" -ForegroundColor White
    Write-Host "   .\prepare-deployment.ps1" -ForegroundColor Gray
    Write-Host ""
    
} else {
    Write-Host "PROJEKT NIE JEST GOTOWY DO DEPLOYMENT!" -ForegroundColor Red
    Write-Host ""
    
    if ($errors.Count -gt 0) {
        Write-Host "Krytyczne bledy ($($errors.Count)):" -ForegroundColor Red
        foreach ($error in $errors) {
            Write-Host "   • $error" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "Ostrzezenia ($($warnings.Count)):" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "   • $warning" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    Write-Host "Popraw bledy i uruchom ponownie ten skrypt." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Exit code
if ($allGood) {
    exit 0
} else {
    exit 1
}