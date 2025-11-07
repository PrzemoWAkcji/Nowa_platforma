# ✅ Railway Backend - Status

## Backend URL

`https://nowaplatforma-production.up.railway.app`

## Test Results

### ✅ Health Check

```
GET /health
Status: 200 OK
Response: {"status":"ok","timestamp":"...","service":"athletics-platform-backend"}
```

### ✅ CORS Configuration

```
OPTIONS /health
Status: 204 No Content
Access-Control-Allow-Origin: http://localhost:3000 ✅
Access-Control-Allow-Credentials: true ✅
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS ✅
```

### ✅ Auth Endpoint

```
POST /auth/login
Status: 400 Bad Request (endpoint działa, dane są nieprawidłowe)
```

## 🎉 CORS DZIAŁA POPRAWNIE!

---

## Poprawne Endpoints API

Backend **NIE** używa globalnego prefixu `/api`, więc wszystkie endpoints są bezpośrednio:

### Authentication

- `POST /auth/register` - Rejestracja użytkownika
- `POST /auth/login` - Logowanie
- `POST /auth/logout` - Wylogowanie
- `GET /auth/profile` - Profil użytkownika (wymaga auth)
- `GET /auth/me` - Dane aktualnego użytkownika (wymaga auth)

### Health

- `GET /health` - Status backendu

### Competitions

- `GET /competitions` - Lista zawodów
- `POST /competitions` - Tworzenie zawodów (wymaga auth)
- `GET /competitions/:id` - Szczegóły zawodów
- `PUT /competitions/:id` - Edycja zawodów (wymaga auth)
- `DELETE /competitions/:id` - Usuwanie zawodów (wymaga auth)

### Athletes

- `GET /athletes` - Lista zawodników
- `POST /athletes` - Dodawanie zawodnika (wymaga auth)
- `GET /athletes/:id` - Szczegóły zawodnika
- `PUT /athletes/:id` - Edycja zawodnika (wymaga auth)

### Events

- `GET /events` - Lista konkurencji
- `POST /events` - Dodawanie konkurencji (wymaga auth)
- `GET /events/:id` - Szczegóły konkurencji
- `PUT /events/:id` - Edycja konkurencji (wymaga auth)

### Registrations

- `GET /registrations` - Lista zgłoszeń
- `POST /registrations` - Dodawanie zgłoszenia (wymaga auth)
- `GET /registrations/:id` - Szczegóły zgłoszenia
- `DELETE /registrations/:id` - Usuwanie zgłoszenia (wymaga auth)

### Results

- `GET /results` - Lista wyników
- `POST /results` - Dodawanie wyniku (wymaga auth)
- `GET /results/:id` - Szczegóły wyniku
- `PUT /results/:id` - Edycja wyniku (wymaga auth)

---

## Zmienne środowiskowe Railway

### Wymagane (CRITICAL)

```env
DATABASE_URL=<twój-neon-postgresql-url>
JWT_SECRET=<64-character-secure-key>
NODE_ENV=production
```

### Zalecane

```env
JWT_EXPIRES_IN=7d
FRONTEND_URL=<twój-frontend-url>
SECURE_COOKIES=true
HTTPS_ONLY=true
BCRYPT_ROUNDS=12
PZLA_MOCK_MODE=true
```

---

## Jak ustawić zmienne na Railway

### Opcja 1: Railway Dashboard (zalecana)

1. Otwórz https://railway.app
2. Wybierz projekt "nowaplatforma-production"
3. Kliknij na backend service
4. Przejdź do **Variables**
5. Kliknij **RAW Editor**
6. Wklej wszystkie zmienne
7. Kliknij **Update Variables**

### Opcja 2: Railway CLI

```powershell
# Zaloguj się
railway login

# Link do projektu
railway link

# Ustaw zmienne
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=<wygeneruj-klucz>
railway variables set DATABASE_URL=<database-url>
railway variables set FRONTEND_URL=<frontend-url>
```

---

## Generowanie JWT_SECRET

**WAŻNE:** Użyj bezpiecznego, losowego klucza!

```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

Przykład output:

```
xK8vY2mN5pQ9rT3wZ7aB4cD6eF8gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ0aB1cD2==
```

Użyj tego jako `JWT_SECRET`.

---

## Frontend Configuration

W swoim frontendzie (Vercel/Railway) ustaw:

```env
NEXT_PUBLIC_API_URL=https://nowaplatforma-production.up.railway.app
```

**UWAGA:** NIE dodawaj `/api` na końcu!

---

## Test z frontendu

W kodzie frontendu użyj:

```typescript
// ✅ POPRAWNIE
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({ email, password }),
});

// ❌ ŹLE (nie dodawaj /api)
const response = await fetch(`${API_URL}/api/auth/login`, ...);
```

---

## Debugging

### Sprawdź logi Railway

```powershell
railway logs
```

Lub w Dashboard: **Backend Service** → **Deployments** → **View Logs**

### Sprawdź zmienne

```powershell
railway variables
```

### Test CORS z przeglądarki

Otwórz `test-railway-cors.html` i wpisz:

```
https://nowaplatforma-production.up.railway.app
```

---

## Następne kroki

### 1. Ustaw zmienne środowiskowe na Railway

Szczególnie:

- `JWT_SECRET` (wygeneruj bezpieczny klucz!)
- `DATABASE_URL` (jeśli nie jest już ustawiony)
- `FRONTEND_URL` (URL twojego frontendu)

### 2. Zaktualizuj frontend

Ustaw `NEXT_PUBLIC_API_URL` na:

```
https://nowaplatforma-production.up.railway.app
```

### 3. Przetestuj logowanie

Utwórz użytkownika testowego i sprawdź czy logowanie działa.

### 4. Sprawdź główne funkcje

- Tworzenie zawodów
- Dodawanie zawodników
- Rejestracje
- Wyniki

---

## 🎉 Status: CORS NAPRAWIONY!

Backend Railway działa poprawnie i akceptuje zapytania cross-origin.

Teraz musisz tylko:

1. Ustawić zmienne środowiskowe (szczególnie `JWT_SECRET`)
2. Zaktualizować frontend aby używał poprawnego URL
3. Przetestować wszystkie funkcje

Powodzenia! 🚀
