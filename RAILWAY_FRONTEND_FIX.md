# 🎨 Railway Frontend - Konfiguracja

## ✅ Backend działa!
```
https://nowaplatforma-production.up.railway.app/health → OK ✅
```

Teraz skonfigurujmy frontend na Railway.

---

## 🛠️ Railway Dashboard - Frontend Service

### 1. Settings → General

**Root Directory:**
```
athletics-platform/frontend
```

**Watch Paths:**
```
athletics-platform/frontend/**
```

---

### 2. Variables → RAW Editor

Dodaj tę zmienną:

```env
NEXT_PUBLIC_API_URL=https://nowaplatforma-production.up.railway.app
NODE_ENV=production
```

**⚠️ WAŻNE:** 
- NIE dodawaj `/api` na końcu URL!
- Frontend używa Next.js rewrites, więc URL powinien być czysty

---

### 3. Sprawdź Build Settings

Railway powinno automatycznie wykryć:

**Builder:** NIXPACKS (używa `nixpacks.toml`)

**Build Command:** `npm install && npm run build`

**Start Command:** `npm start`

---

### 4. Networking → Custom Domain (opcjonalne)

Jeśli chcesz własną domenę dla frontendu:

1. **Networking** → **Custom Domain**
2. Dodaj swoją domenę
3. Ustaw CNAME w DNS

Lub użyj automatycznego Railway URL:
```
https://twoj-frontend.up.railway.app
```

---

### 5. Redeploy Frontend

Po ustawieniu zmiennych:

1. **Deployments** tab
2. Kliknij **⋮** → **Redeploy**

Railway przebuduje frontend z nową konfiguracją.

---

## 🔍 Sprawdź Logi

**Deployments → View Logs**

### Szukaj:

✅ **Poprawne logi:**
```
> next build
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    XXX kB         XXX kB
├ ○ /auth/login                          XXX kB         XXX kB
...

> next start
- ready started server on 0.0.0.0:3000
```

❌ **Błędne logi:**
```
Error: NEXT_PUBLIC_API_URL is not defined
Failed to compile
Module not found
```

---

## 🧪 Test Frontendu

### 1. Otwórz URL frontendu

```
https://twoj-frontend.up.railway.app
```

Powinieneś zobaczyć główną stronę aplikacji.

### 2. Sprawdź DevTools Console

**F12 → Console**

Szukaj błędów CORS lub API:
- ❌ `CORS error`
- ❌ `Failed to fetch`
- ❌ `net::ERR_CONNECTION_REFUSED`

Jeśli widzisz błędy CORS, wróć do backendu i sprawdź `FRONTEND_URL` w Variables.

### 3. Test logowania

Spróbuj się zalogować:

1. Kliknij **Login**
2. Użyj testowych danych (jeśli masz)
3. Sprawdź czy request idzie do backendu

**DevTools → Network → Filter: Fetch/XHR**

Powinno być:
```
Request URL: https://nowaplatforma-production.up.railway.app/auth/login
Status: 200 OK (lub 400 jeśli błędne dane)
```

---

## 🔄 Aktualizacja Backend CORS

Jeśli frontend ma inny URL niż `localhost`, dodaj go do backendu:

**Backend Service → Variables**

Zaktualizuj `FRONTEND_URL`:
```env
FRONTEND_URL=http://localhost:3000,https://twoj-frontend.up.railway.app
```

Następnie **Redeploy** backend.

---

## 🎯 Checklist Frontend

- [ ] Root Directory: `athletics-platform/frontend` ✅
- [ ] NEXT_PUBLIC_API_URL ustawiony ✅
- [ ] Redeploy wykonany ✅
- [ ] Build przeszedł pomyślnie ✅
- [ ] Frontend ładuje się w przeglądarce ✅
- [ ] Brak błędów CORS ✅
- [ ] Logowanie działa ✅

---

## 🐛 Troubleshooting

### Problem: "Failed to fetch" w konsoli

**Rozwiązanie:**
1. Sprawdź czy `NEXT_PUBLIC_API_URL` jest ustawiony
2. Sprawdź czy backend działa: `https://nowaplatforma-production.up.railway.app/health`
3. Sprawdź CORS w backendzie

### Problem: "CORS error"

**Rozwiązanie:**
1. Backend → Variables → Dodaj frontend URL do `FRONTEND_URL`
2. Redeploy backend

### Problem: Build fails

**Rozwiązanie:**
1. Sprawdź logi - jaki błąd?
2. Upewnij się że `package.json` ma wszystkie dependencies
3. Sprawdź czy TypeScript kompiluje się lokalnie: `npm run build`

### Problem: Strona ładuje się ale jest pusta

**Rozwiązanie:**
1. F12 → Console - szukaj błędów JavaScript
2. Sprawdź czy wszystkie assets się załadowały
3. Sprawdź czy Next.js używa poprawnego output mode (mamy `standalone`)

---

## 🎉 Gdy wszystko działa:

```
✅ Frontend: https://twoj-frontend.up.railway.app
✅ Backend: https://nowaplatforma-production.up.railway.app
✅ Database: PostgreSQL na Railway
✅ CORS: Poprawnie skonfigurowany
✅ Auth: Logowanie działa
```

**GRATULACJE!** 🚀

Pełna aplikacja działa na Railway!

---

## 💰 Railway Pricing

**Free Tier ($5 credit/miesiąc):**
- Backend + Frontend + Database = ~400-500h runtime
- Dla małej aplikacji: **wystarczy!** ✅

**Jeśli przekroczysz:**
- Railway wysyła email warning
- Możesz upgrade do Hobby Plan ($5/miesiąc)

---

## 📊 Monitoring

### Railway Dashboard:

**Metrics** → Zobacz dla każdego service:
- CPU usage
- Memory usage  
- Network traffic
- Build times

**Events** → Historia wszystkich deploymentów i crashy

**Logs** → Real-time logi dla każdego service

---

Gotowy? Ustaw zmienne i redeploy! 🚀
