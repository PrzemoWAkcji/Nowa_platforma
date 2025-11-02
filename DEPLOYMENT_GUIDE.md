# 🚀 Production Deployment Guide

## Spis Treści

1. [Wymagania](#wymagania)
2. [Konfiguracja Środowiska](#konfiguracja-środowiska)
3. [Deployment z Docker Compose](#deployment-z-docker-compose)
4. [Weryfikacja Deploymentu](#weryfikacja-deploymentu)
5. [Monitoring i Logi](#monitoring-i-logi)
6. [Troubleshooting](#troubleshooting)

---

## Wymagania

### Minimalne Wymagania Serwera

- **CPU**: 2 cores (4 cores zalecane)
- **RAM**: 4GB (8GB zalecane)
- **Dysk**: 20GB wolnego miejsca (SSD zalecany)
- **OS**: Linux (Ubuntu 22.04 LTS zalecany) lub Windows Server

### Zainstalowane Narzędzia

```bash
# Docker & Docker Compose
docker --version  # >= 24.0.0
docker-compose --version  # >= 2.20.0

# Node.js (dla developmentu)
node --version  # >= 20.x
npm --version   # >= 10.x
```

---

## Konfiguracja Środowiska

### 1. Przygotowanie Pliku `.env`

Skopiuj przykładowy plik środowiskowy:

```bash
cp .env.docker.example .env
```

### 2. Konfiguracja Zmiennych Środowiskowych

Edytuj `.env` i ustaw następujące wartości:

```env
# 🔐 SECURITY (ZMIEŃ TE WARTOŚCI!)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
BCRYPT_ROUNDS=12

# 🗄️ DATABASE (Supabase)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres

# 🌐 URLS
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# 📊 SUPABASE
SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
SUPABASE_ANON_KEY=your-anon-key-from-supabase

# 🔧 PRODUCTION SETTINGS
NODE_ENV=production
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
SECURE_COOKIES=true
HTTPS_ONLY=true
```

### 3. Generowanie Bezpiecznych Sekretów

```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Lub użyj openssl
openssl rand -base64 64
```

---

## Deployment z Docker Compose

### Krok 1: Build Images

```bash
# Build wszystkich kontenerów
docker-compose build

# Lub build z no-cache dla czystej instalacji
docker-compose build --no-cache
```

### Krok 2: Uruchomienie Aplikacji

```bash
# Uruchom w tle (production)
docker-compose up -d

# Lub z logami (development/debug)
docker-compose up
```

### Krok 3: Migracja Bazy Danych

```bash
# Wykonaj migracje Prisma
docker-compose exec backend npx prisma migrate deploy

# Opcjonalnie: załaduj dane testowe
docker-compose exec backend npm run seed
```

### Krok 4: Utworzenie Użytkownika Admin

```bash
# Utwórz pierwszego admina
docker-compose exec backend node create-test-admin.js
```

---

## Weryfikacja Deploymentu

### 1. Sprawdzenie Statusu Kontenerów

```bash
# Sprawdź czy wszystkie kontenery działają
docker-compose ps

# Przykładowy output:
# NAME                   STATUS              PORTS
# athletics-backend      Up 2 minutes        0.0.0.0:3001->3001/tcp
# athletics-frontend     Up 2 minutes        0.0.0.0:3000->3000/tcp
```

### 2. Health Checks

```bash
# Backend health check
curl http://localhost:3001/health

# Powinno zwrócić: {"status":"ok","timestamp":"..."}

# Frontend check
curl http://localhost:3000
```

### 3. API Documentation

Otwórz w przeglądarce:

```
http://localhost:3001/api-docs
```

### 4. Uruchom Testy Wszystkich Endpointów

```bash
# Z głównego katalogu projektu
node test-all-endpoints.js
```

---

## Monitoring i Logi

### Przeglądanie Logów

```bash
# Wszystkie logi
docker-compose logs -f

# Tylko backend
docker-compose logs -f backend

# Tylko frontend
docker-compose logs -f frontend

# Ostatnie 100 linii
docker-compose logs --tail=100 backend
```

### Logi Wewnątrz Kontenera

Backend zapisuje logi w folderze `logs/`:

```bash
# Wejdź do kontenera
docker-compose exec backend sh

# Zobacz logi
cat logs/combined.log
cat logs/error.log
cat logs/security-combined.log
```

### Metryki Zasobów

```bash
# Użycie zasobów przez kontenery
docker stats

# Szczegóły konkretnego kontenera
docker inspect athletics-backend
```

---

## Zarządzanie Produkcją

### Restart Aplikacji

```bash
# Restart wszystkich serwisów
docker-compose restart

# Restart tylko backendu
docker-compose restart backend
```

### Aktualizacja Aplikacji

```bash
# 1. Pull nowego kodu
git pull origin main

# 2. Zatrzymaj kontenery
docker-compose down

# 3. Rebuild images
docker-compose build

# 4. Uruchom ponownie
docker-compose up -d

# 5. Migracje bazy danych (jeśli są)
docker-compose exec backend npx prisma migrate deploy
```

### Backup Bazy Danych

```bash
# Backup Supabase (przez CLI)
npx supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql

# Lub przez pg_dump
pg_dump "postgresql://..." > backup.sql
```

### Zatrzymanie Aplikacji

```bash
# Zatrzymaj kontenery (dane pozostają)
docker-compose stop

# Zatrzymaj i usuń kontenery (dane pozostają w volumes)
docker-compose down

# Usuń wszystko włącznie z volumes
docker-compose down -v
```

---

## Troubleshooting

### Problem: Backend nie może połączyć się z bazą danych

```bash
# Sprawdź zmienne środowiskowe
docker-compose exec backend env | grep DATABASE

# Testuj połączenie
docker-compose exec backend npx prisma db pull
```

### Problem: Frontend nie może połączyć się z backendem

```bash
# Sprawdź zmienne środowiskowe
docker-compose exec frontend env | grep NEXT_PUBLIC

# Sprawdź dostępność backendu
docker-compose exec frontend curl http://backend:3001/health
```

### Problem: Port już zajęty

```bash
# Znajdź proces używający portu
# Linux/Mac
lsof -i :3001

# Windows PowerShell
netstat -ano | findstr :3001

# Zmień port w docker-compose.yml lub zatrzymaj proces
```

### Problem: Brak pamięci

```bash
# Usuń nieużywane obrazy Docker
docker image prune -a

# Usuń nieużywane volumes
docker volume prune

# Kompletne czyszczenie
docker system prune -a --volumes
```

### Problem: Wolne działanie

```bash
# Sprawdź użycie zasobów
docker stats

# Zwiększ limity w docker-compose.yml:
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

---

## 🔒 Security Checklist

- [ ] Zmienione domyślne hasła
- [ ] JWT_SECRET jest silny i unikalny
- [ ] HTTPS jest włączony (HTTPS_ONLY=true)
- [ ] Secure cookies włączone (SECURE_COOKIES=true)
- [ ] Rate limiting skonfigurowany
- [ ] Firewall skonfigurowany (tylko porty 80, 443)
- [ ] Regularne backupy bazy danych
- [ ] Aktualizacje bezpieczeństwa są stosowane
- [ ] Logi są regularnie sprawdzane

---

## 📊 Performance Optimization

### 1. Nginx jako Reverse Proxy

Dodaj Nginx dla lepszej wydajności:

```yaml
# docker-compose.yml
services:
  nginx:
    image: nginx:alpine
    container_name: athletics-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
```

### 2. Redis Cache (Opcjonalnie)

Dodaj Redis dla caching:

```yaml
services:
  redis:
    image: redis:alpine
    container_name: athletics-redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
```

---

## 📝 Checklist Deploymentu

### Przed Deploymentem

- [ ] Wszystkie testy przechodzą lokalnie
- [ ] Zmienne środowiskowe skonfigurowane
- [ ] Backup bazy danych wykonany
- [ ] SSL certyfikaty gotowe
- [ ] DNS skonfigurowany

### Podczas Deploymentu

- [ ] Build images pomyślny
- [ ] Kontenery uruchomione
- [ ] Health checks przechodzą
- [ ] Migracje bazy danych wykonane
- [ ] Admin user utworzony

### Po Deploymencie

- [ ] Aplikacja dostępna pod właściwym URL
- [ ] API documentation działa
- [ ] Login funkcjonuje
- [ ] Testy endpoint przechodzą
- [ ] Logi są monitorowane
- [ ] Backup zautomatyzowany

---

## 🆘 Pomoc i Wsparcie

### Przydatne Komendy

```bash
# Zobacz wszystkie kontenery (również zatrzymane)
docker ps -a

# Zobacz logi z ostatnich 5 minut
docker-compose logs --since 5m

# Wykonaj komendę w kontenerze
docker-compose exec backend sh

# Restart pojedynczego serwisu bez przestoju innych
docker-compose up -d --no-deps --build backend
```

### Kontakt

- Dokumentacja API: `/api-docs`
- Issues: GitHub Issues
- Email: support@yourdomain.com

---

**Powodzenia z deploymentem! 🚀**
