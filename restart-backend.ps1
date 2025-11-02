# Restart Backend Script
Write-Host "🔄 Restarting Backend with New JWT Secret..." -ForegroundColor Cyan

# Stop any existing backend processes
Write-Host "`n1️⃣ Stopping existing backend processes..." -ForegroundColor Yellow
$backendProcesses = Get-Process node -ErrorAction SilentlyContinue | Where-Object { 
    $_.MainWindowTitle -like "*backend*" -or 
    $_.CommandLine -like "*nest start*" 
}

if ($backendProcesses) {
    $backendProcesses | Stop-Process -Force
    Write-Host "✅ Stopped $($backendProcesses.Count) backend process(es)" -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "ℹ️  No backend processes found running" -ForegroundColor Gray
}

# Navigate to backend directory
$backendPath = "c:\Users\Przemo\Projekty\nowa platforma\athletics-platform\backend"
Set-Location $backendPath

# Check if .env has new JWT secret
Write-Host "`n2️⃣ Verifying JWT Secret..." -ForegroundColor Yellow
$envContent = Get-Content ".env" -Raw
if ($envContent -match 'JWT_SECRET="yUdOQPyutoIxgugR') {
    Write-Host "✅ New JWT Secret detected!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: JWT Secret might not be updated" -ForegroundColor Red
}

# Start backend
Write-Host "`n3️⃣ Starting backend..." -ForegroundColor Yellow
Write-Host "Backend URL: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Health Check: http://localhost:3001/health" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop the backend`n" -ForegroundColor Gray

npm run start:dev