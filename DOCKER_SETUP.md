# 🐳 Docker Setup Guide

## Quick Start

### 1. Przygotowanie

Skopiuj plik środowiskowy:

```bash
cp .env.docker.example .env.docker
```

Wypełnij wszystkie wartości w `.env.docker`:

- `DATABASE_URL` i `DIRECT_URL` - dane dostępowe do PostgreSQL (Supabase lub własna instancja)
- `JWT_SECRET` - wygeneruj używając: `node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"`
- `SUPABASE_URL` i `SUPABASE_ANON_KEY` - z panelu Supabase

### 2. Uruchomienie (Produkcja)

```bash
# Build i uruchomienie
docker-compose --env-file .env.docker up --build -d

# Sprawdzenie statusu
docker-compose ps

# Logi
docker-compose logs -f

# Zatrzymanie
docker-compose down
```

### 3. Uruchomienie (Development z hot-reload)

```bash
# Build i uruchomienie w trybie dev
docker-compose -f docker-compose.dev.yml --env-file .env.docker up --build

# Kod będzie obserwowany i automatycznie przeładowywany
```

## Architektura

### Services

1. **Backend** (Port 3001)
   - NestJS API
   - Multi-stage build (builder → production)
   - Non-root user (security)
   - Health checks
   - Auto-restart

2. **Frontend** (Port 3000)
   - Next.js 15
   - Standalone output
   - Multi-stage build
   - Health checks
   - Auto-restart

3. **PostgreSQL** (Port 5432) - opcjonalnie
   - PostgreSQL 16 Alpine
   - Persistent volume
   - Health checks
   - (Domyślnie wyłączone - używamy Supabase)

## Komendy Docker

### Podstawowe

```bash
# Build bez cache
docker-compose build --no-cache

# Uruchomienie tylko backendu
docker-compose up backend

# Restart pojedynczego serwisu
docker-compose restart backend

# Usunięcie kontenerów i wolumenów
docker-compose down -v
```

### Debugging

```bash
# Wejście do kontenera backend
docker exec -it athletics-backend sh

# Sprawdzenie logów backend
docker logs athletics-backend -f

# Sprawdzenie użycia zasobów
docker stats
```

### Maintenance

```bash
# Czyszczenie nieużywanych obrazów
docker image prune -a

# Sprawdzenie rozmiaru obrazów
docker images

# Czyszczenie wszystkiego (UWAGA!)
docker system prune -a --volumes
```

## Health Checks

- **Backend**: `http://localhost:3001/health`
- **Frontend**: `http://localhost:3000/`
- **API Docs**: `http://localhost:3001/api-docs`

## Environment Variables

### Backend

- `NODE_ENV` - production/development
- `PORT` - Port serwera (default: 3001)
- `DATABASE_URL` - Connection string do PostgreSQL
- `JWT_SECRET` - Secret dla JWT tokens
- `FRONTEND_URL` - URL frontend (dla CORS)

### Frontend

- `NODE_ENV` - production/development
- `NEXT_PUBLIC_API_URL` - URL backend API

## Produkcja

### 1. Przygotowanie

```bash
# Wygeneruj silny JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Zaktualizuj .env.docker
nano .env.docker
```

Ustaw w `.env.docker`:

```bash
NODE_ENV=production
SECURE_COOKIES=true
HTTPS_ONLY=true
```

### 2. Deployment

```bash
# Build obrazów produkcyjnych
docker-compose --env-file .env.docker build

# Uruchomienie
docker-compose --env-file .env.docker up -d

# Sprawdzenie
docker-compose ps
docker-compose logs -f
```

### 3. Monitoring

```bash
# Sprawdź health wszystkich serwisów
docker-compose ps

# Backend health
curl http://localhost:3001/health

# Frontend health
curl http://localhost:3000/
```

## Troubleshooting

### Backend nie startuje

```bash
# Sprawdź logi
docker logs athletics-backend

# Sprawdź zmienne środowiskowe
docker exec athletics-backend env | grep DATABASE_URL

# Sprawdź połączenie z bazą
docker exec athletics-backend npx prisma db pull
```

### Frontend nie może połączyć się z backend

```bash
# Sprawdź czy backend jest dostępny
docker exec athletics-frontend curl http://backend:3001/health

# Sprawdź zmienną NEXT_PUBLIC_API_URL
docker exec athletics-frontend env | grep NEXT_PUBLIC_API_URL
```

### Problemy z buildem

```bash
# Wyczyść cache i rebuild
docker-compose build --no-cache
docker-compose up --force-recreate
```

## Optymalizacja

### Rozmiary obrazów

- Backend: ~250MB (alpine base)
- Frontend: ~400MB (Next.js standalone)

### Multi-stage builds

Każdy Dockerfile używa multi-stage builds:

1. **Builder stage** - instalacja i build
2. **Production stage** - tylko niezbędne pliki

### Security

- ✅ Non-root users w kontenerach
- ✅ .dockerignore dla plików wrażliwych
- ✅ Health checks
- ✅ Minimal Alpine images
- ✅ Separate .env.docker (nie commituj!)

## CI/CD Integration

### GitHub Actions

```yaml
- name: Build Docker images
  run: docker-compose build

- name: Run tests in Docker
  run: docker-compose run backend npm test

- name: Deploy to production
  run: |
    docker-compose --env-file .env.production up -d
```

## Tips

1. **Development**: Użyj `docker-compose.dev.yml` dla hot-reload
2. **Production**: Użyj głównego `docker-compose.yml`
3. **Nie commituj**: `.env.docker` i podobne pliki
4. **Monitoring**: Regularnie sprawdzaj `docker stats`
5. **Updates**: Regularnie aktualizuj base images

## Next Steps

1. ✅ Docker setup - DONE
2. 🔄 Dodaj nginx reverse proxy (opcjonalne)
3. 🔄 Dodaj Redis dla cache (opcjonalne)
4. 🔄 Konfiguracja CI/CD pipeline
5. 🔄 Monitoring i logging (Prometheus/Grafana)
