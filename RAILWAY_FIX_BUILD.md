# 🔧 Railway Build - Poprawki

## ✅ Co zostało poprawione:

### 1. **Backend** (`athletics-platform/backend/nixpacks.toml`)
- Zmieniono `npm ci` → `npm install` (bardziej niezawodne na Railway)
- Pozostawiono `npx prisma generate` i `npm run build`

### 2. **Frontend** (`athletics-platform/frontend/nixpacks.toml`)
- Zmieniono `npm ci` → `npm install`
- Pozostawiono `npm run build`

### 3. **Railway.json**
- Poprawiono konfigurację buildera

---

## 🎯 Railway Dashboard - Konfiguracja

### **Backend Service**

#### Settings → General:
- **Root Directory**: `athletics-platform/backend`
- **Watch Paths**: `athletics-platform/backend/**`

#### Variables (RAW Editor):
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=WYGENERUJ_KLUCZ_64_ZNAKI
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://twoj-frontend.vercel.app,http://localhost:3000
SECURE_COOKIES=true
HTTPS_ONLY=true
BCRYPT_ROUNDS=12
PZLA_MOCK_MODE=true
```

**Generowanie JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

#### Database:
1. Kliknij **New** → **Database** → **Add PostgreSQL**
2. Railway automatycznie ustawi `DATABASE_URL`
3. Połącz z backendem

---

### **Frontend Service**

#### Settings → General:
- **Root Directory**: `athletics-platform/frontend`
- **Watch Paths**: `athletics-platform/frontend/**`

#### Variables:
```env
NEXT_PUBLIC_API_URL=https://nowaplatforma-production.up.railway.app
NODE_ENV=production
```

**UWAGA:** NIE dodawaj `/api` na końcu URL!

---

## 🚀 Deployment

### 1. Commit i Push zmian:
```bash
git add .
git commit -m "Fix Railway build configuration"
git push
```

### 2. Railway automatycznie zacznie rebuild

### 3. Sprawdź logi:
- Railway Dashboard → Backend Service → Deployments → View Logs

---

## ✅ Checklist po Deploy

- [ ] Backend build przeszedł pomyślnie
- [ ] Sprawdź: `https://nowaplatforma-production.up.railway.app/health`
- [ ] Database połączona (sprawdź logi: "Database connected")
- [ ] Frontend build przeszedł pomyślnie
- [ ] Sprawdź frontend URL
- [ ] Test logowania działa
- [ ] CORS skonfigurowany poprawnie

---

## 🐛 Typowe błędy

### "Cannot find module 'prisma'"
**Rozwiązanie:** Build command zawiera `npx prisma generate` ✅

### "Database connection failed"
**Rozwiązanie:** 
1. Sprawdź czy PostgreSQL jest dodany w Railway
2. Upewnij się że `DATABASE_URL=${{Postgres.DATABASE_URL}}`

### "Port already in use"
**Rozwiązanie:** Railway automatycznie ustawi PORT, ale możesz dodać `PORT=3001` w Variables

### CORS Error
**Rozwiązanie:** Sprawdź czy `FRONTEND_URL` zawiera poprawny URL frontendu

---

## 📊 Railway Pricing

**Free Tier ($5 credit/miesiąc):**
- ~500 godzin runtime
- 1GB PostgreSQL storage
- 100GB transfer
- **Wystarczające dla małej/średniej aplikacji**

---

## 🎉 Gotowe!

Aplikacja powinna teraz buildować się poprawnie na Railway.

**Jeśli nadal są problemy:**
1. Sprawdź logi Railway (Deployments → View Logs)
2. Upewnij się, że Root Directory jest ustawiony na `athletics-platform/backend` lub `athletics-platform/frontend`
3. Sprawdź czy wszystkie zmienne środowiskowe są ustawione
4. Spróbuj **Redeploy** (Deployments → ⋮ → Redeploy)
