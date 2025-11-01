# 🚀 Przewodnik Konfiguracji Projektu - Krok po Kroku

## 🎯 **Cel: Stworzenie Solidnej Platformy Lekkoatletycznej**

### **Struktura Projektu:**
```
athletics-platform/
├── backend/          # NestJS API
├── frontend/         # Next.js App
├── mobile/           # React Native (opcjonalnie)
├── shared/           # Wspólne typy i utilities
├── docs/             # Dokumentacja
└── docker/           # Docker configs
```

---

## 📋 **Krok 1: Setup Backend (NestJS)**

### **1.1 Inicjalizacja Projektu**
```bash
# Stwórz główny folder
mkdir athletics-platform
cd athletics-platform

# Backend setup
mkdir backend
cd backend

# Inicjalizuj NestJS projekt
npm i -g @nestjs/cli
nest new . --package-manager npm
```

### **1.2 Instalacja Podstawowych Dependencies**
```bash
# Database & ORM
npm install prisma @prisma/client
npm install -D prisma

# Authentication
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install -D @types/passport-jwt

# Validation
npm install class-validator class-transformer

# Configuration
npm install @nestjs/config

# Cache (Redis)
npm install @nestjs/cache-manager cache-manager
npm install cache-manager-redis-store redis

# Testing
npm install -D @nestjs/testing supertest
npm install -D @types/supertest

# Utilities
npm install bcryptjs
npm install -D @types/bcryptjs
```

### **1.3 Struktura Folderów Backend**
```
backend/src/
├── app.module.ts
├── main.ts
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── config/
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── redis.config.ts
├── modules/
│   ├── auth/
│   ├── users/
│   ├── competitions/
│   ├── registrations/
│   ├── results/
│   └── athletes/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── shared/
    ├── dto/
    ├── entities/
    └── types/
```

---

## 🎨 **Krok 2: Setup Frontend (Next.js)**

### **2.1 Inicjalizacja Next.js**
```bash
# Wróć do głównego folderu
cd ..

# Frontend setup
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd frontend
```

### **2.2 Instalacja UI Dependencies**
```bash
# Shadcn/ui setup
npx shadcn-ui@latest init

# State management
npm install zustand

# Data fetching
npm install @tanstack/react-query
npm install @tanstack/react-query-devtools

# Forms
npm install react-hook-form @hookform/resolvers zod

# Icons
npm install lucide-react

# Date handling
npm install date-fns

# HTTP client
npm install axios
```

### **2.3 Struktura Folderów Frontend**
```
frontend/src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   ├── competitions/
│   ├── athletes/
│   └── dashboard/
├── components/
│   ├── ui/          # Shadcn components
│   ├── forms/
│   ├── layouts/
│   └── features/
├── hooks/
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   └── utils.ts
├── stores/
├── types/
└── styles/
```

---

## 🗄️ **Krok 3: Database Setup**

### **3.1 Prisma Schema (backend/prisma/schema.prisma)**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  firstName String
  lastName  String
  role      UserRole @default(USER)
  password  String
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  registrations Registration[]
  
  @@map("users")
}

model Competition {
  id          String            @id @default(cuid())
  name        String
  description String?
  startDate   DateTime
  endDate     DateTime
  location    String
  type        CompetitionType
  status      CompetitionStatus @default(DRAFT)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  events        Event[]
  registrations Registration[]
  
  @@map("competitions")
}

model Event {
  id            String    @id @default(cuid())
  name          String
  type          EventType
  gender        Gender
  category      Category
  unit          Unit
  competitionId String
  
  // Relations
  competition Competition @relation(fields: [competitionId], references: [id], onDelete: Cascade)
  results     Result[]
  
  @@map("events")
}

model Athlete {
  id          String   @id @default(cuid())
  firstName   String
  lastName    String
  dateOfBirth DateTime
  gender      Gender
  club        String?
  category    Category
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  registrations Registration[]
  results       Result[]
  
  @@map("athletes")
}

model Registration {
  id            String            @id @default(cuid())
  athleteId     String
  competitionId String
  userId        String
  status        RegistrationStatus @default(PENDING)
  seedTime      String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  athlete     Athlete     @relation(fields: [athleteId], references: [id])
  competition Competition @relation(fields: [competitionId], references: [id])
  user        User        @relation(fields: [userId], references: [id])
  results     Result[]
  
  @@unique([athleteId, competitionId])
  @@map("registrations")
}

