# Prosty test API
Write-Host "Testowanie API..." -ForegroundColor Green

# Test podstawowy endpoint
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001" -Method GET -TimeoutSec 5
    Write-Host "Backend odpowiada: $response" -ForegroundColor Green
} catch {
    Write-Host "Błąd połączenia: $($_.Exception.Message)" -ForegroundColor Red
}

# Test rejestracji
$registerData = @{
    email = "test@example.com"
    password = "password123"
    firstName = "Jan"
    lastName = "Kowalski"
    role = "ATHLETE"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3001/auth/register" -Method POST -Body $registerData -ContentType "application/json" -TimeoutSec 10
    Write-Host "Rejestracja udana!" -ForegroundColor Green
    Write-Host "Użytkownik: $($registerResponse.user.firstName) $($registerResponse.user.lastName)" -ForegroundColor Cyan
} catch {
    Write-Host "Błąd rejestracji: $($_.Exception.Message)" -ForegroundColor Red
}