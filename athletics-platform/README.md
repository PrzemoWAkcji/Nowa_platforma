# 🏃‍♂️ Athletics Platform

Profesjonalna platforma do zarządzania zawodami lekkoatletycznymi.

## 🚀 Status Projektu

### ✅ **Gotowe**
- **Backend (NestJS)**: API z bazą danych SQLite
- **Frontend (Next.js)**: Responsywny interfejs użytkownika
- **Database Schema**: Kompletny model danych Prisma
- **Competitions Module**: CRUD dla zawodów
- **Combined Events Module**: ✅ **KOMPLETNA IMPLEMENTACJA** wszystkich oficjalnych wielobojów
  - 4 oficjalne wieloboje World Athletics
  - 5 wielobojów Masters (WMA) z oznaczeniem [MASTERS]
  - 2 niestandardowe wieloboje U16 (zachowane)
  - Oficjalne współczynniki punktacji WMA 2023
- **Live Results Module**: ✅ **NOWA FUNKCJONALNOŚĆ** - Wyniki na żywo
  - Publiczne strony wyników z unikalnym tokenem
  - Auto-odświeżanie co 30 sekund
  - Responsywny design dla wszystkich urządzeń
  - Kontrola włączania/wyłączania przez organizatorów
- **Equipment Specifications**: ✅ **KOMPLETNA IMPLEMENTACJA** specyfikacji sprzętu
  - Wszystkie kategorie wiekowe (0-110+ lat)
  - Wysokości płotków zgodnie z przepisami PZLA 2023
  - Wagi przyrządów (kula, dysk, młot, oszczep)
  - Automatyczne przypisywanie przy tworzeniu konkurencji
- **Age Categories**: ✅ **ROZSZERZONE KATEGORIE WIEKOWE**
  - Kategorie dziecięce (AGE_5 do AGE_22)
  - Kategorie szkolne (CLASS_1 do CLASS_8)
  - Kategorie młodzieżowe (U8 do U23)
  - Kategorie Masters (M35 do M110)
  - Specjalna kategoria WIELE dla biegów mieszanych
- **CORS & Validation**: Skonfigurowane

### 🔄 **W Trakcie**
- Authentication module
- Frontend components
- API integration

## 🛠️ Technologie

### Backend
- **NestJS** - Framework Node.js
- **Prisma** - ORM i migracje bazy danych
- **SQLite** - Baza danych (łatwa do rozwoju)
- **TypeScript** - Typowanie statyczne
- **Class Validator** - Walidacja danych

### Frontend
- **Next.js 15** - React framework z App Router
- **Tailwind CSS** - Stylowanie
- **TypeScript** - Typowanie statyczne
- **TanStack Query** - Data fetching
- **Zustand** - State management

## 🚀 Uruchomienie

### Wymagania
- Node.js 18+
- npm

