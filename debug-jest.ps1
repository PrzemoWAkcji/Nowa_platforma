#!/usr/bin/env pwsh

Write-Host "🔍 Debugging Jest Configuration..." -ForegroundColor Cyan

# Clear Jest cache
Write-Host "Clearing Jest cache..." -ForegroundColor Yellow
cd "athletics-platform/backend"
npx jest --clearCache

# Check Jest configuration
Write-Host "Checking Jest configuration..." -ForegroundColor Yellow
npx jest --showConfig

# List all test files
Write-Host "Listing test files..." -ForegroundColor Yellow
npx jest --listTests

# Run tests with verbose output
Write-Host "Running tests with verbose output..." -ForegroundColor Yellow
npx jest --verbose

Write-Host "✅ Jest debugging complete!" -ForegroundColor Green