# 🚀 Automatyczny Setup Platformy Lekkoatletycznej
# Uruchom: powershell -ExecutionPolicy Bypass -File setup-project.ps1

Write-Host "🏃‍♂️ Konfiguracja Platformy Lekkoatletycznej..." -ForegroundColor Green

# Sprawdź wymagania
Write-Host "📋 Sprawdzanie wymagań..." -ForegroundColor Yellow

# Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js nie jest zainstalowany!" -ForegroundColor Red
    exit 1
}

# Docker
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker nie jest zainstalowany!" -ForegroundColor Red
    exit 1
}

# Stwórz strukturę projektu
Write-Host "📁 Tworzenie struktury projektu..." -ForegroundColor Yellow

$projectName = "athletics-platform"
if (Test-Path $projectName) {
    Write-Host "⚠️  Folder $projectName już istnieje!" -ForegroundColor Yellow
    $response = Read-Host "Czy chcesz kontynuować? (y/n)"
    if ($response -ne "y") {
        exit 0
    }
}

# Stwórz główny folder
New-Item -ItemType Directory -Force -Path $projectName
Set-Location $projectName

# Inicjalizuj git
git init

# Stwórz .gitignore
@"
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
.next/

# Database
*.db
*.sqlite

# Logs
logs/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Docker
docker-compose.override.yml
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8

Write-Host "✅ Struktura projektu utworzona" -ForegroundColor Green

# Setup Backend
Write-Host "🔧 Konfiguracja Backend (NestJS)..." -ForegroundColor Yellow

# Sprawdź czy NestJS CLI jest zainstalowany
try {
    nest --version | Out-Null
} catch {
    Write-Host "📦 Instalacja NestJS CLI..." -ForegroundColor Yellow
    npm install -g @nestjs/cli
}

# Stwórz backend
New-Item -ItemType Directory -Force -Path "backend"
Set-Location "backend"

# Inicjalizuj NestJS
nest new . --package-manager npm --skip-git

# Zainstaluj dodatkowe dependencies
Write-Host "📦 Instalacja dependencies..." -ForegroundColor Yellow
npm install prisma @prisma/client @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt class-validator class-transformer bcryptjs
npm install -D @types/passport-jwt @types/bcryptjs prisma

# Inicjalizuj Prisma
npx prisma init

# Stwórz .env
@"
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/athletics"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production-$(Get-Random)"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV=development
"@ | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "✅ Backend skonfigurowany" -ForegroundColor Green

# Wróć do głównego folderu
Set-Location ".."

# Setup Frontend
Write-Host "🎨 Konfiguracja Frontend (Next.js)..." -ForegroundColor Yellow

# Stwórz Next.js app
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

Set-Location "frontend"

# Zainstaluj dodatkowe dependencies
Write-Host "📦 Instalacja frontend dependencies..." -ForegroundColor Yellow
npm install zustand @tanstack/react-query @tanstack/react-query-devtools axios react-hook-form @hookform/resolvers zod lucide-react date-fns

# Setup Shadcn/ui
npx shadcn-ui@latest init --yes --defaults

Write-Host "✅ Frontend skonfigurowany" -ForegroundColor Green

# Wróć do głównego folderu
Set-Location ".."

# Stwórz Docker Compose
Write-Host "🐳 Konfiguracja Docker..." -ForegroundColor Yellow

@"
version: '3.8'

services:
  # Database
  postgres:
    image: postgres:15
    container_name: athletics_db
    environment:
      POSTGRES_DB: athletics
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d athletics"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Cache
  redis:
    image: redis:7-alpine
    container_name: athletics_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Adminer (Database GUI)
  adminer:
    image: adminer
    container_name: athletics_adminer
    ports:
      - "8080:8080"
    depends_on:
      - postgres

volumes:
  postgres_data:
  redis_data:
"@ | Out-File -FilePath "docker-compose.yml" -Encoding UTF8

Write-Host "✅ Docker skonfigurowany" -ForegroundColor Green

# Stwórz skrypty pomocnicze
Write-Host "📜 Tworzenie skryptów pomocniczych..." -ForegroundColor Yellow

# Start script
@"
# 🚀 Uruchom Platformę Lekkoatletyczną
Write-Host "🏃‍♂️ Uruchamianie Platformy..." -ForegroundColor Green

# Uruchom bazy danych
Write-Host "🗄️ Uruchamianie baz danych..." -ForegroundColor Yellow
docker-compose up -d postgres redis

