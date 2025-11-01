# 📚 PLATFORMA LA - KOMPLETNA DOKUMENTACJA API

## 🎯 Przegląd API

Platforma LA to zaawansowany system zarządzania zawodami lekkoatletycznymi, oferujący kompleksowe API do zarządzania:
- 🏃 Zawodnikami i rejestracji
- 🏆 Zawodami i wynikami
- 👥 Użytkownikami i autoryzacją
- 📊 Raportami i statystykami
- 🔒 Bezpieczeństwem i monitoringiem

## 🔗 Dostęp do API

### Base URL
```
http://localhost:3000/api
```

### Uwierzytelnianie
```http
Authorization: Bearer <JWT_TOKEN>
```

### Format odpowiedzi
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🏃 **ATHLETES & REGISTRATIONS**

### Zawodnicy

#### `GET /athletes`
Pobierz listę zawodników
```http
GET /api/athletes?page=1&limit=10&search=kowalski
```

**Parametry:**
- `page` (number, optional): Numer strony (domyślnie 1)
- `limit` (number, optional): Liczba wyników na stronę (domyślnie 10)
- `search` (string, optional): Wyszukiwanie po nazwisku

**Odpowiedź:**
```json
{
  "success": true,
  "data": {
    "athletes": [
      {
        "id": "uuid",
        "firstName": "Jan",
        "lastName": "Kowalski",
        "dateOfBirth": "1990-01-01",
        "gender": "MALE",
        "club": "AZS Warszawa",
        "category": "SENIOR"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "pages": 15
    }
  }
}
```

#### `POST /athletes`
Utwórz nowego zawodnika
```http
POST /api/athletes
Content-Type: application/json
Authorization: Bearer <token>

{
  "firstName": "Jan",
  "lastName": "Kowalski",
  "dateOfBirth": "1990-01-01",
  "gender": "MALE",
  "club": "AZS Warszawa"
}
```

### Rejestracje

#### `GET /registrations`
Pobierz listę rejestracji
```http
GET /api/registrations?competitionId=uuid&status=CONFIRMED
```

#### `POST /registrations`
Zarejestruj zawodnika na zawody
```http
POST /api/registrations
Content-Type: application/json
Authorization: Bearer <token>

{
  "athleteId": "uuid",
  "competitionId": "uuid",
  "eventIds": ["uuid1", "uuid2"],
  "seedTime": "10.50"
}
```

---

## 🏆 **COMPETITIONS & EVENTS**

### Zawody

#### `GET /competitions`
Pobierz listę zawodów
```http
GET /api/competitions?status=UPCOMING&type=OUTDOOR
```

**Parametry:**
- `status`: `UPCOMING`, `ONGOING`, `COMPLETED`
- `type`: `OUTDOOR`, `INDOOR`, `ROAD`
- `startDate`: Data rozpoczęcia (ISO format)
- `endDate`: Data zakończenia (ISO format)

#### `POST /competitions`
Utwórz nowe zawody
```http
POST /api/competitions
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Mistrzostwa Polski",
  "description": "Mistrzostwa Polski w lekkoatletyce",
  "startDate": "2024-07-01T10:00:00Z",
  "endDate": "2024-07-03T18:00:00Z",
  "location": "Warszawa",
  "type": "OUTDOOR",
  "status": "UPCOMING"
}
```

#### `GET /competitions/{id}`
Pobierz szczegóły zawodów
```http
GET /api/competitions/uuid
```

#### `PUT /competitions/{id}`
Aktualizuj zawody
```http
PUT /api/competitions/uuid
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Mistrzostwa Polski - Aktualizacja",
  "status": "ONGOING"
}
```

### Konkurencje

#### `GET /competitions/{id}/events`
Pobierz konkurencje w zawodach
```http
GET /api/competitions/uuid/events
```

#### `POST /competitions/{id}/events`
Dodaj konkurencję do zawodów
```http
POST /api/competitions/uuid/events
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "100m mężczyzn",
  "type": "TRACK",
  "gender": "MALE",
  "category": "SENIOR",
  "unit": "TIME"
}
```

