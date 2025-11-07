# 🚨 RAILWAY BACKEND - PILNY CHECKLIST

Build przeszedł ✅, ale healthcheck nie działa ❌

To znaczy że **aplikacja crashuje podczas startu**.

---

## 🔥 WYKONAJ TERAZ - KROK PO KROKU:

### 1. Otwórz Railway Dashboard
```
https://railway.app
→ Twój projekt "nowaplatforma-production"
→ Backend Service
```

### 2. Sprawdź Logi Deployment
```
Deployments → najnowszy (ten co się nie udał) → View Logs
```

### Czego szukać w logach:

#### ✅ DOBRE LOGI (aplikacja działa):
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

#### ❌ BŁĘDNE LOGI - ZNAJDŹ KTÓRE:

**A) "DATABASE_URL: NOT SET"**
```
📍 DATABASE_URL: NOT SET
❌ Database connection failed
```
→ **ROZWIĄZANIE**: Dodaj PostgreSQL i ustaw zmienne (zobacz krok 3)

**B) "Error: JWT_SECRET is required"**
```
Error: JWT_SECRET is required or too short
```
→ **ROZWIĄZANIE**: Dodaj JWT_SECRET (zobacz krok 3)

**C) "ECONNREFUSED" lub "Connection refused"**
```
Error: connect ECONNREFUSED
```
→ **ROZWIĄZANIE**: Baza danych nie jest dostępna - sprawdź PostgreSQL service

**D) "Error: P1001: Can't reach database server"**
```
PrismaClientInitializationError: Can't reach database server
```
→ **ROZWIĄZANIE**: DATABASE_URL jest niepoprawny

**E) Aplikacja w ogóle nie startuje**
→ **ROZWIĄZANIE**: Sprawdź czy wszystkie moduły się budują

---

### 3. Dodaj/Sprawdź Zmienne Środowiskowe

**Backend Service → Variables → RAW Editor**

Skopiuj i wklej WSZYSTKO poniżej:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=WYGENERUJ_I_WKLEJ_TUTAJ
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000,https://twoj-frontend.vercel.app
SECURE_COOKIES=true
HTTPS_ONLY=true
BCRYPT_ROUNDS=12
PZLA_MOCK_MODE=true
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

**❗ ZMIEŃ:**
- `JWT_SECRET=WYGENERUJ_I_WKLEJ_TUTAJ` → wygeneruj poniżej i wklej

**Generowanie JWT_SECRET (na swoim komputerze):**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

Przykład output:
```
xK8vY2mN5pQ9rT3wZ7aB4cD6eF8gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ0aB1cD2eF3gH4==
```

Skopiuj to i użyj jako `JWT_SECRET`.

---

### 4. Dodaj PostgreSQL Database (jeśli jeszcze nie masz)

**W tym samym Railway Project:**

1. Kliknij **New** (prawy górny róg)
2. **Database** → **Add PostgreSQL**
3. Railway automatycznie utworzy bazę
4. Kliknij na nowo utworzony **PostgreSQL** service
5. **Settings** → **Connect** → wybierz **Backend Service**

Railway automatycznie ustawi zmienną `${{Postgres.DATABASE_URL}}`.

---

### 5. Sprawdź Root Directory

**Backend Service → Settings → Service**

- **Root Directory**: `athletics-platform/backend` ✅
- **Watch Paths**: `athletics-platform/backend/**` ✅

**Jeśli jest puste lub inne:**
1. Ustaw na `athletics-platform/backend`
2. Kliknij **Save**

---

### 6. Redeploy

**Po ustawieniu zmiennych i bazy:**

1. **Deployments** tab
2. Kliknij **⋮** (trzy kropki) obok najnowszego deployment
3. **Redeploy**

Railway zrestartuje aplikację z nowymi zmiennymi.

---

### 7. Sprawdź Logi Ponownie

**Po redeploy:**

Wróć do **View Logs** i sprawdź czy teraz widzisz:

```
✅ Database connected successfully
🚀 Backend running on port 3001
```

---

### 8. Test Healthcheck

**W przeglądarce otwórz:**
```
https://nowaplatforma-production.up.railway.app/health
```

**Oczekiwany output:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-07T...",
  "service": "athletics-platform-backend"
}
```

---

### 9. Test Debug Endpoint

**W przeglądarce otwórz:**
```
https://nowaplatforma-production.up.railway.app/debug
```

**Oczekiwany output:**
```json
{
  "env": {
    "DATABASE_URL": "SET ✅",
    "JWT_SECRET": "SET ✅",
    "NODE_ENV": "production",
    "PORT": "3001",
    "FRONTEND_URL": "..."
  }
}
```

**Jeśli coś jest "NOT SET ❌":**
→ Wróć do kroku 3 i dodaj brakujące zmienne

---

## 🔍 Jeśli NADAL nie działa:

### Sprawdź Railway Metrics:

**Backend Service → Metrics**

- **CPU**: Czy jest jakieś użycie?
- **Memory**: Czy rośnie pamięć?
- **Restart Count**: Czy aplikacja ciągle się restartuje?

### Jeśli aplikacja ciągle się restartuje (crash loop):

**Events tab** - Zobacz wszystkie crash events i timestamps.

**Najczęstsze przyczyny:**
1. Błąd w kodzie (sprawdź logi)
2. Brak wymaganej zmiennej środowiskowej
3. Baza danych nie jest dostępna
4. Port jest zajęty (mało prawdopodobne na Railway)

---

## 📞 Wyślij mi logi jeśli potrzebujesz pomocy

Skopiuj i wyślij mi:

1. **Logi z deploymentu** (pierwsze 50 linii)
2. **Logi z uruchomienia** (ostatnie 50 linii)
3. **Screenshot z Variables** (ukryj DATABASE_URL i JWT_SECRET!)
4. **Output z `/debug` endpoint** (jeśli działa)

---

## ✅ Checklist - Wykonaj PO KOLEI:

- [ ] Sprawdziłem logi deployment
- [ ] Dodałem wszystkie zmienne środowiskowe
- [ ] Wygenerowałem i dodałem JWT_SECRET
- [ ] Dodałem PostgreSQL database
- [ ] Połączyłem PostgreSQL z Backend Service
- [ ] Sprawdziłem Root Directory: `athletics-platform/backend`
- [ ] Wykonałem Redeploy
- [ ] Sprawdziłem nowe logi
- [ ] Przetestowałem `/health` endpoint
- [ ] Przetestowałem `/debug` endpoint

---

## 🎯 Jeśli WSZYSTKO działa:

```
✅ /health → status: ok
✅ /debug → wszystkie zmienne SET ✅
✅ Logi pokazują "Backend running on port 3001"
```

**Gratulacje! Backend działa! 🎉**

Następny krok: Deploy frontendu na Vercel i połącz z backendem.

---

**ZACZYNAJ OD KROKU 1 - SPRAWDŹ LOGI!** 🔍
