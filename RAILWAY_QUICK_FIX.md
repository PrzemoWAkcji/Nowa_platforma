# 🚀 Railway CORS - Szybka Naprawa

## Problem

Backend Railway nie odpowiada na zapytania z frontendu z powodu błędu CORS.

## Rozwiązanie - Krok po Kroku

### ✅ Krok 1: Zaktualizuj kod backendu

Kod został już zaktualizowany w `athletics-platform/backend/src/main.ts`.

Teraz musisz wdrożyć zmiany na Railway:

```powershell
# Commit zmian
cd "c:\Users\Przemo\Projekty\nowa platforma\athletics-platform\backend"
git add src/main.ts railway.json
git commit -m "Fix CORS configuration for Railway deployment"

# Push do Railway (jeśli połączone z Git)
git push
```

**LUB** jeśli używasz Railway CLI:

```powershell
cd "c:\Users\Przemo\Projekty\nowa platforma\athletics-platform\backend"
railway up
```

### ✅ Krok 2: Ustaw zmienne środowiskowe na Railway

#### Metoda A: Railway Dashboard (zalecana)

1. Otwórz [railway.app](https://railway.app)
2. Wybierz swój projekt
3. Kliknij na **backend service**
4. Przejdź do zakładki **Variables**
5. Kliknij **RAW Editor**
6. Wklej (i dostosuj):

```env
NODE_ENV=production
JWT_SECRET=<wygeneruj-bezpieczny-klucz-64-znaki>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://twoj-frontend.railway.app
SECURE_COOKIES=true
HTTPS_ONLY=true
BCRYPT_ROUNDS=12
PZLA_MOCK_MODE=true
```

7. Kliknij **Update Variables**

#### Metoda B: Railway CLI

```powershell
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=<wygeneruj-klucz>
railway variables set FRONTEND_URL=https://twoj-frontend.railway.app
```

#### 🔐 Generowanie JWT_SECRET

**WAŻNE:** Wygeneruj bezpieczny klucz!

```powershell
# W PowerShell:
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

Skopiuj wynik i użyj jako `JWT_SECRET`.

### ✅ Krok 3: Sprawdź czy DATABASE_URL jest ustawiony

W Railway Dashboard → Backend Service → Variables sprawdź:

- Jeśli masz **Railway PostgreSQL service**: ustaw `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- Jeśli używasz **Neon**: ustaw `DATABASE_URL` na twój Neon connection string

### ✅ Krok 4: Redeploy backendu

Po ustawieniu zmiennych, Railway automatycznie zrobi redeploy.

Możesz też wymusić redeploy:

```powershell
railway up --detach
```

Lub w Dashboard: **Deployments** → **Redeploy**

### ✅ Krok 5: Sprawdź logi

```powershell
# W terminalu:
railway logs

# Lub w Dashboard:
# Backend Service → Deployments → View Logs
```

Szukaj:

- ✅ `🚀 Backend running on http://...`
- ❌ Błędów typu `CORS blocked origin: ...`

### ✅ Krok 6: Testuj CORS

#### Opcja A: PowerShell Script

```powershell
.\test-railway-backend.ps1 -BackendUrl "https://twoj-backend.railway.app"
```

#### Opcja B: Browser Test

1. Otwórz `test-railway-cors.html` w przeglądarce
2. Wpisz URL backendu Railway
3. Kliknij "🔥 Uruchom Wszystkie Testy"
4. Sprawdź wyniki

#### Opcja C: curl

```powershell
# Test Health
curl https://twoj-backend.railway.app/health

# Test CORS
curl -X OPTIONS https://twoj-backend.railway.app/health `
  -H "Origin: http://localhost:3000" `
  -H "Access-Control-Request-Method: GET" `
  -i
```

### ✅ Krok 7: Zaktualizuj frontend

Upewnij się, że frontend ma poprawny `NEXT_PUBLIC_API_URL`:

```env
NEXT_PUBLIC_API_URL=https://twoj-backend.railway.app
```

---

## 🔍 Debugging

### Problem: "Not allowed by CORS"

**Sprawdź:**

1. Czy `FRONTEND_URL` zawiera dokładny URL frontendu?
2. Czy używasz HTTPS (nie HTTP) dla production?
3. Czy backend został zredeploy'owany po zmianach?

**Rozwiązanie:**

```powershell
# Sprawdź logi
railway logs

# Szukaj linii:
# "CORS blocked origin: https://example.com"
```

### Problem: "No 'Access-Control-Allow-Origin' header"

**Sprawdź:**

1. Czy zmiany w `main.ts` zostały wdrożone?
2. Czy backend się uruchomił bez błędów?

**Rozwiązanie:**

```powershell
# Wymuszenie redeploy
railway up --detach

# Sprawdź status
railway status
```

### Problem: Backend nie startuje

**Sprawdź:**

1. Czy `DATABASE_URL` jest ustawiony?
2. Czy `JWT_SECRET` jest ustawiony?

**Rozwiązanie:**

```powershell
# Sprawdź zmienne
railway variables

# Dodaj brakujące
railway variables set DATABASE_URL=<connection-string>
railway variables set JWT_SECRET=<secure-key>
```

---

## 📋 Checklist

Przed oznaczeniem jako "DZIAŁA", sprawdź:

- [ ] Backend deployment jest "Active" w Railway Dashboard
- [ ] Zmienne środowiskowe są ustawione (szczególnie `FRONTEND_URL`)
- [ ] Health check działa: `curl https://twoj-backend.railway.app/health`
- [ ] Test CORS przechodzi (użyj `test-railway-cors.html`)
- [ ] Logi nie pokazują błędów CORS
- [ ] Frontend może zalogować się do backendu
- [ ] Główne funkcje działają (tworzenie zawodów, rejestracja zawodników, etc.)

---

## 🆘 Nadal nie działa?

1. **Sprawdź dokładne URLs:**

   ```powershell
   # Backend URL (z Railway Dashboard)
   echo "Backend: https://twoj-backend.railway.app"

   # Frontend URL
   echo "Frontend: https://twoj-frontend.railway.app"
   ```

2. **Zweryfikuj FRONTEND_URL:**

   ```powershell
   railway variables | Select-String "FRONTEND_URL"
   ```

3. **Test z Browser Console:**
   - Otwórz frontend w przeglądarce
   - Naciśnij F12 → Console
   - Szukaj błędów CORS
   - Sprawdź Network tab → czy zapytania do backendu mają status 200/401 czy CORS error

4. **Ostateczny test:**
   ```powershell
   # Testuj bezpośrednio z przeglądarki
   # Otwórz: https://twoj-backend.railway.app/health
   # Powinno zwrócić JSON
   ```

---

## 📚 Dodatkowe zasoby

- [Railway Docs](https://docs.railway.app/)
- [NestJS CORS](https://docs.nestjs.com/security/cors)
- [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

## ✨ Po naprawieniu

Gdy wszystko działa:

1. **Zapisz zmienne środowiskowe** (backup)
2. **Przetestuj główne funkcje** aplikacji
3. **Włącz monitoring** (jeśli dostępny)
4. **Ustaw custom domain** (opcjonalnie)

---

## ⚠️ WAŻNE: Endpoints NIE używają prefixu /api

Backend **NIE** ma globalnego prefixu `/api`, więc wszystkie endpoints są bezpośrednio:

```
✅ POPRAWNIE: /auth/login
❌ ŹLE: /api/auth/login

✅ POPRAWNIE: /competitions
❌ ŹLE: /api/competitions
```

**W frontendzie użyj:**

```typescript
// ✅ POPRAWNIE
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email, password })
});

// ❌ ŹLE - nie dodawaj /api
fetch(`${API_URL}/api/auth/login`, ...)
```

**Konfiguracja .env frontendu:**

```env
# ✅ POPRAWNIE (bez /api na końcu)
NEXT_PUBLIC_API_URL=https://nowaplatforma-production.up.railway.app

# ❌ ŹLE
NEXT_PUBLIC_API_URL=https://nowaplatforma-production.up.railway.app/api
```

🎉 Gotowe!
