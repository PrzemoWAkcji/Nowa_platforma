# 🔧 CORS Fix - Podsumowanie zmian

## Co zostało naprawione?

### Problem

Backend Railway nie akceptował zapytań z frontendu z powodu zbyt restrykcyjnej konfiguracji CORS.

## Zmiany

### 1. Zaktualizowano `athletics-platform/backend/src/main.ts`

#### Przed:

```typescript
// Zbyt restrykcyjna konfiguracja
// Odrzucała wszystkie originy które nie pasowały do ścisłych warunków
```

#### Po:

```typescript
// Elastyczna konfiguracja
app.enableCors({
  origin: (origin, callback) => {
    // ✅ localhost i 127.0.0.1
    // ✅ Wszystkie .railway.app domeny
    // ✅ Wszystkie .vercel.app domeny
    // ✅ Multiple frontend URLs (FRONTEND_URL)
    // ✅ Logging zablokowanych originów
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "X-CSRF-Token", // Dodano
  ],
  exposedHeaders: ["Set-Cookie"], // Dodano
});
```

**Kluczowe usprawnienia:**

- ✅ Dodano wsparcie dla `127.0.0.1`
- ✅ Dodano wsparcie dla domen `.vercel.app`
- ✅ Obsługa wielu frontend URLs (oddzielonych przecinkami)
- ✅ Logowanie zablokowanych originów do debugowania
- ✅ Dodano wymagane headery dla cookies i CSRF
- ✅ Eksponowanie `Set-Cookie` header

### 2. Utworzono `athletics-platform/backend/railway.json`

Plik konfiguracyjny Railway z:

- Health check path: `/health`
- Restart policy: ON_FAILURE
- Health check timeout: 100s
- Reference do nixpacks.toml

### 3. Utworzono pliki pomocnicze

#### `RAILWAY_CORS_FIX.md`

Szczegółowa dokumentacja problemu i rozwiązania

#### `RAILWAY_QUICK_FIX.md`

Szybki przewodnik krok po kroku

#### `.env.railway.example`

Przykładowa konfiguracja zmiennych środowiskowych dla Railway

#### `test-railway-cors.html`

Interaktywny test CORS w przeglądarce

#### `test-railway-backend.ps1`

PowerShell script do testowania backendu Railway

---

## Jak to teraz działa?

### Development (localhost)

```
Frontend: http://localhost:3000
Backend:  http://localhost:3001
CORS:     ✅ Akceptowane (localhost)
```

### Production Railway

```
Frontend: https://frontend.railway.app
Backend:  https://backend.railway.app
CORS:     ✅ Akceptowane (.railway.app)
```

### Production Vercel + Railway

```
Frontend: https://app.vercel.app
Backend:  https://backend.railway.app
CORS:     ✅ Akceptowane (.vercel.app)
```

### Custom Domain

```
Frontend: https://athletics-platform.com
Backend:  https://api.athletics-platform.com
CORS:     ✅ Akceptowane (FRONTEND_URL env var)
```

---

## Konfiguracja zmiennych środowiskowych

### Minimalna konfiguracja (Railway):

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<64-character-secure-key>
NODE_ENV=production
```

### Zalecana konfiguracja (Railway):

```env
# Database
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT
JWT_SECRET=<64-character-secure-key>
JWT_EXPIRES_IN=7d

# Environment
NODE_ENV=production

# CORS - Frontend URLs (comma-separated)
FRONTEND_URL=https://your-frontend.railway.app

# Security
SECURE_COOKIES=true
HTTPS_ONLY=true
BCRYPT_ROUNDS=12

# Rate limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# PZLA
PZLA_MOCK_MODE=true
```

### Multiple frontends:

```env
FRONTEND_URL=https://app.railway.app,https://app.vercel.app,https://athletics-platform.com
```

---

## Testowanie

### 1. Health Check

```powershell
curl https://your-backend.railway.app/health
```

**Oczekiwany wynik:**

```json
{ "status": "ok", "timestamp": "2025-01-XX..." }
```

### 2. CORS Preflight

```powershell
curl -X OPTIONS https://your-backend.railway.app/health `
  -H "Origin: http://localhost:3000" `
  -H "Access-Control-Request-Method: GET" `
  -i
