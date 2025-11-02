# 🚀 Skrypt przygotowania do deployment
# Ten skrypt przygotowuje projekt do wrzucenia na Vercel/Railway/Render

Write-Host "🚀 Przygotowanie projektu do deployment..." -ForegroundColor Cyan
Write-Host ""

# Sprawdź czy jesteśmy w głównym katalogu
if (-not (Test-Path ".\athletics-platform\backend") -or -not (Test-Path ".\athletics-platform\frontend")) {
    Write-Host "❌ Błąd: Uruchom ten skrypt z głównego katalogu projektu!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Struktura projektu OK" -ForegroundColor Green
Write-Host ""

# Sprawdź czy git jest zainstalowany
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitInstalled) {
    Write-Host "❌ Git nie jest zainstalowany! Zainstaluj Git z: https://git-scm.com/" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Git zainstalowany" -ForegroundColor Green
Write-Host ""

# Sprawdź czy jest git repo
if (-not (Test-Path ".\.git")) {
    Write-Host "📦 Inicjalizacja Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git repo zainicjalizowane" -ForegroundColor Green
} else {
    Write-Host "✅ Git repo już istnieje" -ForegroundColor Green
}
Write-Host ""

# Sprawdź czy są pliki konfiguracyjne deployment
Write-Host "📋 Sprawdzam pliki konfiguracyjne..." -ForegroundColor Yellow

$files = @(
    ".\athletics-platform\backend\vercel.json",
    ".\athletics-platform\backend\api\index.ts",
    ".\athletics-platform\backend\.env.production",
    ".\athletics-platform\frontend\.env.production"
)

$allFilesExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ BRAK: $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "❌ Brakuje niektórych plików konfiguracyjnych!" -ForegroundColor Red
    Write-Host "   Uruchom ponownie Zencoder aby je utworzyć." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Wszystkie pliki konfiguracyjne są gotowe!" -ForegroundColor Green
Write-Host ""

# Sprawdź status git
Write-Host "📊 Status Git:" -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🎉 PROJEKT GOTOWY DO DEPLOYMENT!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 NASTĘPNE KROKI:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Stwórz repo na GitHub:" -ForegroundColor White
Write-Host "    https://github.com/new" -ForegroundColor Gray
Write-Host ""

Write-Host "2️⃣  Dodaj pliki do Git i wypchnij:" -ForegroundColor White
Write-Host "    git add ." -ForegroundColor Gray
Write-Host "    git commit -m 'Ready for deployment'" -ForegroundColor Gray
Write-Host "    git remote add origin https://github.com/TWOJA_NAZWA/athletics-platform.git" -ForegroundColor Gray
Write-Host "    git branch -M main" -ForegroundColor Gray
Write-Host "    git push -u origin main" -ForegroundColor Gray
Write-Host ""

Write-Host "3️⃣  Deploy na Vercel:" -ForegroundColor White
Write-Host "    https://vercel.com/new" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 Szczegółowa instrukcja:" -ForegroundColor White
Write-Host "    Przeczytaj: QUICK_DEPLOY_VERCEL.md" -ForegroundColor Gray
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Zapytaj czy kontynuować z git push
Write-Host "❓ Czy chcesz teraz dodać pliki do git? (y/n): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -eq "y" -or $response -eq "Y" -or $response -eq "yes") {
    Write-Host ""
    Write-Host "📦 Dodawanie plików do Git..." -ForegroundColor Yellow
    
    git add .
    
    Write-Host ""
    Write-Host "📝 Podaj wiadomość commit (Enter dla domyślnej): " -ForegroundColor Yellow -NoNewline
    $commitMsg = Read-Host
    
    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        $commitMsg = "Ready for deployment - Added Vercel configuration"
    }
    
    git commit -m $commitMsg
    
    Write-Host ""
    Write-Host "✅ Pliki dodane do Git!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Teraz dodaj remote i wypchnij:" -ForegroundColor Yellow
    Write-Host "    git remote add origin https://github.com/TWOJA_NAZWA/athletics-platform.git" -ForegroundColor Gray
    Write-Host "    git push -u origin main" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "👍 OK, możesz to zrobić później." -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 GOTOWE! Powodzenia z deploymentem!" -ForegroundColor Green
Write-Host ""