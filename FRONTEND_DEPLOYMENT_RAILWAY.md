# 🚀 Frontend Deployment Guide - Railway

## Konfiguracja Frontend na Railway

### 📋 Krok 1: Utwórz nowy projekt/serwis

1. Zaloguj się do Railway: https://railway.app
2. Kliknij **"New Project"** → **"Deploy from GitHub repo"**
3. Wybierz repo: **`PrzemoWAkcji/Nowa_platforma`** (to samo co backend!)

### ⚙️ Krok 2: Konfiguracja Root Directory

Po utworzeniu serwisu:

1. Przejdź do **Settings** projektu frontendu
2. W sekcji **"Service Settings"** znajdź **"Root Directory"**
3. Ustaw: `athletics-platform/frontend`
4. Kliknij **"Save"**

### 🔧 Krok 3: Zmienne środowiskowe

W zakładce **"Variables"** dodaj następujące zmienne:

```bash
# Backend URL (twój backend na Railway)
NEXT_PUBLIC_API_URL=https://nowaplatforma-production.up.railway.app

# Node environment
NODE_ENV=production
```

### 🔨 Krok 4: Build & Deploy Commands

Railway powinno automatycznie wykryć Next.js, ale możesz sprawdzić/ustawić:

**Settings → Deploy:**

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Port**: `3000` (automatycznie wykryte)

### 📝 Krok 5: Deploy

1. Po zapisaniu wszystkich ustawień, Railway automatycznie uruchomi deployment
2. Poczekaj 2-3 minuty na zakończenie budowania
3. Railway automatycznie nada publiczny URL typu: `https://twoj-frontend.up.railway.app`

### ✅ Krok 6: Aktualizacja CORS w backendzie

Po deploymencie frontendu, musisz zaktualizować CORS w backendzie:

1. Przejdź do backendu na Railway
2. W zakładce **"Variables"** dodaj/zaktualizuj:

```bash
FRONTEND_URL=https://twoj-frontend-url.up.railway.app
```

3. Restart backendu (jeśli nie zrestartował się automatycznie)

---

## 🎉 Gotowe!

Twoja aplikacja powinna działać pod adresami:

- **Backend**: https://nowaplatforma-production.up.railway.app
- **Frontend**: https://twoj-frontend-url.up.railway.app

### 🔐 Logowanie

Użyj danych admina:

- **Email**: admin@athletics.pl
- **Hasło**: AdminPass2024!

---

## 🐛 Troubleshooting

### Problem: Frontend nie łączy się z backendem

**Rozwiązanie**: Sprawdź czy:

1. Zmienna `NEXT_PUBLIC_API_URL` jest ustawiona poprawnie
2. CORS w backendzie ma ustawiony poprawny `FRONTEND_URL`
3. Oba serwisy są uruchomione

### Problem: Build fails

**Rozwiązanie**: Sprawdź logi budowania i upewnij się, że:

1. Root Directory jest ustawiony na `athletics-platform/frontend`
2. `package.json` ma poprawne dependencies

### Problem: 404 na podstronach

**Rozwiązanie**: Next.js wymaga Server-Side Rendering. Upewnij się, że:

1. Start Command to `npm start` (NIE `npx serve` ani static hosting)
2. Railway wykrył projekt jako Next.js

---

## 📞 Pomoc

Jeśli masz problemy, sprawdź:

1. Logi deploymentu w Railway
2. Browser console (F12) dla błędów JavaScript
3. Network tab w DevTools dla błędów API
