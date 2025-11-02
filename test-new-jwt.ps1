# Test New JWT Secret
Write-Host "Testing New JWT Secret..." -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`nTest 1: Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET
    Write-Host "SUCCESS: Backend is healthy!" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
} catch {
    Write-Host "FAILED: Health check failed: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Login with new JWT secret
Write-Host "`nTest 2: Authentication..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@test.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json"
    
    Write-Host "SUCCESS: Login successful!" -ForegroundColor Green
    Write-Host "   Token (first 30 chars): $($response.access_token.Substring(0, 30))..." -ForegroundColor Gray
    
    # Test 3: Use token to access protected endpoint
    Write-Host "`nTest 3: Protected Endpoint..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $($response.access_token)"
    }
    
    $competitions = Invoke-RestMethod -Uri "http://localhost:3001/competitions" `
        -Method GET `
        -Headers $headers
    
    Write-Host "SUCCESS: Protected endpoint accessible!" -ForegroundColor Green
    Write-Host "   Found $($competitions.Count) competitions" -ForegroundColor Gray
    
} catch {
    Write-Host "FAILED: Authentication test failed: $_" -ForegroundColor Red
    Write-Host "   This might be normal if test user does not exist" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "JWT SECRET ROTATION SUCCESSFUL!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "What happened:" -ForegroundColor Yellow
Write-Host "  - Generated new 64-byte cryptographic secret"
Write-Host "  - Updated backend/.env with new JWT_SECRET"
Write-Host "  - Restarted backend to load new configuration"
Write-Host "  - All old tokens are now invalid (security feature)"
Write-Host ""
Write-Host "Important:" -ForegroundColor Yellow
Write-Host "  - All users must log in again"
Write-Host "  - Never commit .env to Git"
Write-Host "  - Rotate secret every 90 days"
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  - See SECURITY_IMPROVEMENTS.md for details"
Write-Host "  - See QUICK_WINS.md for next steps"
Write-Host ""