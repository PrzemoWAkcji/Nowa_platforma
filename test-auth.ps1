# Test Authentication API

Write-Host "🧪 Testowanie API Authentication" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

$baseUrl = "http://localhost:3001"

# Test 1: Rejestracja nowego użytkownika (Zawodnik)
Write-Host "`n1. Testowanie rejestracji zawodnika..." -ForegroundColor Yellow

$registerData = @{
    email = "zawodnik@test.pl"
    password = "haslo123"
    firstName = "Jan"
    lastName = "Kowalski"
    phone = "123456789"
    role = "ATHLETE"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "✅ Rejestracja zawodnika udana!" -ForegroundColor Green
    Write-Host "Token: $($registerResponse.token.Substring(0,20))..." -ForegroundColor Cyan
    $athleteToken = $registerResponse.token
} catch {
    Write-Host "❌ Błąd rejestracji zawodnika: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Rejestracja trenera
Write-Host "`n2. Testowanie rejestracji trenera..." -ForegroundColor Yellow

$coachData = @{
    email = "trener@test.pl"
    password = "haslo123"
    firstName = "Anna"
    lastName = "Nowak"
    phone = "987654321"
    role = "COACH"
} | ConvertTo-Json

try {
    $coachResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $coachData -ContentType "application/json"
    Write-Host "✅ Rejestracja trenera udana!" -ForegroundColor Green
    Write-Host "Token: $($coachResponse.token.Substring(0,20))..." -ForegroundColor Cyan
    $coachToken = $coachResponse.token
} catch {
    Write-Host "❌ Błąd rejestracji trenera: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Rejestracja administratora
Write-Host "`n3. Testowanie rejestracji administratora..." -ForegroundColor Yellow

$adminData = @{
    email = "admin@test.pl"
    password = "haslo123"
    firstName = "Piotr"
    lastName = "Admin"
    phone = "555666777"
    role = "ADMIN"
} | ConvertTo-Json

try {
    $adminResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $adminData -ContentType "application/json"
    Write-Host "✅ Rejestracja administratora udana!" -ForegroundColor Green
    Write-Host "Token: $($adminResponse.token.Substring(0,20))..." -ForegroundColor Cyan
    $adminToken = $adminResponse.token
} catch {
    Write-Host "❌ Błąd rejestracji administratora: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Logowanie zawodnika
Write-Host "`n4. Testowanie logowania zawodnika..." -ForegroundColor Yellow

$loginData = @{
    email = "zawodnik@test.pl"
    password = "haslo123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Logowanie zawodnika udane!" -ForegroundColor Green
    Write-Host "Użytkownik: $($loginResponse.user.firstName) $($loginResponse.user.lastName)" -ForegroundColor Cyan
    Write-Host "Rola: $($loginResponse.user.role)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Błąd logowania zawodnika: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Sprawdzenie profilu zawodnika
Write-Host "`n5. Testowanie pobierania profilu zawodnika..." -ForegroundColor Yellow

if ($athleteToken) {
    try {
        $headers = @{
            "Authorization" = "Bearer $athleteToken"
        }
        $profileResponse = Invoke-RestMethod -Uri "$baseUrl/auth/profile" -Method GET -Headers $headers
        Write-Host "✅ Pobieranie profilu zawodnika udane!" -ForegroundColor Green
        Write-Host "Profil: $($profileResponse.firstName) $($profileResponse.lastName) ($($profileResponse.role))" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Błąd pobierania profilu zawodnika: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 6: Sprawdzenie profilu trenera
Write-Host "`n6. Testowanie pobierania profilu trenera..." -ForegroundColor Yellow

if ($coachToken) {
    try {
        $headers = @{
            "Authorization" = "Bearer $coachToken"
        }
        $profileResponse = Invoke-RestMethod -Uri "$baseUrl/auth/profile" -Method GET -Headers $headers
        Write-Host "✅ Pobieranie profilu trenera udane!" -ForegroundColor Green
        Write-Host "Profil: $($profileResponse.firstName) $($profileResponse.lastName) ($($profileResponse.role))" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Błąd pobierania profilu trenera: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 7: Sprawdzenie profilu administratora
Write-Host "`n7. Testowanie pobierania profilu administratora..." -ForegroundColor Yellow

if ($adminToken) {
    try {
        $headers = @{
            "Authorization" = "Bearer $adminToken"
        }
        $profileResponse = Invoke-RestMethod -Uri "$baseUrl/auth/profile" -Method GET -Headers $headers
        Write-Host "✅ Pobieranie profilu administratora udane!" -ForegroundColor Green
        Write-Host "Profil: $($profileResponse.firstName) $($profileResponse.lastName) ($($profileResponse.role))" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Błąd pobierania profilu administratora: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 8: Test błędnego logowania
Write-Host "`n8. Testowanie błędnego logowania..." -ForegroundColor Yellow

$wrongLoginData = @{
    email = "zawodnik@test.pl"
    password = "blednehaslo"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $wrongLoginData -ContentType "application/json" | Out-Null
    Write-Host "❌ Błędne logowanie powinno się nie udać!" -ForegroundColor Red
} catch {
    Write-Host "✅ Błędne logowanie poprawnie odrzucone!" -ForegroundColor Green
    Write-Host "Błąd: $($_.Exception.Message)" -ForegroundColor Cyan
}

Write-Host "`nTesty zakonczone!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green