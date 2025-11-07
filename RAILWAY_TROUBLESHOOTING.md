# 🔍 Railway Backend - Troubleshooting

## ❌ Problem: Healthcheck Failed

### Możliwe przyczyny:

1. **Brak DATABASE_URL** ⚠️
2. **Brak JWT_SECRET** ⚠️
3. **Port niepoprawnie skonfigurowany**
4. **Prisma nie może połączyć się z bazą**
5. **Aplikacja nie startuje z powodu błędów**

---

## 🛠️ PILNE KROKI - Railway Dashboard

### 1. Sprawdź Variables (NAJWAŻNIEJSZE!)

**Backend Service → Variables → RAW Editor**

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=WYGENERUJ_64_ZNAKOWY_KLUCZ
NODE_ENV=production
PORT=3001
FRONTEND_URL=http://localhost:3000
BCRYPT_ROUNDS=12
PZLA_MOCK_MODE=true
```

### 2. Dodaj PostgreSQL Database

Jeśli nie masz jeszcze bazy danych:

1. W tym samym Railway Project kliknij **New**
2. **Database** → **Add PostgreSQL**
3. Railway automatycznie utworzy `Postgres.DATABASE_URL`
4. **WAŻNE:** Połącz database z backend service:
   - Kliknij na PostgreSQL
   - **Connect** → wybierz Backend Service

### 3. Wygeneruj JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

Skopiuj output i wklej jako `JWT_SECRET` w Variables.

---

## 🔍 Sprawdź Logi Deployment

**Backend Service → Deployments → najnowszy → View Logs**

### Czego szukać:

#### ✅ Poprawne logi:
```
🔧 Starting bootstrap...
📦 Creating NestFactory...
✅ NestFactory created successfully
🔌 Connecting to database...
📍 DATABASE_URL: SET
✅ Database connected successfully
🔄 Running Prisma migrations...
🚀 Starting application...
📍 PORT env var: 3001
🚀 Backend running on port 3001
✅ Application listening on 0.0.0.0:3001
```

#### ❌ Błędne logi:

**"DATABASE_URL: NOT SET"**
→ Brak zmiennej DATABASE_URL! Dodaj PostgreSQL i ustaw zmienną.

**"Database connection failed"**
→ DATABASE_URL jest niepoprawny lub baza nie jest dostępna.

**"JWT_SECRET is required"**
→ Brak JWT_SECRET w Variables.

**"Port already in use"**
→ Railway source niepoprawnie ustawiony PORT.

---

## 🎯 Railway Settings Checklist

### Backend Service → Settings

#### General:
- ✅ **Root Directory**: `athletics-platform/backend`
- ✅ **Watch Paths**: `athletics-platform/backend/**`

#### Deploy:
- ✅ **Builder**: Docker (powinno automatycznie wykryć Dockerfile)
- ⚠️ Jeśli używa NIXPACKS, upewnij się że `nixpacks.toml` istnieje

#### Networking:
- ✅ Port powinien być automatycznie ustawiony przez Railway
- ✅ Healthcheck Path: `/health`

---

## 🔧 Testowanie Ręczne

### Test 1: Sprawdź czy backend odpowiada

```bash
curl https://nowaplatforma-production.up.railway.app/health
```

**Oczekiwany output:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "service": "athletics-platform-backend"
}
```

### Test 2: Sprawdź logi w czasie rzeczywistym

```bash
# Zainstaluj Railway CLI
npm install -g @railway/cli

# Zaloguj się
railway login

# Link do projektu
railway link

# Sprawdź logi
railway logs
```

---

## 🚨 Typowe Błędy i Rozwiązania

### 1. "Healthcheck failed - service unavailable"

**Rozwiązanie:**
- Sprawdź czy DATABASE_URL jest ustawione
- Sprawdź czy PostgreSQL service jest running
- Sprawdź logi - czy aplikacja w ogóle startuje

### 2. "Database connection failed: invalid connection string"

**Rozwiązanie:**
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**NIE:**
```env
DATABASE_URL=postgres://localhost:5432/mydb
```

Railway automatycznie zastąpi `${{Postgres.DATABASE_URL}}` z prawdziwym URL.

### 3. "Port 3001 already in use"

**Rozwiązanie:**
Railway automatycznie ustawia PORT. Sprawdź czy w Variables masz:
```env
PORT=3001
```

Albo usuń to całkowicie - Railway ustawi automatycznie.

### 4. "Cannot find module '@prisma/client'"

**Rozwiązanie:**
Build command musi zawierać `npx prisma generate`.

W Dockerfile mamy:
```dockerfile
RUN npx prisma generate && npm run build
```

### 5. "Prisma Schema not found"

**Rozwiązanie:**
Upewnij się że `prisma/schema.prisma` jest skopiowany w Dockerfile:
```dockerfile
COPY --from=builder /app/prisma ./prisma
```

---

## 🔄 Redeploy

Jeśli zmieniłeś Variables:

1. **Backend Service** → **Deployments**
2. Kliknij **⋮** (trzy kropki) → **Redeploy**

Railway automatycznie przebuduje i zrestartuje aplikację.

---

## 📊 Monitoring

### Railway Dashboard:

1. **Metrics** → Zobacz CPU, RAM, Network
2. **Deployments** → Historia deploymentów
3. **Events** → Wszystkie zdarzenia (crashes, restarts)

### Sprawdź czy aplikacja crashuje:

Jeśli widzisz cykl:
```
Starting...
Crash!
Restarting...
Starting...
Crash!
```

To znaczy że aplikacja ma błąd podczas startu. Sprawdź logi!

---

## 🎯 Następne Kroki

1. ✅ Dodaj PostgreSQL Database
2. ✅ Ustaw wszystkie zmienne środowiskowe (szczególnie DATABASE_URL i JWT_SECRET)
3. ✅ Sprawdź Root Directory: `athletics-platform/backend`
4. ✅ Redeploy
5. ✅ Sprawdź logi
6. ✅ Test healthcheck: `curl <backend-url>/health`

---

## 💡 Pro Tips

### Szybkie sprawdzenie zmiennych:

```bash
railway variables
```

### Szybki dostęp do bazy:

```bash
railway connect Postgres
```

### Shell do running container:

Railway nie oferuje shell, ale możesz dodać endpoint do debug:

```typescript
@Get('debug')
debug() {
  return {
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
    },
    prisma: 'check logs for connection status',
  };
}
```

**USUŃ TO PO DEBUG!** (nie chcesz ujawniać tych informacji publicznie)

---

Powodzenia! 🚀
