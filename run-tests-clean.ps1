#!/usr/bin/env pwsh

Write-Host "🧪 Running Tests (Clean Mode)..." -ForegroundColor Cyan

# Kill any existing Jest processes
Write-Host "Stopping any running Jest processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*jest*" -or ($_.ProcessName -like "*node*" -and $_.CommandLine -like "*jest*")} | Stop-Process -Force -ErrorAction SilentlyContinue

# Clear all caches
Write-Host "Clearing caches..." -ForegroundColor Yellow
cd "athletics-platform/backend"
npx jest --clearCache
Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue

# Run tests
Write-Host "Running tests..." -ForegroundColor Yellow
npx jest --no-cache --runInBand

Write-Host "✅ Tests completed!" -ForegroundColor Green