---

## 📊 **RESULTS & SCORING**

### Wyniki

#### `GET /results`
Pobierz wyniki
```http
GET /api/results?competitionId=uuid&eventId=uuid
```

#### `POST /results`
Dodaj wynik
```http
POST /api/results
Content-Type: application/json
Authorization: Bearer <token>

{
  "athleteId": "uuid",
  "eventId": "uuid",
  "competitionId": "uuid",
  "result": "10.50",
  "unit": "TIME",
  "position": 1,
  "points": 1000
}
```

#### `PUT /results/{id}`
Aktualizuj wynik
```http
PUT /api/results/uuid
Content-Type: application/json
Authorization: Bearer <token>

{
  "result": "10.45",
  "position": 1,
  "points": 1020
}
```

### Punktacja

#### `GET /points/calculate`
Oblicz punkty dla wyniku
```http
GET /api/points/calculate?result=10.50&event=100M&gender=MALE&category=SENIOR
```

#### `GET /points/tables`
Pobierz tabele punktacyjne
```http
GET /api/points/tables?type=IAAF&gender=MALE
```

---

## 👥 **USERS & AUTHENTICATION**

### Uwierzytelnianie

#### `POST /auth/register`
Rejestracja użytkownika
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "Jan",
  "lastName": "Kowalski",
  "role": "USER"
}
```

#### `POST /auth/login`
Logowanie użytkownika
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Odpowiedź:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "Jan",
      "lastName": "Kowalski",
      "role": "USER"
    }
  }
}
```

#### `POST /auth/refresh`
Odświeżenie tokenu
```http
POST /api/auth/refresh
Content-Type: application/json
Authorization: Bearer <token>
```

#### `POST /auth/logout`
Wylogowanie użytkownika
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### Użytkownicy

#### `GET /users`
Pobierz listę użytkowników (Admin)
```http
GET /api/users?role=USER&page=1&limit=10
Authorization: Bearer <admin_token>
```

#### `GET /users/profile`
Pobierz profil użytkownika
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### `PUT /users/profile`
Aktualizuj profil użytkownika
```http
PUT /api/users/profile
Content-Type: application/json
Authorization: Bearer <token>

{
  "firstName": "Jan",
  "lastName": "Nowak",
  "phone": "+48123456789"
}
```

---

## 📄 **DOCUMENTS & FILES**

### Dokumenty

#### `GET /documents`
Pobierz listę dokumentów
```http
GET /api/documents?type=REGULATION&competitionId=uuid
```

#### `POST /documents`
Prześlij dokument
```http
POST /api/documents
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <binary_data>
type: "REGULATION"
competitionId: "uuid"
description: "Regulamin zawodów"
```

#### `GET /documents/{id}/download`
Pobierz dokument
```http
GET /api/documents/uuid/download
Authorization: Bearer <token>
```

#### `DELETE /documents/{id}`
Usuń dokument
```http
DELETE /api/documents/uuid
Authorization: Bearer <token>
```

---

## 🏃‍♂️ **SPECIALIZED EVENTS**

### Duathlon

#### `GET /duathlon/competitions`
Pobierz zawody duathlonowe
```http
GET /api/duathlon/competitions
```

#### `POST /duathlon/results`
Dodaj wynik duathlonowy
```http
POST /api/duathlon/results
Content-Type: application/json
Authorization: Bearer <token>

{
  "athleteId": "uuid",
  "competitionId": "uuid",
  "runTime1": "00:15:30",
  "bikeTime": "01:05:45",
  "runTime2": "00:18:20",
  "totalTime": "01:39:35",
  "position": 1
}
```

### Para-Athletics

#### `GET /para-athletics/classifications`
Pobierz klasyfikacje para-atletyczne
```http
GET /api/para-athletics/classifications
```

#### `POST /para-athletics/results`
Dodaj wynik para-atletyczny
```http
POST /api/para-athletics/results
Content-Type: application/json
Authorization: Bearer <token>

{
  "athleteId": "uuid",
  "eventId": "uuid",
  "classification": "T44",
  "result": "12.50",
  "worldRecord": false,
  "personalBest": true
}
```

