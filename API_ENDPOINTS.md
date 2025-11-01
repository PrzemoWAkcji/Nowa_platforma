# 🔌 API Endpoints - Athletics Platform

Base URL: `http://localhost:3001`

## 🔐 Authentication

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/auth/login` | Logowanie użytkownika | `{ email, password }` |
| POST | `/auth/register` | Rejestracja użytkownika | `{ email, password, firstName, lastName, role }` |
| GET | `/auth/profile` | Profil zalogowanego użytkownika | - |

## 👥 Users (Admin only)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/users` | Lista wszystkich użytkowników | - |
| GET | `/users/:id` | Szczegóły użytkownika | - |
| POST | `/users` | Tworzenie użytkownika | `{ email, password, firstName, lastName, role }` |
| PATCH | `/users/:id` | Aktualizacja użytkownika | `{ firstName?, lastName?, role?, isActive? }` |
| DELETE | `/users/:id` | Usunięcie użytkownika | - |

## 🏃‍♂️ Athletes

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/athletes` | Lista zawodników | - |
| GET | `/athletes/:id` | Szczegóły zawodnika | - |
| GET | `/athletes/coach/:coachId` | Zawodnicy trenera | - |
| POST | `/athletes` | Tworzenie zawodnika | `{ firstName, lastName, dateOfBirth, gender, category, club?, nationality?, coachId? }` |
| PATCH | `/athletes/:id` | Aktualizacja zawodnika | `{ firstName?, lastName?, club?, ... }` |
| DELETE | `/athletes/:id` | Usunięcie zawodnika | - |

## 🏆 Competitions

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/competitions` | Lista zawodów | - |
| GET | `/competitions/public` | Publiczne zawody | - |
| GET | `/competitions/:id` | Szczegóły zawodów | - |
| POST | `/competitions` | Tworzenie zawodów | `{ name, description?, startDate, endDate, location, status? }` |
| PATCH | `/competitions/:id` | Aktualizacja zawodów | `{ name?, description?, startDate?, ... }` |
| DELETE | `/competitions/:id` | Usunięcie zawodów | - |

## 🎯 Events

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/events` | Lista konkurencji | - |
| GET | `/events/:id` | Szczegóły konkurencji | - |
| GET | `/events/competition/:competitionId` | Konkurencje zawodów | - |
| POST | `/events` | Tworzenie konkurencji | `{ name, type, gender, category, competitionId, startTime?, maxParticipants? }` |
| PATCH | `/events/:id` | Aktualizacja konkurencji | `{ name?, startTime?, ... }` |
| DELETE | `/events/:id` | Usunięcie konkurencji | - |

## 📝 Registrations

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/registrations` | Lista rejestracji | - |
| GET | `/registrations/:id` | Szczegóły rejestracji | - |
| GET | `/registrations/competition/:competitionId` | Rejestracje na zawody | - |
| GET | `/registrations/athlete/:athleteId` | Rejestracje zawodnika | - |
| POST | `/registrations` | Tworzenie rejestracji | `{ athleteId, eventId, seedTime? }` |
| PATCH | `/registrations/:id` | Aktualizacja rejestracji | `{ seedTime?, status? }` |
| DELETE | `/registrations/:id` | Usunięcie rejestracji | - |

## 🏅 Results

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/results` | Lista wyników | - |
| GET | `/results/:id` | Szczegóły wyniku | - |
| GET | `/results/event/:eventId` | Wyniki konkurencji | - |
| GET | `/results/athlete/:athleteId` | Wyniki zawodnika | - |
| POST | `/results` | Dodawanie wyniku | `{ athleteId, eventId, result, position?, wind?, reaction? }` |
| PATCH | `/results/:id` | Aktualizacja wyniku | `{ result?, position?, wind?, ... }` |
| DELETE | `/results/:id` | Usunięcie wyniku | - |

## 🏃‍♂️ Combined Events

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/combined-events` | Lista wielobojów | - |
| GET | `/combined-events/:id` | Szczegóły wieloboju | - |
| POST | `/combined-events` | Tworzenie wieloboju | `{ name, type, gender, category, events }` |
| PATCH | `/combined-events/:id` | Aktualizacja wieloboju | `{ name?, events?, ... }` |
| DELETE | `/combined-events/:id` | Usunięcie wieloboju | - |

## 📊 Statistics

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/stats/dashboard` | Statystyki dashboard | - |
| GET | `/stats/competitions` | Statystyki zawodów | - |
| GET | `/stats/athletes` | Statystyki zawodników | - |

## 🔍 Search

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/search/athletes` | Wyszukiwanie zawodników | `?q=nazwa&gender=M&category=SENIOR` |
| GET | `/search/competitions` | Wyszukiwanie zawodów | `?q=nazwa&status=PUBLISHED&location=miasto` |
| GET | `/search/results` | Wyszukiwanie wyników | `?athlete=id&event=id&from=date&to=date` |

## 📤 Import/Export

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/import/athletes` | Import zawodników | `FormData with CSV file` |
| POST | `/import/results` | Import wyników | `FormData with CSV/LIF file` |
| GET | `/export/athletes` | Export zawodników | - |
| GET | `/export/results/:eventId` | Export wyników | - |

## 🔒 Authorization Headers

Wszystkie chronione endpointy wymagają nagłówka:
```
Authorization: Bearer <JWT_TOKEN>
```

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🎯 Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## 🧪 Testing

### Przykładowe zapytania (curl):

```bash
# Logowanie
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@athletics.pl","password":"password123"}'

# Lista zawodników (z tokenem)
curl -X GET http://localhost:3001/athletes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Tworzenie zawodnika
curl -X POST http://localhost:3001/athletes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"firstName":"Jan","lastName":"Kowalski","dateOfBirth":"1990-01-01","gender":"MALE","category":"SENIOR"}'
```

---

**Dokumentacja API - Athletics Platform v1.0**