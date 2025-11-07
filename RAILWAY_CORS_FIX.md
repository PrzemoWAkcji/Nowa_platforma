# Railway CORS Fix - Instrukcje

## Problem

CORS (Cross-Origin Resource Sharing) był zbyt restrykcyjny i blokował zapytania do backendu Railway.

## Rozwiązanie

### 1. Zaktualizowana konfiguracja CORS

Backend został zaktualizowany aby akceptować:

- ✅ Wszystkie domeny `.railway.app` i `.up.railway.app`
- ✅ Wszystkie domeny `.vercel.app`
- ✅ `localhost` i `127.0.0.1` (development)
- ✅ Niestandardowe domeny z `FRONTEND_URL`

### 2. Konfiguracja zmiennych środowiskowych na Railway

#### Backend Service

Ustaw następujące zmienne w Railway Dashboard dla **backend service**:

```env
# Database (już powinno być ustawione)
DATABASE_URL=postgresql://...

# JWT (KRYTYCZNE - użyj bezpiecznego klucza!)
JWT_SECRET=<twój-bezpieczny-klucz>
JWT_EXPIRES_IN=7d

# Environment
NODE_ENV=production

# Frontend URL (dodaj wszystkie dozwolone domeny, oddzielone przecinkami)
FRONTEND_URL=https://twoj-frontend.railway.app,https://twoj-frontend.vercel.app

# Security (dla production)
SECURE_COOKIES=true
HTTPS_ONLY=true
BCRYPT_ROUNDS=12

# Port (Railway ustawia automatycznie, ale możesz dodać domyślny)
PORT=3001

# PZLA
PZLA_MOCK_MODE=true
```

#### Frontend Service

Ustaw następujące zmienne w Railway Dashboard dla **frontend service**:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=https://twoj-backend.railway.app

# Environment
NODE_ENV=production
```

### 3. Jak ustawić zmienne na Railway

1. Wejdź na [railway.app](https://railway.app)
2. Wybierz swój projekt
3. Kliknij na **backend service**
4. Przejdź do zakładki **Variables**
5. Kliknij **+ New Variable**
6. Dodaj każdą zmienną osobno lub użyj **RAW Editor** aby wkleić wszystkie naraz

### 4. Deployment

Po ustawieniu zmiennych:

```powershell
# Backend - push do Railway
cd athletics-platform\backend
git add .
git commit -m "Fix CORS configuration for Railway"
git push

# Lub jeśli używasz Railway CLI:
railway up
```

### 5. Test CORS

Użyj pliku `test-railway-cors.html` aby przetestować czy CORS działa:

```powershell
# Edytuj plik i wstaw swój Railway backend URL
# Następnie otwórz w przeglądarce
```

### 6. Debugging

Jeśli CORS nadal nie działa, sprawdź:

1. **Logi Railway:**
   - Otwórz backend service w Railway Dashboard
   - Sprawdź zakładkę **Deployments** → **View Logs**
   - Szukaj komunikatu: `CORS blocked origin: ...`

2. **Browser Console:**
   - Otwórz Developer Tools (F12)
   - Sprawdź Console i Network tabs
   - Szukaj błędów CORS

3. **Zweryfikuj zmienne środowiskowe:**
   - Railway Dashboard → Backend Service → Variables
   - Upewnij się, że `FRONTEND_URL` zawiera dokładny URL frontendu

### 7. Rozwiązywanie problemów

#### Problem: "Not allowed by CORS"

**Rozwiązanie:**

- Sprawdź czy `FRONTEND_URL` w Railway zawiera dokładny URL frontendu
- Sprawdź logi backendu aby zobaczyć który origin został zablokowany
- Upewnij się, że używasz HTTPS (nie HTTP) dla production URLs

#### Problem: "No 'Access-Control-Allow-Origin' header"

**Rozwiązanie:**

- Upewnij się, że backend został zaktualizowany z nową konfiguracją CORS
- Sprawdź czy deployment Railway się powiódł
- Zrestartuj backend service w Railway

#### Problem: Cookies nie działają

**Rozwiązanie:**

- Ustaw `SECURE_COOKIES=true` i `HTTPS_ONLY=true` na production
- Upewnij się, że frontend i backend są na tej samej domenie lub subdomenach
- Sprawdź czy browser akceptuje third-party cookies

### 8. Producton Checklist

Przed przejściem do produkcji:

- [ ] `JWT_SECRET` - ustawiony na bezpieczny, losowy klucz (minimum 64 znaki)
- [ ] `NODE_ENV=production`
- [ ] `SECURE_COOKIES=true`
- [ ] `HTTPS_ONLY=true`
- [ ] `BCRYPT_ROUNDS=12` (lub więcej)
- [ ] `FRONTEND_URL` - zawiera wszystkie dozwolone domeny frontend
- [ ] `DATABASE_URL` - wskazuje na production database (Neon/Railway PostgreSQL)
- [ ] Sprawdzono logi Railway pod kątem błędów
- [ ] Przetestowano logowanie i główne funkcje

## Dodatkowe uwagi

### Bezpieczeństwo

Obecna konfiguracja akceptuje wszystkie domeny `.railway.app` i `.vercel.app`. Jeśli chcesz większe bezpieczeństwo:

1. Usuń wildcards dla Railway/Vercel
2. Dodaj dokładne URLs do `FRONTEND_URL`
3. Przykład: `FRONTEND_URL=https://athletics-platform-production.railway.app`

### Multiple Environments

Jeśli masz wiele środowisk (dev, staging, production):

```env
# Dla staging
FRONTEND_URL=https://staging-frontend.railway.app,https://dev-frontend.vercel.app

# Dla production
FRONTEND_URL=https://athletics-platform.com,https://app.athletics-platform.com
```

## Potrzebujesz pomocy?

Jeśli nadal masz problemy:

1. Sprawdź logi Railway
2. Użyj test HTML aby zdiagnozować problem
3. Sprawdź Browser Developer Tools
