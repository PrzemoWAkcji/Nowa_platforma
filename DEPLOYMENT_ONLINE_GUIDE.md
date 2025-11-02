# 🚀 Deployment Online - Kompletny Przewodnik

## 📋 Spis Treści

1. [Opcja 1: Vercel (NAJŁATWIEJSZA - POLECAM!)](#opcja-1-vercel)
2. [Opcja 2: Railway + Vercel](#opcja-2-railway--vercel)
3. [Opcja 3: Render.com (All-in-One)](#opcja-3-rendercom)
4. [Opcja 4: VPS (Pełna kontrola)](#opcja-4-vps)

---

## 🌟 OPCJA 1: Vercel (NAJŁATWIEJSZA - 5 MINUT!)

### ✅ Zalety:

- ✅ **1-click deployment z GitHub**
- ✅ **Darmowy tier** (100GB bandwidth/miesiąc)
- ✅ Idealny dla Next.js (twórcy Next.js!)
- ✅ HTTPS automatycznie
- ✅ Custom domain za darmo
- ✅ CI/CD automatycznie
- ✅ Może hostować backend jako Serverless Functions

### 📝 Kroki:

#### 1. Przygotowanie Repozytorium GitHub

```powershell
# Jeśli jeszcze nie masz repo na GitHub, stwórz je:
# 1. Idź do https://github.com/new
# 2. Nazwa: athletics-platform
# 3. Public/Private (twój wybór)
# 4. Create repository

# Dodaj remote i push
cd "c:\Users\Przemo\Projekty\nowa platforma"
git init  # jeśli nie jest jeszcze git repo
git add .
git commit -m "Initial commit - ready for deployment"
git remote add origin https://github.com/TWOJA_NAZWA/athletics-platform.git
git push -u origin main
```

#### 2. Deploy Backendu na Vercel

**Utwórz: `athletics-platform/backend/vercel.json`**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/main.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/main.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**Utwórz: `athletics-platform/backend/api/index.ts`** (Vercel Serverless Entry Point)

```typescript
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module";
import { ValidationPipe } from "@nestjs/common";

let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule, {
      logger: ["error", "warn", "log"],
    });

    app.enableCors({
      origin: [
        "http://localhost:3000",
        "https://your-frontend.vercel.app", // zaktualizuj później
      ],
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    await app.init();
  }
  return app;
}

// Vercel Serverless Handler
export default async (req: any, res: any) => {
  const server = await bootstrap();
  return server.getHttpAdapter().getInstance()(req, res);
};
```

#### 3. Deploy przez Vercel Dashboard

1. **Idź do:** https://vercel.com/signup
2. **Zaloguj się** przez GitHub
3. **Import Project:**
   - Kliknij "Add New" → "Project"
   - Wybierz swoje repo `athletics-platform`
4. **Konfiguracja Backendu:**
   - **Project Name:** `athletics-backend`
   - **Framework Preset:** Other
   - **Root Directory:** `athletics-platform/backend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variables:**
     ```
     NODE_ENV=production
     JWT_SECRET=your-super-secret-jwt-key-min-32-chars
     DATABASE_URL=file:./dev.db
     ```
   - Kliknij **Deploy**

5. **Konfiguracja Frontendu:**
   - Powtórz proces dla frontendu
   - **Project Name:** `athletics-frontend`
   - **Framework Preset:** Next.js
   - **Root Directory:** `athletics-platform/frontend`
   - **Build Command:** `npm run build`
   - **Environment Variables:**
     ```
     NEXT_PUBLIC_API_URL=https://athletics-backend.vercel.app
     ```
   - Kliknij **Deploy**

#### 4. Gotowe! 🎉

Twoja aplikacja będzie dostępna pod:

- **Frontend:** `https://athletics-frontend.vercel.app`
- **Backend:** `https://athletics-backend.vercel.app`

---

## 🚂 OPCJA 2: Railway + Vercel (Backend + Frontend osobno)

### ✅ Zalety:

- ✅ Railway: 500h darmowo/miesiąc ($5 credit)
- ✅ PostgreSQL database (lepsze niż SQLite)
- ✅ Pełna kontrola nad backendem
- ✅ Łatwy setup

### 📝 Kroki:

#### 1. Deploy Backendu na Railway

1. **Idź do:** https://railway.app
2. **Zaloguj się** przez GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Wybierz swoje repo
5. **Konfiguracja:**
   - **Root Directory:** `/athletics-platform/backend`
   - **Environment Variables:**
     ```
     NODE_ENV=production
     PORT=3001
     JWT_SECRET=your-super-secret-jwt-key-min-32-chars
     DATABASE_URL=file:./prod.db
     ```
6. **Add PostgreSQL** (opcjonalnie - lepsze niż SQLite):
   - Kliknij "New" → "Database" → "PostgreSQL"
   - Railway automatycznie ustawi `DATABASE_URL`
   - **Zaktualizuj `schema.prisma`:**
     ```prisma
     datasource db {
       provider = "postgresql"  // było: sqlite
       url      = env("DATABASE_URL")
     }
     ```
7. **Deploy!**

#### 2. Deploy Frontendu na Vercel

1. **Idź do:** https://vercel.com
2. **Import Project** → Wybierz repo
3. **Konfiguracja:**
   - **Root Directory:** `/athletics-platform/frontend`
   - **Environment Variables:**
     ```
     NEXT_PUBLIC_API_URL=https://twoja-nazwa-backend.up.railway.app
     ```
4. **Deploy!**

#### 3. Zaktualizuj CORS w backendzie

**W pliku: `athletics-platform/backend/src/main.ts`**

```typescript
app.enableCors({
  origin: [
    "http://localhost:3000",
    "https://your-frontend.vercel.app", // dodaj swoją domenę
  ],
  credentials: true,
});
```

Zrób commit i push - Railway automatycznie przebuduje.

---

## 🎨 OPCJA 3: Render.com (All-in-One)

### ✅ Zalety:

- ✅ Darmowy tier (750h/miesiąc)
- ✅ PostgreSQL database (darmowy tier)
- ✅ HTTPS automatycznie
- ✅ Wszystko w jednym miejscu

### 📝 Kroki:

#### 1. Przygotowanie konfiguracji

**Utwórz: `athletics-platform/backend/render.yaml`**

```yaml
services:
  - type: web
    name: athletics-backend
    env: node
    plan: free
    buildCommand: npm install && npx prisma generate && npm run build
    startCommand: npm run start:prod
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        generateValue: true
      - key: DATABASE_URL
        fromDatabase:
          name: athletics-db
          property: connectionString

databases:
  - name: athletics-db
    plan: free
    databaseName: athletics
    user: athletics_user
```

**Utwórz: `athletics-platform/frontend/render.yaml`**

```yaml
services:
  - type: web
    name: athletics-frontend
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NEXT_PUBLIC_API_URL
        value: https://athletics-backend.onrender.com
```

#### 2. Deploy na Render

1. **Idź do:** https://render.com
2. **Sign Up** przez GitHub
3. **New Web Service**
4. Wybierz swoje repo
5. **Backend:**
   - Root Directory: `athletics-platform/backend`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm run start:prod`
   - Add PostgreSQL database
6. **Frontend:**
   - Root Directory: `athletics-platform/frontend`
   - Build Command: `npm run build`
   - Start Command: `npm start`

---

## 🖥️ OPCJA 4: VPS (DigitalOcean/Hetzner)

### ✅ Zalety:

- ✅ Pełna kontrola
- ✅ Najlepsza wydajność
- ✅ ~$5-10/miesiąc

### 📝 Kroki:

#### 1. Kup VPS

**Polecam:**

- **Hetzner Cloud:** €4.51/miesiąc (2 vCPU, 4GB RAM)
- **DigitalOcean:** $6/miesiąc (1 vCPU, 1GB RAM)
- **Vultr:** $6/miesiąc

#### 2. Setup Serwera

```bash
# SSH do serwera
ssh root@your-server-ip

# Update systemu
apt update && apt upgrade -y

# Zainstaluj Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Zainstaluj Nginx
apt install -y nginx

# Zainstaluj PM2 (process manager)
npm install -g pm2

# Zainstaluj Git
apt install -y git
```

#### 3. Clone Repo i Setup

```bash
# Clone repo
cd /var/www
git clone https://github.com/TWOJA_NAZWA/athletics-platform.git
cd athletics-platform

# Setup Backend
cd athletics-platform/backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

# Setup PM2
pm2 start npm --name "athletics-backend" -- run start:prod
pm2 save
pm2 startup

# Setup Frontend
cd ../frontend
npm install
npm run build

pm2 start npm --name "athletics-frontend" -- start
pm2 save
```

#### 4. Konfiguracja Nginx

**Utwórz: `/etc/nginx/sites-available/athletics`**

```nginx
# Backend
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Włącz konfigurację
ln -s /etc/nginx/sites-available/athletics /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 5. Setup SSL (HTTPS)

```bash
# Zainstaluj Certbot
apt install -y certbot python3-certbot-nginx

# Uzyskaj certyfikat SSL (darmowy Let's Encrypt)
certbot --nginx -d your-domain.com -d api.your-domain.com

# Auto-renewal
certbot renew --dry-run
```

---

## 🎯 PORÓWNANIE OPCJI

| Opcja                | Koszt         | Łatwość    | Wydajność  | Kontrola   | Czas Setup |
| -------------------- | ------------- | ---------- | ---------- | ---------- | ---------- |
| **Vercel**           | Darmowy       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐     | **5 min**  |
| **Railway + Vercel** | $5/miesiąc    | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | 15 min     |
| **Render**           | Darmowy       | ⭐⭐⭐⭐   | ⭐⭐⭐     | ⭐⭐⭐     | 20 min     |
| **VPS**              | $5-10/miesiąc | ⭐⭐       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 60+ min    |

---

## 🎯 MOJA REKOMENDACJA

### Dla szybkiego testu:

**→ OPCJA 1: Vercel** (5 minut, darmowy, najłatwiejszy)

### Dla produkcji:

**→ OPCJA 2: Railway + Vercel** (PostgreSQL, lepsza wydajność)

### Dla pełnej kontroli:

**→ OPCJA 4: VPS** (najlepsza wydajność, najtańszy długoterminowo)

---

## 📝 NASTĘPNE KROKI

Po wybraniu opcji deployment:

1. **Custom Domain** (opcjonalnie):
   - Kup domenę na: NameCheap, GoDaddy, OVH (~$10/rok)
   - Ustaw DNS records na platformie (Vercel/Railway/Render)

2. **Monitoring**:
   - Vercel/Railway/Render mają built-in monitoring
   - Dla VPS: postaw monitoring (patrz: `MONITORING_GUIDE.md`)

3. **Backup Database**:
   - PostgreSQL: automatyczne backupy na Railway/Render
   - SQLite: regularne kopie pliku `.db`

4. **CI/CD**:
   - GitHub Actions już skonfigurowane (`.github/workflows/`)
   - Automatyczny deploy przy każdym push do `main`

---

## ❓ FAQ

**Q: Czy mogę użyć GitHub Pages?**
A: Nie, GitHub Pages obsługuje tylko statyczne strony (HTML/CSS/JS). Nasza aplikacja ma backend (NestJS) i frontend z SSR (Next.js), więc potrzebujemy serwera Node.js.

**Q: Który hosting jest najlepszy?**
A: **Vercel** dla prostoty i szybkości. **Railway + Vercel** dla produkcji z PostgreSQL.

**Q: Ile to kosztuje?**
A: Vercel i Render mają darmowe tiery. Railway daje $5 credit/miesiąc (wystarczy na small app). VPS od $5-10/miesiąc.

**Q: Jak długo trwa deployment?**
A: Vercel: 5 minut. Railway: 15 minut. VPS: 60+ minut.

**Q: Czy będzie działać na darmowym tierze?**
A: Tak! Wszystkie opcje mają darmowe tiery wystarczające do testowania i małych projektów.

---

## 🚀 GOTOWY DO STARTU?

**Wybierz opcję i zaczynamy!**

Polecam zacząć od **Opcji 1 (Vercel)** - najprostsze i najszybsze! 🎯