### Backend
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run start:dev
```
**Dostępne na**: http://localhost:3001

### Frontend
```bash
cd frontend
npm install
npm run dev
```
**Dostępne na**: http://localhost:3000

## 📋 API Endpoints

### Competitions
- `GET /competitions` - Lista zawodów
- `POST /competitions` - Stwórz zawody
- `GET /competitions/:id` - Szczegóły zawodów
- `PATCH /competitions/:id` - Aktualizuj zawody
- `DELETE /competitions/:id` - Usuń zawody
- `POST /competitions/:id/live-results/toggle` - Włącz/wyłącz wyniki na żywo
- `GET /competitions/live/:token` - Wyniki na żywo (JSON)
- `GET /competitions/agent/:agentId` - Pobierz zawody dla agenta

### Live Results
- `GET /live-results/:token` - Strona HTML z wynikami na żywo
- `GET /live-results/api/:token` - API endpoint dla wyników na żywo

### Events
- `POST /events/:id/complete` - Oznacz konkurencję jako zakończoną
- `POST /events/:id/ongoing` - Oznacz konkurencję jako w trakcie

### Equipment Specifications
- `GET /equipment/categories` - Lista wszystkich kategorii wiekowych
- `GET /equipment/specs` - Specyfikacje sprzętu dla kategorii/dyscypliny
- `GET /equipment/category-description` - Opis kategorii wiekowej

## 🗄️ Model Danych

### Główne Encje
- **User** - Użytkownicy systemu
- **Athlete** - Zawodnicy
- **Competition** - Zawody
- **Event** - Konkurencje
- **Registration** - Rejestracje
- **Result** - Wyniki

### Relacje
- User 1:N Competition (twórca)
- User 1:N Registration
- Athlete 1:N Registration
- Competition 1:N Event
- Competition 1:N Registration
- Registration N:M Event (przez RegistrationEvent)
- Registration 1:N Result

## 📁 Struktura Projektu

```
athletics-platform/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── competitions/    # Moduł zawodów
│   │   ├── combined-events/ # Moduł wielobojów (World Athletics + WMA)
│   │   ├── prisma/         # Prisma service
│   │   └── main.ts         # Entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Schema bazy danych
│   │   └── migrations/     # Migracje
│   └── package.json
├── frontend/               # Next.js App
│   ├── src/
│   │   └── app/           # App Router
│   └── package.json
├── OFFICIAL_COMBINED_EVENTS_DOCUMENTATION.md  # Dokumentacja wielobojów
└── README.md
```

## 🎯 Następne Kroki

### Priorytet 1: Authentication
- [ ] JWT strategy
- [ ] Login/Register endpoints
- [ ] Protected routes
- [ ] User context

### Priorytet 2: Frontend Integration
- [ ] API client setup
- [ ] Competitions list page
- [ ] Competition form
- [ ] Basic navigation

### Priorytet 3: Athletes Module
- [ ] Athletes CRUD
- [ ] Registration flow
- [ ] Results management

## 🏆 Wieloboje (Combined Events)

System obsługuje **wszystkie oficjalne wieloboje** zgodnie z przepisami:

### 📋 **Oficjalne World Athletics**
- **Dziesięciobój** (Decathlon) - mężczyźni
- **Siedmiobój** (Heptathlon) - kobiety  
- **Pięciobój Indoor** - mężczyźni i kobiety
- **Pięciobój Outdoor** - kobiety

### 🥇 **Masters (WMA) - kategorie 35+**
- **Dziesięciobój Masters** - mężczyźni 35+
- **Siedmiobój Masters** - kobiety 35+
- **Pięciobój Indoor Masters** - mężczyźni i kobiety 35+
- **Pięciobój Outdoor Masters** - różne dyscypliny dla mężczyzn i kobiet 35+
- **Pięciobój Rzutowy Masters** - tylko konkurencje rzutowe 35+

### 🔧 **Niestandardowe (zachowane)**
- **Pięciobój U16** - chłopcy i dziewczęta (niestandardowy)

**Dokumentacja**: Zobacz `OFFICIAL_COMBINED_EVENTS_DOCUMENTATION.md`  
**Raport implementacji**: Zobacz `FINAL_IMPLEMENTATION_REPORT.md`

### 🎉 **Status: IMPLEMENTACJA ZAKOŃCZONA POMYŚLNIE**
- ✅ Wszystkie oficjalne wieloboje World Athletics
- ✅ Wszystkie wieloboje Masters (WMA) z wyraźnym oznaczeniem
- ✅ Oficjalne współczynniki punktacji zgodne z WMA 2023
- ✅ Różne dyscypliny dla płci w Pięcioboju Outdoor Masters
- ✅ Specjalny Pięciobój Rzutowy Masters (tylko rzuty)
- ✅ Kompletne API i dokumentacja

## 📺 Wyniki na żywo

### ✨ **Nowa funkcjonalność**
System wyników na żywo umożliwia publiczne wyświetlanie aktualnych wyników zawodów w czasie rzeczywistym.

#### Funkcjonalności:
- **Unikalny token dostępu** dla każdych zawodów
- **Auto-odświeżanie** co 30 sekund
- **Responsywny design** dla wszystkich urządzeń
- **Kontrola dostępu** przez organizatorów
- **Podział na sekcje**: zakończone i trwające konkurencje
- **Specyfikacje sprzętu**: wysokości płotków, wagi przyrządów

#### Przykładowy URL:
```
https://your-domain.com/live-results/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Dokumentacja**: Zobacz `LIVE_RESULTS_DOCUMENTATION.md`

