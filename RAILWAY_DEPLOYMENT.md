# 🚂 RAILWAY DEPLOYMENT GUIDE

Railway to świetna alternatywa dla Vercel, szczególnie dla backendu z PostgreSQL.

## ✅ Zalety Railway:

- ✅ $5 darmowych creditów/miesiąc (~500h runtime)
- ✅ PostgreSQL database (darmowy tier)
- ✅ Łatwiejszy deployment backendu NestJS
- ✅ Lepsze logi i monitoring
- ✅ Wsparcie dla WebSocket (przydatne później)

---

## 🎯 DEPLOYMENT KROK PO KROKU

### 1️⃣ Przygotuj Repozytorium GitHub

```powershell
cd "c:\Users\Przemo\Projekty\nowa platforma"

# Jeśli nie masz jeszcze git repo
git init
git add .
git commit -m "Ready for Railway deployment"

# Stwórz repo na GitHub (https://github.com/new)
git remote add origin https://github.com/TWOJA_NAZWA/athletics-platform.git
git branch -M main
git push -u origin main
```

### 2️⃣ Stwórz Konto Railway

1. Idź do: **https://railway.app**
2. Kliknij **"Login"** → **"Login with GitHub"**
3. Autoryzuj Railway do dostępu do repo

### 3️⃣ Deploy Backendu na Railway

#### A. Stwórz Nowy Projekt

1. Kliknij **"New Project"**
2. Wybierz **"Deploy from GitHub repo"**
3. Wybierz repo: **athletics-platform**

#### B. Konfiguracja Backendu

1. Railway automatycznie wykryje projekt
2. Kliknij **"Add Variables"** i dodaj:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
```

3. **Settings** → **Deployment**:
   - **Root Directory**: `/athletics-platform/backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm run start:prod`

4. Kliknij **"Deploy"**

#### C. Dodaj PostgreSQL Database (POLECAM!)

1. W tym samym projekcie kliknij **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway automatycznie:
   - Stworzy bazę danych
   - Ustawi zmienną `DATABASE_URL`
   - Połączy z backendem

3. **Zaktualizuj Prisma Schema** dla PostgreSQL:

**W pliku: `athletics-platform/backend/prisma/schema.prisma`**

```prisma
datasource db {
  provider = "postgresql"  // było: "sqlite"
  url      = env("DATABASE_URL")
}
```

4. **Commit i push zmian:**

```powershell
git add .
git commit -m "Switch to PostgreSQL for Railway"
git push
```

Railway automatycznie przebuduje aplikację! 🚀

#### D. Sprawdź URL Backendu

1. Kliknij na backend service
2. Przejdź do **"Settings"** → **"Networking"**
3. Skopiuj **"Public Domain"** (np. `athletics-backend.up.railway.app`)

### 4️⃣ Deploy Frontendu na Vercel

Frontend najlepiej zostawić na Vercel (Next.js = Vercel):

1. **Idź do:** https://vercel.com
2. **Import Project** → Wybierz repo
3. **Konfiguracja:**

   ```
   Project Name: athletics-frontend
   Framework: Next.js
   Root Directory: athletics-platform/frontend

   Environment Variables:
   NEXT_PUBLIC_API_URL=https://athletics-backend.up.railway.app
   ```

4. **Deploy!**

### 5️⃣ Zaktualizuj CORS w Backendzie

Railway automatycznie redeploy przy każdym push do GitHub, więc:

**W pliku: `athletics-platform/backend/src/main.ts`**

```typescript
app.enableCors({
  origin: [
    "http://localhost:3000",
    "https://your-frontend.vercel.app", // dodaj swój URL
    "https://*.vercel.app", // wszystkie preview deployments
  ],
  credentials: true,
});
```

```powershell
git add .
git commit -m "Update CORS for production"
git push
```

### 6️⃣ Uruchom Migracje Bazy Danych

Railway automatycznie uruchomi `prisma migrate deploy` podczas buildu (jeśli dodane w build command).

Możesz też ręcznie przez Railway CLI:

```powershell
# Zainstaluj Railway CLI
npm install -g @railway/cli

# Zaloguj się
railway login

# Link do projektu
railway link

