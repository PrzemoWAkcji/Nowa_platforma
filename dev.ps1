# Athletics Platform - Professional Development Environment
# Version: 1.0.0

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "setup", "build", "test", "clean", "health", "help")]
    [string]$Command = "start",
    
    [switch]$Production,
    [switch]$Fresh,
    [switch]$Quiet,
    [switch]$Watch
)

$ErrorActionPreference = "Stop"

# Professional styling
$Colors = @{
    Primary = "Cyan"
    Success = "Green" 
    Warning = "Yellow"
    Error = "Red"
    Info = "Blue"
    Accent = "Magenta"
}

function Write-Banner {
    Clear-Host
    Write-Host @"
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║    🏃‍♂️ ATHLETICS PLATFORM - Professional Development Environment              ║
║                                                                              ║
║    🔧 Backend API (NestJS + Prisma)     🎨 Frontend Web (Next.js + React)   ║
║    📊 Database Management               🚀 Unified Development Server        ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor $Colors.Primary
    Write-Host ""
}

function Write-Status {
    param([string]$Message, [string]$Status = "Info")
    $timestamp = Get-Date -Format "HH:mm:ss"
    $color = $Colors[$Status]
    Write-Host "[$timestamp] $Message" -ForegroundColor $color
}

function Test-Prerequisites {
    Write-Status "🔍 Checking prerequisites..." "Info"
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        if ($nodeVersion -match "v(\d+)\.") {
            $majorVersion = [int]$matches[1]
            if ($majorVersion -lt 18) {
                throw "Node.js version $nodeVersion is too old. Required: >= 18.0.0"
            }
            Write-Status "✅ Node.js $nodeVersion" "Success"
        }
    }
    catch {
        Write-Status "❌ Node.js not found or too old. Please install Node.js >= 18.0.0" "Error"
        exit 1
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Status "✅ npm v$npmVersion" "Success"
    }
    catch {
        Write-Status "❌ npm not found" "Error"
        exit 1
    }
    
    Write-Status "✅ Prerequisites check passed" "Success"
    Write-Host ""
}

function Invoke-Setup {
    Write-Status "📦 Setting up Athletics Platform..." "Info"
    
    if ($Fresh) {
        Write-Status "🧹 Fresh setup - cleaning existing files..." "Warning"
        if (Test-Path "athletics-platform/frontend/.next") {
            Remove-Item "athletics-platform/frontend/.next" -Recurse -Force
        }
        if (Test-Path "athletics-platform/backend/dist") {
            Remove-Item "athletics-platform/backend/dist" -Recurse -Force
        }
    }
    
    Write-Status "📦 Installing dependencies..." "Info"
    npm run setup
    
    Write-Status "✅ Setup completed successfully!" "Success"
    Write-Host ""
}

function Invoke-Start {
    Write-Status "🚀 Starting Athletics Platform..." "Info"
    
    # Check if ports are available
    $ports = @(3000, 3002)
    foreach ($port in $ports) {
        try {
            $connection = New-Object System.Net.Sockets.TcpClient
            $connection.Connect("localhost", $port)
            $connection.Close()
            Write-Status "⚠️ Port $port is already in use!" "Warning"
            $continue = Read-Host "Continue anyway? (y/N)"
            if ($continue -ne "y" -and $continue -ne "Y") {
                exit 1
            }
        }
        catch {
            Write-Status "✅ Port $port is available" "Success"
        }
    }
    
    Write-Host ""
    Write-Status "🎯 Starting development servers..." "Info"
    Write-Host ""
    
    if ($Production) {
        npm run start
    } else {
        npm run dev
    }
}

function Invoke-Build {
    Write-Status "🏗️ Building Athletics Platform..." "Info"
    npm run build
    Write-Status "✅ Build completed!" "Success"
}

function Invoke-Test {
    Write-Status "🧪 Running tests..." "Info"
    npm run test
    Write-Status "✅ Tests completed!" "Success"
}

function Invoke-Clean {
    Write-Status "🧹 Cleaning build artifacts..." "Info"
    npm run clean
    Write-Status "✅ Clean completed!" "Success"
}

function Invoke-Health {
    Write-Status "🏥 Checking service health..." "Info"
    npm run health
}

function Show-Help {
    Write-Host @"
🏃‍♂️ Athletics Platform - Development Commands

USAGE:
    .\dev.ps1 [command] [options]

COMMANDS:
    start       Start development environment (default)
    setup       Setup project (install dependencies, database)
    build       Build for production
    test        Run all tests
    clean       Clean build artifacts
    health      Check service health
    help        Show this help

OPTIONS:
    -Production     Run in production mode
    -Fresh          Clean setup (removes cache/builds)
    -Quiet          Minimal output
    -Watch          Watch mode for tests

EXAMPLES:
    .\dev.ps1                    # Start development
    .\dev.ps1 setup              # Setup project
    .\dev.ps1 setup -Fresh       # Fresh setup
    .\dev.ps1 start -Production  # Start in production mode
    .\dev.ps1 test -Watch        # Run tests in watch mode

QUICK COMMANDS:
    npm run dev                  # Start development (recommended)
    npm run setup                # Setup project
    npm run build                # Build for production

SERVICE URLS:
    🎨 Frontend:  http://localhost:3000
    🔧 Backend:   http://localhost:3002
    📊 API Docs:  http://localhost:3002/api

For more information, see DEVELOPMENT.md
"@ -ForegroundColor $Colors.Info
}

# Main execution
Write-Banner

if (-not $Quiet) {
    Test-Prerequisites
}

switch ($Command.ToLower()) {
    "start" { Invoke-Start }
    "setup" { Invoke-Setup }
    "build" { Invoke-Build }
    "test" { Invoke-Test }
    "clean" { Invoke-Clean }
    "health" { Invoke-Health }
    "help" { Show-Help }
    default { 
        Write-Status "❌ Unknown command: $Command" "Error"
        Show-Help
        exit 1
    }
}

Write-Host ""
Write-Status "🎉 Command completed successfully!" "Success"