## ⚙️ Specyfikacje sprzętu

### ✨ **Kompletna implementacja**
System automatycznie przypisuje odpowiednie specyfikacje sprzętu na podstawie kategorii wiekowej, płci i dyscypliny.

#### Obsługiwane kategorie:
- **Dziecięce**: AGE_5 do AGE_22 (poszczególne roczniki)
- **Szkolne**: CLASS_1 do CLASS_8
- **Młodzieżowe**: U8 do U23
- **Seniorskie**: SENIOR
- **Masters**: M35 do M110 (co 5 lat)
- **Specjalne**: WIELE (biegi mieszane)

#### Specyfikacje zgodne z PZLA 2023:
- **Wysokości płotków**: 110m, 100m, 400m, 80m, 60m
- **Wagi kuli**: 1kg do 7.26kg
- **Wagi dysku**: 0.5kg do 2kg
- **Wagi młota**: 2kg do 7.26kg
- **Wagi oszczepów**: 300g do 800g

**Dokumentacja**: Zobacz `EQUIPMENT_SPECIFICATIONS_DOCUMENTATION.md`

## 🧪 Testowanie

### Backend API
```bash
# Test competitions endpoint
curl http://localhost:3001/competitions

# Test wielobojów - dostępne typy
curl http://localhost:3001/combined-events/types

# Test dyscyplin dla konkretnego wieloboju
curl "http://localhost:3001/combined-events/types/DECATHLON_MASTERS/disciplines?gender=MALE"

# Test kategorii wiekowych
curl http://localhost:3001/equipment/categories

# Test specyfikacji sprzętu
curl "http://localhost:3001/equipment/specs?category=U16&discipline=SHOT_PUT&gender=MALE"

# Create competition z wynikami na żywo
curl -X POST http://localhost:3001/competitions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Competition",
    "startDate": "2025-08-01T10:00:00Z",
    "endDate": "2025-08-01T18:00:00Z",
    "location": "Warsaw",
    "type": "OUTDOOR",
    "liveResultsEnabled": true
  }'

# Włącz wyniki na żywo
curl -X POST http://localhost:3001/competitions/COMPETITION_ID/live-results/toggle \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'

# Create event z automatycznymi specyfikacjami sprzętu
curl -X POST http://localhost:3001/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "100m płotki U16 kobiety",
    "type": "TRACK",
    "gender": "FEMALE",
    "category": "U16",
    "discipline": "100M_HURDLES",
    "competitionId": "competition-uuid"
  }'

# Oznacz konkurencję jako zakończoną
curl -X POST http://localhost:3001/events/EVENT_ID/complete
```

### Frontend
Otwórz http://localhost:3000 i sprawdź interfejs.

### Wyniki na żywo
Otwórz http://localhost:3001/live-results/TOKEN (gdzie TOKEN to token z bazy danych) i sprawdź stronę wyników na żywo.

## 🐛 Troubleshooting

### Backend nie startuje
```bash
cd backend
npm install
npx prisma generate
npm run start:dev
```

### Frontend nie startuje
```bash
cd frontend
npm install
npm run dev
```

### Problemy z bazą danych
```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev --name init
```

## 📞 Wsparcie

Jeśli masz pytania lub problemy:
1. Sprawdź logi w terminalu
2. Upewnij się, że porty 3000 i 3001 są wolne
3. Sprawdź czy wszystkie dependencies są zainstalowane

---

**Status**: 🟢 Działający MVP gotowy do rozwoju!