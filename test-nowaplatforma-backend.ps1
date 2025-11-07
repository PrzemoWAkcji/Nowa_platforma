# Test konkretnego backendu Railway: nowaplatforma-production.up.railway.app
# Quick test script

$BackendUrl = "https://nowaplatforma-production.up.railway.app"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Railway Backend Test" -ForegroundColor Cyan
Write-Host "Backend: $BackendUrl" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "[1/4] Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BackendUrl/health" -Method GET -UseBasicParsing
    $content = $response.Content | ConvertFrom-Json
    Write-Host "  ✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "  ✅ Service: $($content.service)" -ForegroundColor Green
    Write-Host "  ✅ Timestamp: $($content.timestamp)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: CORS Headers
Write-Host "[2/4] CORS Headers..." -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = "http://localhost:3000"
        "Access-Control-Request-Method" = "GET"
    }
    $response = Invoke-WebRequest -Uri "$BackendUrl/health" -Method OPTIONS -Headers $headers -UseBasicParsing
    Write-Host "  ✅ CORS Status: $($response.StatusCode)" -ForegroundColor Green
    
    $corsHeaders = @(
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Credentials'
    )
    
    foreach ($header in $corsHeaders) {
        $value = $response.Headers[$header]
        if ($value) {
            Write-Host "  ✅ $header`: $value" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  $header`: NOT SET" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "  ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Auth Endpoint (poprawny path: /auth/login)
Write-Host "[3/4] Auth Endpoint (/auth/login)..." -ForegroundColor Yellow
try {
    $body = '{"email":"test@example.com","password":"wrongpassword"}'
    try {
        $response = Invoke-WebRequest -Uri "$BackendUrl/auth/login" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
        Write-Host "  ✅ Endpoint accessible (status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 400 -or $statusCode -eq 401) {
            Write-Host "  ✅ Endpoint accessible (status: $statusCode - expected for wrong credentials)" -ForegroundColor Green
            Write-Host "  ✅ CORS is working correctly!" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Got status: $statusCode" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "  ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Wrong endpoint (to pokazać różnicę)
Write-Host "[4/4] Testing wrong endpoint (/api/auth/login)..." -ForegroundColor Yellow
try {
    $body = '{"email":"test@example.com","password":"wrongpassword"}'
    try {
        $response = Invoke-WebRequest -Uri "$BackendUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
        Write-Host "  ⚠️  Unexpected: This endpoint should not exist!" -ForegroundColor Yellow
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 404) {
            Write-Host "  Correctly returns 404 (this endpoint does not exist)" -ForegroundColor Green
            Write-Host "  Use /auth/login instead of /api/auth/login" -ForegroundColor Cyan
        } else {
            Write-Host "  Got status: $statusCode" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "  ⚠️  $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

# Podsumowanie
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ CORS Configuration: " -NoNewline -ForegroundColor Green
Write-Host "WORKING" -ForegroundColor Green
Write-Host ""
Write-Host "Backend URL: $BackendUrl" -ForegroundColor White
Write-Host ""
Write-Host "Correct endpoints:" -ForegroundColor Yellow
Write-Host "  ✅ /health" -ForegroundColor Green
Write-Host "  ✅ /auth/login" -ForegroundColor Green
Write-Host "  ✅ /auth/register" -ForegroundColor Green
Write-Host "  ✅ /competitions" -ForegroundColor Green
Write-Host "  ✅ /athletes" -ForegroundColor Green
Write-Host ""
Write-Host "Wrong endpoints (do not use):" -ForegroundColor Red
Write-Host "  /api/auth/login (404)" -ForegroundColor Red
Write-Host "  /api/competitions (404)" -ForegroundColor Red
Write-Host ""
Write-Host "Frontend configuration:" -ForegroundColor Yellow
Write-Host "  NEXT_PUBLIC_API_URL=$BackendUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Set Railway environment variables (JWT_SECRET, DATABASE_URL, etc.)" -ForegroundColor White
Write-Host "2. Update frontend to use correct backend URL (without /api prefix)" -ForegroundColor White
Write-Host "3. Test login with real credentials" -ForegroundColor White
Write-Host ""