```

**Oczekiwany wynik:**

```
HTTP/2 204
access-control-allow-origin: http://localhost:3000
access-control-allow-credentials: true
access-control-allow-methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
```

### 3. PowerShell Test

```powershell
.\test-railway-backend.ps1 -BackendUrl "https://your-backend.railway.app"
```

### 4. Browser Test

1. Otwórz `test-railway-cors.html`
2. Wpisz URL backendu
3. Kliknij "Uruchom Wszystkie Testy"

---

## Troubleshooting

### "Not allowed by CORS"

**Przyczyna:** Origin nie pasuje do żadnej z dozwolonych kategorii

**Rozwiązanie:**

1. Sprawdź logi Railway: `railway logs`
2. Szukaj: `CORS blocked origin: <URL>`
3. Dodaj ten URL do `FRONTEND_URL` env variable

### "No 'Access-Control-Allow-Origin' header"

**Przyczyna:** Backend nie zwraca CORS headers

**Rozwiązanie:**

1. Sprawdź czy deployment Railway się powiódł
2. Sprawdź czy są błędy w logach
3. Zrestartuj service: Railway Dashboard → Restart

### Backend nie startuje

**Przyczyna:** Brakujące zmienne środowiskowe

**Rozwiązanie:**

1. Sprawdź `railway variables`
2. Upewnij się że `DATABASE_URL` i `JWT_SECRET` są ustawione
3. Dodaj brakujące: `railway variables set KEY=VALUE`

### 401 na /health endpoint

**Przyczyna:** Endpoint jest zabezpieczony

**Rozwiązanie:**

- To jest normalne dla niektórych endpointów
- `/health` **powinien** być publiczny
- Sprawdź czy w `main.ts` nie ma dodatkowych guards

---

## Security Considerations

### Production Checklist

- [ ] `JWT_SECRET` - bezpieczny, losowy, 64+ znaków
- [ ] `NODE_ENV=production`
- [ ] `SECURE_COOKIES=true` (wymaga HTTPS)
- [ ] `HTTPS_ONLY=true`
- [ ] `BCRYPT_ROUNDS=12` lub więcej
- [ ] `FRONTEND_URL` - tylko zaufane domeny
- [ ] Database używa SSL (`sslmode=require`)
- [ ] Rate limiting włączony

### Opcjonalne ulepszenia bezpieczeństwa

1. **Konkretne domeny zamiast wildcards:**

   ```env
   # Zamiast akceptować wszystkie .railway.app
   FRONTEND_URL=https://athletics-platform-production.railway.app
   ```

2. **Helmet.js dla dodatkowych headers:**

   ```typescript
   // W main.ts
   app.use(helmet());
   ```

3. **CSRF Protection:**
   ```typescript
   // W main.ts
   app.use(csurf());
   ```

---

## Next Steps

Po naprawieniu CORS:

1. ✅ Przetestuj logowanie
2. ✅ Przetestuj główne funkcje (zawody, rejestracje, wyniki)
3. ✅ Ustaw monitoring (Railway Dashboard → Monitoring)
4. ✅ Skonfiguruj custom domain (jeśli potrzebujesz)
5. ✅ Backup zmiennych środowiskowych
6. ✅ Dokumentuj production URLs

---

## Pliki zmienione

```
athletics-platform/backend/
├── src/main.ts                    ✏️ ZMIENIONY
├── railway.json                   ➕ NOWY
└── .env.railway.example          ➕ NOWY

Root/
├── RAILWAY_CORS_FIX.md           ➕ NOWY
├── RAILWAY_QUICK_FIX.md          ➕ NOWY
├── CORS_FIX_SUMMARY.md           ➕ NOWY (ten plik)
├── test-railway-cors.html        ➕ NOWY
└── test-railway-backend.ps1      ➕ NOWY
```

---

## Kontakt i wsparcie

Jeśli nadal masz problemy:

1. Sprawdź logi Railway
2. Użyj narzędzi testowych (HTML/PowerShell)
3. Sprawdź Browser Developer Tools (F12)
4. Zweryfikuj wszystkie zmienne środowiskowe

🎉 **Powodzenia z deploymentem!**