model Result {
  id             String  @id @default(cuid())
  athleteId      String
  eventId        String
  registrationId String
  result         String
  position       Int?
  points         Int?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  athlete      Athlete      @relation(fields: [athleteId], references: [id])
  event        Event        @relation(fields: [eventId], references: [id])
  registration Registration @relation(fields: [registrationId], references: [id])
  
  @@map("results")
}

// Enums
enum UserRole {
  USER
  ADMIN
  ORGANIZER
}

enum CompetitionType {
  OUTDOOR
  INDOOR
  ROAD
  CROSS_COUNTRY
}

enum CompetitionStatus {
  DRAFT
  PUBLISHED
  REGISTRATION_OPEN
  REGISTRATION_CLOSED
  ONGOING
  COMPLETED
  CANCELLED
}

enum EventType {
  TRACK
  FIELD
  ROAD
}

enum Gender {
  MALE
  FEMALE
  MIXED
}

enum Category {
  U16
  U18
  U20
  SENIOR
  MASTER
}

enum Unit {
  TIME
  DISTANCE
  HEIGHT
  POINTS
}

enum RegistrationStatus {
  PENDING
  CONFIRMED
  CANCELLED
  WAITLIST
}
```

### **3.2 Environment Variables**
```bash
# backend/.env
DATABASE_URL="postgresql://user:password@localhost:5432/athletics"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
REDIS_URL="redis://localhost:6379"
PORT=3001
```

---

## 🐳 **Krok 4: Docker Setup**

### **4.1 Docker Compose (docker-compose.yml)**
```yaml
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

  # Cache
  redis:
    image: redis:7-alpine
    container_name: athletics_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Backend
  backend:
    build: ./backend
    container_name: athletics_backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/athletics
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules

  # Frontend
  frontend:
    build: ./frontend
    container_name: athletics_frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next

volumes:
  postgres_data:
  redis_data:
```

### **4.2 Backend Dockerfile**
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "start:dev"]
```

### **4.3 Frontend Dockerfile**
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

---

## 🚀 **Krok 5: Uruchomienie Projektu**

### **5.1 Pierwsze Uruchomienie**
```bash
# Uruchom bazy danych
docker-compose up postgres redis -d

# Backend setup
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run start:dev

# Frontend setup (nowy terminal)
cd frontend
npm install
npm run dev
```

### **5.2 Pełne Uruchomienie z Docker**
```bash
# Zbuduj i uruchom wszystko
docker-compose up --build

# Migracje bazy danych
docker-compose exec backend npx prisma migrate dev
```

---

## 📋 **Krok 6: Podstawowa Konfiguracja**

### **6.1 Backend - Main Module (backend/src/app.module.ts)**
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompetitionsModule } from './modules/competitions/competitions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CompetitionsModule,
  ],
})
export class AppModule {}
```

### **6.2 Frontend - Root Layout (frontend/src/app/layout.tsx)**
```typescript
import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Athletics Platform',
  description: 'Professional athletics competition management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

---

## ✅ **Checklist - Co Mamy Po Setup**

### **Backend:**
- [x] NestJS z TypeScript
- [x] PostgreSQL + Prisma ORM
- [x] Redis cache
- [x] JWT Authentication
- [x] Modular architecture
- [x] Docker support

### **Frontend:**
- [x] Next.js 14 z App Router
- [x] Tailwind CSS + Shadcn/ui
- [x] TypeScript
- [x] TanStack Query
- [x] Zustand state management
- [x] Docker support

### **DevOps:**
- [x] Docker Compose
- [x] Environment configuration
- [x] Database migrations
- [x] Development workflow

---

## 🎯 **Następne Kroki**

1. **Implementacja Core Modules** (Competitions, Athletes, Results)
2. **Frontend Components** (Forms, Tables, Dashboard)
3. **Authentication Flow** (Login, Register, Protected Routes)
4. **API Integration** (Frontend ↔ Backend)
5. **Testing Setup** (Unit + Integration tests)
6. **Deployment Configuration** (Production ready)

Chcesz, żebym pomógł Ci zaimplementować któryś z tych kroków? Możemy zacząć od konkretnego modułu! 🚀