# Uruchom migracje
railway run npx prisma migrate deploy
```

---

## 🎉 GOTOWE!

**Twoja aplikacja działa:**

- Backend: `https://athletics-backend.up.railway.app`
- Frontend: `https://athletics-frontend.vercel.app`
- Database: PostgreSQL na Railway

---

## 🔥 DODATKOWE FUNKCJE RAILWAY

### Custom Domain

1. **Settings** → **Networking** → **Custom Domain**
2. Dodaj swoją domenę (np. `api.your-domain.com`)
3. Ustaw CNAME record w DNS:
   ```
   CNAME api.your-domain.com -> athletics-backend.up.railway.app
   ```

### Environment Variables dla różnych Branch

1. **Settings** → **Environments**
2. Stwórz nowe środowisko (Production, Staging, Development)
3. Ustaw różne zmienne dla każdego

### Monitoring & Logs

1. **Deployments** → kliknij na aktywny deployment
2. **View Logs** → logi w czasie rzeczywistym
3. **Metrics** → CPU, RAM, Network usage

### Database Backups

1. Kliknij na **PostgreSQL** service
2. **Data** → **Backups**
3. Railway robi automatyczne backupy co 24h

---

## 📊 KOSZTY

### Darmowy Tier:

- **$5 credit/miesiąc** (odnawia się co miesiąc)
- ~500 godzin runtime
- PostgreSQL 1GB storage
- 100GB egress (transfer)

### Płatny Plan (jeśli przekroczysz):

- **$0.000463/GB-sec** (RAM)
- **$0.000231/vCPU-sec** (CPU)
- **$0.10/GB** (egress)

Dla małej aplikacji darmowy tier jest **wystarczający!**

---

## 🐛 TROUBLESHOOTING

### Problem: Deploy fails z błędem Prisma

**Rozwiązanie:**

```powershell
# Dodaj do package.json w "scripts":
"postinstall": "prisma generate"
```

### Problem: Database connection error

**Rozwiązanie:**

1. Sprawdź czy `DATABASE_URL` jest ustawione w Railway
2. Sprawdź czy Prisma schema ma `provider = "postgresql"`
3. Uruchom migracje: `railway run npx prisma migrate deploy`

### Problem: CORS error

**Rozwiązanie:**

```typescript
// backend/src/main.ts
app.enableCors({
  origin: [
    "http://localhost:3000",
    "https://your-frontend.vercel.app",
    "https://*.vercel.app", // dla preview deployments
  ],
  credentials: true,
});
```

---

## 🔄 CI/CD (Automatyczny Deploy)

Railway automatycznie redeploy przy każdym `git push`!

**Wyłącz auto-deploy:**

1. **Settings** → **Service** → **Deployments**
2. Wyłącz "Auto Deploy from GitHub"

**Ręczny deploy:**

```powershell
railway up
```

---

## 📚 PRZYDATNE LINKI

- **Railway Docs:** https://docs.railway.app
- **Railway CLI:** https://docs.railway.app/develop/cli
- **Prisma + Railway:** https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway

---

## ✅ CHECKLIST

Po deployment sprawdź:

- [ ] Backend odpowiada: `https://your-backend.up.railway.app/health`
- [ ] Frontend ładuje się: `https://your-frontend.vercel.app`
- [ ] Login działa
- [ ] API endpoints odpowiadają
- [ ] Database działa (dodaj testowego usera)
- [ ] CORS jest poprawnie skonfigurowany

---

## 🎯 PORÓWNANIE: Railway vs Vercel Backend

| Funkcja          | Railway     | Vercel                      |
| ---------------- | ----------- | --------------------------- |
| **Cena**         | $5 credit/m | Darmowy                     |
| **PostgreSQL**   | ✅ Built-in | ⚠️ Płatny                   |
| **Long-running** | ✅ Tak      | ❌ Serverless (cold starts) |
| **WebSocket**    | ✅ Tak      | ⚠️ Ograniczone              |
| **Łatwość**      | ⭐⭐⭐⭐    | ⭐⭐⭐                      |
| **Deployment**   | Git push    | Git push                    |

**Moja rekomendacja:**

- **Backend:** Railway (lepsze dla NestJS + PostgreSQL)
- **Frontend:** Vercel (najlepsze dla Next.js)

---

Gotowy do deployment? Zaczynajmy! 🚀
