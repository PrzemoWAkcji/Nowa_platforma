# 🚀 SZYBKI DEPLOYMENT NA VERCEL (5 MINUT!)

## ✅ Checklist przed deploymentem:

- [ ] Masz konto GitHub
- [ ] Kod jest na GitHub
- [ ] Testy przechodzą lokalnie

---

## 🎯 KROK PO KROKU

### 1️⃣ Przygotuj Repozytorium GitHub (2 min)

```powershell
# W katalogu projektu
cd "c:\Users\Przemo\Projekty\nowa platforma"

# Jeśli nie masz jeszcze git repo
git init
git add .
git commit -m "Ready for deployment"

# Stwórz repo na GitHub (idź do https://github.com/new)
# Nazwa: athletics-platform
# Ustaw jako Public lub Private

# Dodaj remote i wypchnij kod
git remote add origin https://github.com/TWOJA_NAZWA/athletics-platform.git
git branch -M main
git push -u origin main
```

### 2️⃣ Deploy Backendu na Vercel (5 min)

#### A. Zaloguj się do Vercel

1. Idź do: **https://vercel.com/signup**
2. Zaloguj się przez **GitHub**
3. Autoryzuj Vercel do dostępu do repo

#### B. Import Projektu (Backend)

1. Kliknij **"Add New"** → **"Project"**
2. Wybierz repo: **athletics-platform**
3. Kliknij **"Import"**

#### C. Konfiguracja Backendu

```
Project Name: athletics-backend

Framework Preset: Other

Root Directory: athletics-platform/backend
   (kliknij "Edit" przy Root Directory i wybierz folder)

Build Settings:
   Build Command: npm run vercel-build
   Output Directory: dist
   Install Command: npm install

Environment Variables: (kliknij "Add")
   NODE_ENV = production
   JWT_SECRET = your-super-secret-jwt-key-minimum-32-characters-long
   DATABASE_URL = file:./prod.db
```

4. Kliknij **"Deploy"** 🚀

5. **Poczekaj 2-3 minuty** aż deployment się zakończy

6. **Skopiuj URL backendu:**
   ```
   Przykład: https://athletics-backend.vercel.app
   ```

### 3️⃣ Deploy Frontendu na Vercel (3 min)

#### A. Import Projektu (Frontend)

1. Kliknij **"Add New"** → **"Project"**
2. Wybierz to samo repo: **athletics-platform**
3. Kliknij **"Import"**

#### B. Konfiguracja Frontendu

```
Project Name: athletics-frontend

Framework Preset: Next.js (auto-detected)

Root Directory: athletics-platform/frontend
   (kliknij "Edit" przy Root Directory i wybierz folder)

Build Settings:
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install

Environment Variables: (kliknij "Add")
   NEXT_PUBLIC_API_URL = https://athletics-backend.vercel.app
   (użyj URL-a z kroku 2.6)
```

4. Kliknij **"Deploy"** 🚀

5. **Poczekaj 2-3 minuty** aż deployment się zakończy

6. **Skopiuj URL frontendu:**
   ```
   Przykład: https://athletics-frontend.vercel.app
   ```

### 4️⃣ Zaktualizuj CORS w backendzie (2 min)

#### A. Wróć do projektu backendu w Vercel

1. Kliknij na **athletics-backend**
2. Przejdź do **Settings** → **Environment Variables**
3. Dodaj nową zmienną:
   ```
   CORS_ORIGINS = https://athletics-frontend.vercel.app
   ```
4. Kliknij **"Save"**

#### B. Redeploy backendu

1. Przejdź do **Deployments**
2. Kliknij **"..."** przy najnowszym deployment
3. Kliknij **"Redeploy"**

### 5️⃣ Przetestuj Aplikację! 🎉

Otwórz w przeglądarce:

```
https://athletics-frontend.vercel.app
```

**Testuj:**

- ✅ Strona główna ładuje się
- ✅ Login działa
- ✅ API endpoints odpowiadają
- ✅ Dashboard działa

---

## 🔥 TROUBLESHOOTING

### Problem: Backend zwraca 500 error

**Rozwiązanie:**

1. Sprawdź **Vercel Dashboard** → **athletics-backend** → **Deployments** → kliknij na deployment
2. Przejdź do **Runtime Logs**
3. Znajdź błędy i popraw

**Typowe problemy:**

- Brak zmiennej `JWT_SECRET`
- Błąd w `DATABASE_URL`
- Brak `prisma generate`

### Problem: Frontend nie łączy się z backendem

**Rozwiązanie:**

1. Sprawdź czy `NEXT_PUBLIC_API_URL` jest poprawny
2. Sprawdź czy backend ma poprawnie skonfigurowane CORS
3. Otwórz DevTools (F12) → Console → sprawdź błędy

### Problem: Database nie działa

**Rozwiązanie SQLite:**
SQLite nie jest najlepsze dla Vercel (serverless). Rozważ migrację do PostgreSQL:

1. **Railway (Darmowy PostgreSQL):**
   - Idź do: https://railway.app
   - Dodaj PostgreSQL database
   - Skopiuj `DATABASE_URL`
   - Zaktualizuj w Vercel

2. **Albo użyj Vercel Postgres:**
   - Vercel Dashboard → Storage → Create → Postgres
   - Auto-konfiguracja `DATABASE_URL`

---

## 🎨 OPCJE DODATKOWE

### Custom Domain (domena własna)

1. **Kup domenę** (NameCheap, GoDaddy, OVH) - ~$10/rok
2. W Vercel: **Project Settings** → **Domains**
3. Dodaj swoją domenę (np. `athletics.example.com`)
4. Ustaw DNS records zgodnie z instrukcją Vercel

### Auto-Deploy z GitHub

**Już działa automatycznie!** ✅

Każdy `git push` na branch `main` automatycznie redeploy aplikację.

### Environment Variables dla różnych branch

1. **Project Settings** → **Environment Variables**
2. Wybierz environment: **Production**, **Preview**, lub **Development**
3. Ustaw różne wartości dla różnych środowisk

---

## 📊 MONITORING

### Vercel Dashboard pokazuje:

- ✅ **Deployment status** (success/failed)
- ✅ **Runtime Logs** (błędy aplikacji)
- ✅ **Analytics** (traffic, response times)
- ✅ **Build Logs** (logi budowania)

### Sprawdź Status Aplikacji:

**Backend Health:**

```
https://athletics-backend.vercel.app/health
```

**Frontend:**

```
https://athletics-frontend.vercel.app
```

**API Docs (tylko development):**

```
https://athletics-backend.vercel.app/api
```

---

## ✅ GOTOWE!

Twoja aplikacja działa online! 🎉

**URLs:**

- Frontend: `https://athletics-frontend.vercel.app`
- Backend: `https://athletics-backend.vercel.app`

**Następne kroki:**

- [ ] Dodaj custom domain
- [ ] Setup monitoring (już wbudowane w Vercel!)
- [ ] Rozważ PostgreSQL zamiast SQLite
- [ ] Skonfiguruj email notifications dla deployments

---

## 📞 POTRZEBUJESZ POMOCY?

1. **Vercel Docs:** https://vercel.com/docs
2. **Next.js Docs:** https://nextjs.org/docs
3. **NestJS Docs:** https://docs.nestjs.com

**Typowe błędy i rozwiązania:** Zobacz sekcję TROUBLESHOOTING powyżej.
