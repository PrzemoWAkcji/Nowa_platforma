# Athletics Platform - System Test Script

Write-Host "`nTesting Athletics Platform System..." -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray

# Test 1: Backend Health
Write-Host "`n[1/5] Testing Backend Health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET -UseBasicParsing -TimeoutSec 5
    $health = $response.Content | ConvertFrom-Json
    
    Write-Host "PASS Backend: ONLINE" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
    Write-Host "   Uptime: $($health.uptime)s" -ForegroundColor Gray
    if ($health.database) {
        Write-Host "   Database: $($health.database.status)" -ForegroundColor Gray
    }
} catch {
    Write-Host "FAIL Backend: OFFLINE" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Frontend
Write-Host "`n[2/5] Testing Frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -UseBasicParsing -TimeoutSec 10
    Write-Host "PASS Frontend: ONLINE" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "FAIL Frontend: OFFLINE" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Database Connection
Write-Host "`n[3/5] Testing Database Connection..." -ForegroundColor Yellow
try {
    Set-Location "$PSScriptRoot\athletics-platform\backend"
    $dbTest = node "$PSScriptRoot\test-db-connection.js" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "PASS Database: CONNECTED" -ForegroundColor Green
        $dbTest | Select-String -Pattern "Competitions:|Athletes:|Events:|Registrations:" | ForEach-Object { 
            Write-Host "   $_" -ForegroundColor Gray 
        }
    } else {
        Write-Host "FAIL Database: ERROR" -ForegroundColor Red
    }
} catch {
    Write-Host "FAIL Database test failed" -ForegroundColor Red
}

# Test 4: API Authentication
Write-Host "`n[4/5] Testing API Authentication..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/competitions" -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "WARN Auth: No protection (PUBLIC)" -ForegroundColor Yellow
} catch {
    $errorInfo = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorInfo.statusCode -eq 401) {
        Write-Host "PASS Auth: PROTECTED" -ForegroundColor Green
        Write-Host "   Unauthorized access blocked correctly" -ForegroundColor Gray
    } else {
        Write-Host "FAIL Auth: Unexpected error" -ForegroundColor Red
        Write-Host "   Status Code: $($errorInfo.statusCode)" -ForegroundColor Red
    }
}

# Test 5: Node Processes
Write-Host "`n[5/5] Checking Node Processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process | Where-Object { $_.ProcessName -like "*node*" }
if ($nodeProcesses) {
    Write-Host "PASS Found $($nodeProcesses.Count) Node.js processes" -ForegroundColor Green
    $nodeProcesses | Select-Object -First 3 | ForEach-Object { 
        Write-Host "   PID: $($_.Id) | Started: $($_.StartTime)" -ForegroundColor Gray
    }
} else {
    Write-Host "WARN No Node.js processes found" -ForegroundColor Yellow
}

# Summary
Write-Host "`n" + ("=" * 60) -ForegroundColor Gray
Write-Host "System Test Complete!" -ForegroundColor Cyan

Write-Host "`nQuick Links:" -ForegroundColor White
Write-Host "   Frontend:     http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Backend:      http://localhost:3001" -ForegroundColor Cyan
Write-Host "   Health Check: http://localhost:3001/health" -ForegroundColor Cyan

Write-Host "`nDocumentation:" -ForegroundColor White
Write-Host "   Quick Wins:        QUICK_WINS.md" -ForegroundColor Cyan
Write-Host "   Recommendations:   RECOMMENDATIONS.md" -ForegroundColor Cyan
Write-Host "   Migration Report:  MIGRATION_SUCCESS.md" -ForegroundColor Cyan

Write-Host ""