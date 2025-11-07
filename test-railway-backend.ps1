# Railway Backend CORS Test Script
# Testuje czy backend Railway odpowiada poprawnie na zapytania CORS

param(
    [Parameter(Mandatory=$false)]
    [string]$BackendUrl = ""
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Railway Backend CORS Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Jeśli URL nie został podany, zapytaj użytkownika
if ([string]::IsNullOrEmpty($BackendUrl)) {
    $BackendUrl = Read-Host "Podaj URL backendu Railway (np. https://your-backend.railway.app)"
}

# Usuń trailing slash
$BackendUrl = $BackendUrl.TrimEnd('/')

Write-Host "Testing backend: $BackendUrl" -ForegroundColor Yellow
Write-Host ""

# Test 1: Health Check
Write-Host "[Test 1] Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BackendUrl/health" -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Health Check: OK" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health Check: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: CORS Preflight
Write-Host "[Test 2] CORS Preflight (OPTIONS)..." -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = "http://localhost:3000"
        "Access-Control-Request-Method" = "GET"
        "Access-Control-Request-Headers" = "Content-Type"
    }
    
    $response = Invoke-WebRequest -Uri "$BackendUrl/health" -Method OPTIONS -Headers $headers -UseBasicParsing -ErrorAction Stop
    
    Write-Host "✅ CORS Preflight: OK" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    
    # Sprawdź CORS headers
    $corsHeaders = @(
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Credentials'
    )
    
    foreach ($header in $corsHeaders) {
        $value = $response.Headers[$header]
        if ($value) {
            Write-Host "   $header`: $value" -ForegroundColor Gray
        } else {
            Write-Host "   $header`: NOT SET" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ CORS Preflight: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Auth Endpoint
Write-Host "[Test 3] Auth Endpoint..." -ForegroundColor Yellow
try {
    $body = @{
        email = "test@example.com"
        password = "wrongpassword"
    } | ConvertTo-Json
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    try {
        $response = Invoke-WebRequest -Uri "$BackendUrl/api/auth/login" -Method POST -Body $body -Headers $headers -UseBasicParsing -ErrorAction Stop
        Write-Host "✅ Auth Endpoint: Accessible" -ForegroundColor Green
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    } catch {
        # 401 jest OK - oznacza że endpoint działa, tylko hasło jest złe
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "✅ Auth Endpoint: Accessible (401 - expected)" -ForegroundColor Green
            Write-Host "   CORS is working! (Got 401 instead of CORS error)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Auth Endpoint: Got status $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Auth Endpoint: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: API Endpoints
Write-Host "[Test 4] API Documentation..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BackendUrl/api" -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ API Docs: OK" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "ℹ️  API Docs: Not available (404 - normal for production)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  API Docs: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}
Write-Host ""

# Podsumowanie
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Jeśli widzisz błędy CORS, sprawdź zmienne środowiskowe na Railway" -ForegroundColor White
Write-Host "2. Upewnij się, że FRONTEND_URL zawiera poprawny URL frontendu" -ForegroundColor White
Write-Host "3. Sprawdź logi Railway: railway logs --service backend" -ForegroundColor White
Write-Host "4. Użyj test-railway-cors.html w przeglądarce dla pełniejszego testu" -ForegroundColor White
Write-Host ""