# Czekaj na bazy danych
Write-Host "⏳ Oczekiwanie na bazy danych..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Uruchom migracje
Write-Host "🔄 Uruchamianie migracji..." -ForegroundColor Yellow
Set-Location "backend"
npx prisma migrate dev --name init
npx prisma generate
Set-Location ".."

Write-Host "✅ Platformy gotowa!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Dostępne serwisy:" -ForegroundColor Cyan
Write-Host "   Backend API:     http://localhost:3001" -ForegroundColor White
Write-Host "   Frontend:        http://localhost:3000" -ForegroundColor White
Write-Host "   Prisma Studio:   http://localhost:5555" -ForegroundColor White
Write-Host "   Adminer:         http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Uruchom aplikacje:" -ForegroundColor Cyan
Write-Host "   Backend:  cd backend && npm run start:dev" -ForegroundColor White
Write-Host "   Frontend: cd frontend && npm run dev" -ForegroundColor White
"@ | Out-File -FilePath "start.ps1" -Encoding UTF8

# Package.json dla głównego projektu
@"
{
  "name": "athletics-platform",
  "version": "1.0.0",
  "description": "Professional athletics competition management platform",
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run start:dev",
    "dev:frontend": "cd frontend && npm run dev",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "cd backend && npm run build",
    "build:frontend": "cd frontend && npm run build",
    "start": "concurrently \"npm run start:backend\" \"npm run start:frontend\"",
    "start:backend": "cd backend && npm run start:prod",
    "start:frontend": "cd frontend && npm start",
    "db:migrate": "cd backend && npx prisma migrate dev",
    "db:studio": "cd backend && npx prisma studio",
    "db:reset": "cd backend && npx prisma migrate reset",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
"@ | Out-File -FilePath "package.json" -Encoding UTF8

# README
@"
# 🏃‍♂️ Athletics Platform

Profesjonalna platforma do zarządzania zawodami lekkoatletycznymi.

## 🚀 Quick Start

### 1. Uruchom bazy danych
``````powershell
docker-compose up -d
``````

### 2. Zainstaluj dependencies
``````powershell
npm install
cd backend && npm install
cd ../frontend && npm install
``````

### 3. Uruchom migracje
``````powershell
cd backend
npx prisma migrate dev --name init
npx prisma generate
``````

### 4. Uruchom aplikacje
``````powershell
# Backend (terminal 1)
cd backend && npm run start:dev

# Frontend (terminal 2)  
cd frontend && npm run dev
``````

## 🌐 Dostępne Serwisy

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001  
- **Prisma Studio**: http://localhost:5555
- **Adminer**: http://localhost:8080

## 🛠️ Technologie

### Backend
- NestJS + TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication
- Redis Cache

### Frontend  
- Next.js 14 + TypeScript
- Tailwind CSS + Shadcn/ui
- TanStack Query
- Zustand State Management

## 📋 Dostępne Komendy

``````powershell
npm run dev              # Uruchom backend + frontend
npm run build            # Zbuduj aplikacje
npm run db:migrate       # Uruchom migracje
npm run db:studio        # Otwórz Prisma Studio
npm run docker:up        # Uruchom Docker services
npm run docker:down      # Zatrzymaj Docker services
``````

## 📁 Struktura Projektu

``````
athletics-platform/
├── backend/             # NestJS API
├── frontend/            # Next.js App  
├── docker-compose.yml   # Docker services
└── package.json         # Root scripts
``````

## 🔧 Development

1. Zmień schema w `backend/prisma/schema.prisma`
2. Uruchom `npm run db:migrate`
3. Implementuj backend logic
4. Stwórz frontend components
5. Testuj

## 📚 Dokumentacja

- [Setup Guide](./PROJECT_SETUP_GUIDE.md)
- [Quick Start](./QUICK_START.md)
- [Tech Stack](./PRACTICAL_TECH_STACK.md)
"@ | Out-File -FilePath "README.md" -Encoding UTF8

Write-Host "✅ Skrypty pomocnicze utworzone" -ForegroundColor Green

# Zainstaluj concurrently dla root package.json
npm install

Write-Host ""
Write-Host "🎉 SETUP ZAKOŃCZONY POMYŚLNIE!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Następne kroki:" -ForegroundColor Cyan
Write-Host "1. Uruchom: .\start.ps1" -ForegroundColor White
Write-Host "2. Otwórz nowy terminal i uruchom backend: cd backend && npm run start:dev" -ForegroundColor White  
Write-Host "3. Otwórz kolejny terminal i uruchom frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Aplikacja będzie dostępna na:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "📖 Sprawdź README.md po więcej informacji!" -ForegroundColor Yellow