---

## 📊 **REPORTS & ANALYTICS**

### Raporty

#### `GET /reports/competition/{id}`
Raport z zawodów
```http
GET /api/reports/competition/uuid?format=PDF
Authorization: Bearer <token>
```

#### `GET /reports/athlete/{id}`
Raport zawodnika
```http
GET /api/reports/athlete/uuid?season=2024
Authorization: Bearer <token>
```

#### `GET /reports/statistics`
Statystyki systemu
```http
GET /api/reports/statistics?period=MONTH
Authorization: Bearer <token>
```

---

## 🔒 **SECURITY & MONITORING**

### Bezpieczeństwo

#### `GET /security/dashboard`
Dashboard bezpieczeństwa (Admin)
```http
GET /api/security/dashboard
Authorization: Bearer <admin_token>
```

#### `GET /security/events`
Wydarzenia bezpieczeństwa
```http
GET /api/security/events?severity=HIGH&limit=50
Authorization: Bearer <admin_token>
```

#### `GET /security/ip-assessment/{ip}`
Ocena ryzyka IP
```http
GET /api/security/ip-assessment/192.168.1.1
Authorization: Bearer <admin_token>
```

### Monitoring

#### `GET /health`
Status zdrowia aplikacji
```http
GET /api/health
```

**Odpowiedź:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "healthy",
    "cache": "healthy",
    "redis": "healthy"
  },
  "uptime": 86400
}
```

#### `GET /metrics`
Metryki Prometheus
```http
GET /api/metrics
```

#### `GET /metrics/performance`
Metryki wydajności
```http
GET /api/metrics/performance
Authorization: Bearer <admin_token>
```

---

## 📋 **ERROR HANDLING**

### Standardowe kody błędów

| Kod | Znaczenie | Przykład |
|-----|-----------|----------|
| 200 | OK | Żądanie wykonane pomyślnie |
| 201 | Created | Zasób utworzony |
| 400 | Bad Request | Nieprawidłowe dane wejściowe |
| 401 | Unauthorized | Brak autoryzacji |
| 403 | Forbidden | Brak uprawnień |
| 404 | Not Found | Zasób nie znaleziony |
| 409 | Conflict | Konflikt danych |
| 422 | Unprocessable Entity | Błąd walidacji |
| 429 | Too Many Requests | Przekroczenie limitu żądań |
| 500 | Internal Server Error | Błąd serwera |

### Format błędów

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🔧 **RATE LIMITING**

### Limity żądań

| Endpoint | Limit | Okno czasowe |
|----------|-------|--------------|
| `/auth/login` | 5 żądań | 15 minut |
| `/auth/register` | 3 żądania | 60 minut |
| API ogólne | 100 żądań | 15 minut |
| Upload plików | 10 żądań | 60 minut |

### Nagłówki odpowiedzi

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 📝 **CHANGELOG**

### v1.0.0 (2024-01-01)
- ✅ Podstawowe API dla zawodników i zawodów
- ✅ System uwierzytelniania JWT
- ✅ Zarządzanie wynikami i punktacją
- ✅ System dokumentów i plików

### v1.1.0 (2024-02-01)
- ✅ Duathlon i Para-Athletics
- ✅ Zaawansowane raporty
- ✅ System bezpieczeństwa
- ✅ Monitoring i metryki

---

## 🚀 **QUICK START**

### 1. Rejestracja użytkownika
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 2. Logowanie
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'
```

### 3. Pobieranie danych
```bash
curl -X GET http://localhost:3000/api/competitions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📞 **SUPPORT**

- 📧 Email: support@platforma-la.com
- 📚 Dokumentacja: `/api-docs`
- 🐛 Issues: GitHub Issues
- 💬 Discord: Platforma LA Community

---

**Ostatnia aktualizacja:** 2024-12-28  
**Wersja API:** 1.1.0  
**Status:** ✅ Produkcja