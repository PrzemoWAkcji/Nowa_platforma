# Personal Bests (PB) i Season Bests (SB) - Dokumentacja

## Przegląd

System automatycznie śledzi i aktualizuje rekordy życiowe (Personal Bests - PB) oraz rekordy sezonu (Season Bests - SB) dla wszystkich zawodników. Funkcjonalność jest zintegrowana z systemem wyników i wykorzystywana przy tworzeniu list startowych oraz rozstawianiu zawodników w seriach.

## Struktura danych

### Baza danych

Rekordy są przechowywane w polach JSON w tabeli `Athlete`:

```sql
-- Dodane pola do tabeli Athlete
personalBests Json? -- Rekordy życiowe
seasonBests   Json? -- Rekordy sezonu
```

### Format JSON

```json
{
  "100M": {
    "result": "10.50",
    "date": "2024-06-15",
    "competition": "Mistrzostwa Polski"
  },
  "LJ": {
    "result": "7.45",
    "date": "2024-07-01",
    "competition": "Memoriał Kusocińskiego"
  }
}
```

## Automatyczna aktualizacja

### Kiedy następuje aktualizacja

Rekordy są automatycznie aktualizowane przy:
- Dodawaniu nowego wyniku przez API `/results`
- Tylko dla ważnych wyników (isValid=true, isDNF=false, isDNS=false, isDQ=false)

### Logika aktualizacji

1. **Personal Best (PB)**: Aktualizowany gdy nowy wynik jest lepszy niż dotychczasowy rekord życiowy
2. **Season Best (SB)**: Aktualizowany gdy nowy wynik jest lepszy niż dotychczasowy rekord w danym roku

### Porównywanie wyników

- **Biegi**: Mniejszy czas = lepszy wynik
- **Skoki/Rzuty**: Większa odległość/wysokość = lepszy wynik

Obsługiwane formaty czasów:
- `"10.50"` - sekundy
- `"1:23.45"` - minuty:sekundy
- `"2:15:30.25"` - godziny:minuty:sekundy

## API Endpoints

### Zawodnicy

#### Pobierz rekordy zawodnika
```http
GET /athletes/{id}/records?event={eventName}
```

**Parametry:**
- `id` - ID zawodnika
- `event` (opcjonalny) - nazwa konkurencji (np. "100M")

**Odpowiedź:**
```json
{
  "athlete": {
    "id": "athlete-1",
    "firstName": "Jan",
    "lastName": "Kowalski"
  },
  "event": "100M",
  "personalBest": {
    "result": "10.50",
    "date": "2024-06-15",
    "competition": "Mistrzostwa Polski"
  },
  "seasonBest": {
    "result": "10.65",
    "date": "2024-05-20",
    "competition": "Liga Diamentowa"
  }
}
```

#### Ranking zawodników
```http
GET /athletes/rankings/{eventName}?sortBy={PB|SB}&gender={MALE|FEMALE}&category={category}&limit={number}
```

**Parametry:**
- `eventName` - nazwa konkurencji
- `sortBy` - sortowanie według PB lub SB (domyślnie PB)
- `gender` - płeć (opcjonalnie)
- `category` - kategoria wiekowa (opcjonalnie)
- `limit` - liczba wyników (domyślnie 50)

#### Czyszczenie rekordów sezonu
```http
POST /athletes/clear-season-bests?year={year}
```

### Rejestracje

#### Lista startowa posortowana według rekordów
```http
GET /registrations/start-list/{competitionId}/{eventId}?sortBy={PB|SB|SEED_TIME}
```

**Parametry:**
- `competitionId` - ID zawodów
- `eventId` - ID konkurencji
- `sortBy` - kryterium sortowania (domyślnie PB)

**Odpowiedź:**
```json
[
  {
    "id": "registration-1",
    "athlete": {
      "firstName": "Jan",
      "lastName": "Kowalski"
    },
    "records": {
      "personalBest": {
        "result": "10.50",
        "date": "2024-06-15",
        "competition": "Mistrzostwa Polski"
      },
      "seasonBest": {
        "result": "10.65",
        "date": "2024-05-20",
        "competition": "Liga Diamentowa"
      },
      "seedTime": "10.70"
    }
  }
]
```

## Integracja z organizacją zawodów

### Automatyczne rozstawianie w seriach

System automatycznie wykorzystuje PB i SB przy rozstawianiu zawodników:

1. **Priorytet czasów**:
   - Czas zgłoszeniowy (seed time)
   - Rekord sezonu (SB)
   - Rekord życiowy (PB)

2. **Metody rozstawiania**:
   - Wszystkie istniejące metody (SEED_TIME, SERPENTINE, etc.) automatycznie używają najlepszego dostępnego czasu

### Mapowanie nazw konkurencji

System automatycznie mapuje nazwy wydarzeń na standardowe kody:

```typescript
// Przykłady mapowania
"Bieg 100m mężczyzn" → "100M"
"Skok w dal kobiet" → "LJ"
"Pchnięcie kulą 5kg" → "SP5"
"110m przez płotki" → "110MH"
```

## Obsługiwane konkurencje

### Biegi
- `100M`, `200M`, `400M`, `800M`, `1500M`, `3000M`, `5000M`, `10000M`
- `110MH`, `100MH`, `400MH`, `80MH` (płotki)
- `600M`, `1000M`, `3000MSC` (specjalne)

### Skoki
- `LJ` (skok w dal)
- `HJ` (skok wzwyż)
- `PV` (skok o tyczce)
- `TJ` (trójskok)

### Rzuty
- `SP` (pchnięcie kulą)
- `SP3` (pchnięcie kulą 3kg)
- `SP5` (pchnięcie kulą 5kg)
- `DT` (rzut dyskiem)
- `HT` (rzut młotem)
- `JT` (rzut oszczepem)

## Przykłady użycia

### Dodanie wyniku z automatyczną aktualizacją PB/SB

```typescript
// Wynik zostanie automatycznie sprawdzony i zaktualizuje PB/SB
const result = await resultsService.create({
  athleteId: "athlete-1",
  eventId: "event-1",
  registrationId: "registration-1",
  result: "10.45",
  isValid: true
});

// Sprawdź czy to nowy rekord
console.log(result.isPersonalBest); // true/false
console.log(result.isSeasonBest);   // true/false
```

### Pobranie rankingu na 100m

```typescript
const ranking = await athletesService.getAthletesSortedByRecords(
  '100M',
  'PB',
  'MALE',
  'SENIOR',
  10
);
```

### Lista startowa posortowana według SB

```typescript
const startList = await registrationsService.getStartListSortedByRecords(
  'competition-1',
  'event-1',
  'SB'
);
```

## Uwagi techniczne

### Performance

- Rekordy są przechowywane jako JSON w bazie danych dla szybkiego dostępu
- Aktualizacja następuje tylko przy dodawaniu nowych wyników
- Sortowanie odbywa się w pamięci aplikacji

### Migracje

Dodanie pól PB/SB wymaga migracji bazy danych:

```bash
npx prisma migrate dev --name add_personal_season_bests
```

### Testy

Pełny zestaw testów jednostkowych znajduje się w:
- `src/athletes/athletes-records.service.spec.ts`

Uruchomienie testów:
```bash
npm test -- athletes-records.service.spec.ts
```

## Przyszłe rozszerzenia

### Planowane funkcjonalności

1. **Rekordy klubowe** - śledzenie najlepszych wyników w klubie
2. **Rekordy kategorii wiekowych** - automatyczne grupowanie według kategorii
3. **Import historycznych wyników** - masowe dodawanie starych rekordów
4. **Powiadomienia o rekordach** - automatyczne alerty przy nowych PB/SB
5. **Statystyki progresji** - analiza poprawy wyników w czasie

### API rozszerzenia

Planowane endpointy:
- `GET /athletes/{id}/progression/{event}` - historia wyników
- `GET /clubs/{id}/records` - rekordy klubowe
- `POST /athletes/import-historical-results` - import historii# Personal Bests (PB) i Season Bests (SB) - Dokumentacja

## Przegląd

System automatycznie śledzi i aktualizuje rekordy życiowe (Personal Bests - PB) oraz rekordy sezonu (Season Bests - SB) dla wszystkich zawodników. Funkcjonalność jest zintegrowana z systemem wyników i wykorzystywana przy tworzeniu list startowych oraz rozstawianiu zawodników w seriach.

## Struktura danych

### Baza danych

Rekordy są przechowywane w polach JSON w tabeli `Athlete`:

```sql
-- Dodane pola do tabeli Athlete
personalBests Json? -- Rekordy życiowe
seasonBests   Json? -- Rekordy sezonu
```

### Format JSON

```json
{
  "100M": {
    "result": "10.50",
    "date": "2024-06-15",
    "competition": "Mistrzostwa Polski"
  },
  "LJ": {
    "result": "7.45",
    "date": "2024-07-01",
    "competition": "Memoriał Kusocińskiego"
  }
}
```

## Automatyczna aktualizacja

### Kiedy następuje aktualizacja

Rekordy są automatycznie aktualizowane przy:
- Dodawaniu nowego wyniku przez API `/results`
- Tylko dla ważnych wyników (isValid=true, isDNF=false, isDNS=false, isDQ=false)

### Logika aktualizacji

1. **Personal Best (PB)**: Aktualizowany gdy nowy wynik jest lepszy niż dotychczasowy rekord życiowy
2. **Season Best (SB)**: Aktualizowany gdy nowy wynik jest lepszy niż dotychczasowy rekord w danym roku

### Porównywanie wyników

- **Biegi**: Mniejszy czas = lepszy wynik
- **Skoki/Rzuty**: Większa odległość/wysokość = lepszy wynik

Obsługiwane formaty czasów:
- `"10.50"` - sekundy
- `"1:23.45"` - minuty:sekundy
- `"2:15:30.25"` - godziny:minuty:sekundy

## API Endpoints

### Zawodnicy

#### Pobierz rekordy zawodnika
```http
GET /athletes/{id}/records?event={eventName}
```

**Parametry:**
- `id` - ID zawodnika
- `event` (opcjonalny) - nazwa konkurencji (np. "100M")

**Odpowiedź:**
```json
{
  "athlete": {
    "id": "athlete-1",
    "firstName": "Jan",
    "lastName": "Kowalski"
  },
  "event": "100M",
  "personalBest": {
    "result": "10.50",
    "date": "2024-06-15",
    "competition": "Mistrzostwa Polski"
  },
  "seasonBest": {
    "result": "10.65",
    "date": "2024-05-20",
    "competition": "Liga Diamentowa"
  }
}
```

#### Ranking zawodników
```http
GET /athletes/rankings/{eventName}?sortBy={PB|SB}&gender={MALE|FEMALE}&category={category}&limit={number}
```

**Parametry:**
- `eventName` - nazwa konkurencji
- `sortBy` - sortowanie według PB lub SB (domyślnie PB)
- `gender` - płeć (opcjonalnie)
- `category` - kategoria wiekowa (opcjonalnie)
- `limit` - liczba wyników (domyślnie 50)

#### Czyszczenie rekordów sezonu
```http
POST /athletes/clear-season-bests?year={year}
```

### Rejestracje

#### Lista startowa posortowana według rekordów
```http
GET /registrations/start-list/{competitionId}/{eventId}?sortBy={PB|SB|SEED_TIME}
```

**Parametry:**
- `competitionId` - ID zawodów
- `eventId` - ID konkurencji
- `sortBy` - kryterium sortowania (domyślnie PB)

**Odpowiedź:**
```json
[
  {
    "id": "registration-1",
    "athlete": {
      "firstName": "Jan",
      "lastName": "Kowalski"
    },
    "records": {
      "personalBest": {
        "result": "10.50",
        "date": "2024-06-15",
        "competition": "Mistrzostwa Polski"
      },
      "seasonBest": {
        "result": "10.65",
        "date": "2024-05-20",
        "competition": "Liga Diamentowa"
      },
      "seedTime": "10.70"
    }
  }
]
```

## Integracja z organizacją zawodów

### Automatyczne rozstawianie w seriach

System automatycznie wykorzystuje PB i SB przy rozstawianiu zawodników:

1. **Priorytet czasów**:
   - Czas zgłoszeniowy (seed time)
   - Rekord sezonu (SB)
   - Rekord życiowy (PB)

2. **Metody rozstawiania**:
   - Wszystkie istniejące metody (SEED_TIME, SERPENTINE, etc.) automatycznie używają najlepszego dostępnego czasu

### Mapowanie nazw konkurencji

System automatycznie mapuje nazwy wydarzeń na standardowe kody:

```typescript
// Przykłady mapowania
"Bieg 100m mężczyzn" → "100M"
"Skok w dal kobiet" → "LJ"
"Pchnięcie kulą 5kg" → "SP5"
"110m przez płotki" → "110MH"
```

## Obsługiwane konkurencje

### Biegi
- `100M`, `200M`, `400M`, `800M`, `1500M`, `3000M`, `5000M`, `10000M`
- `110MH`, `100MH`, `400MH`, `80MH` (płotki)
- `600M`, `1000M`, `3000MSC` (specjalne)

### Skoki
- `LJ` (skok w dal)
- `HJ` (skok wzwyż)
- `PV` (skok o tyczce)
- `TJ` (trójskok)

### Rzuty
- `SP` (pchnięcie kulą)
- `SP3` (pchnięcie kulą 3kg)
- `SP5` (pchnięcie kulą 5kg)
- `DT` (rzut dyskiem)
- `HT` (rzut młotem)
- `JT` (rzut oszczepem)

## Przykłady użycia

### Dodanie wyniku z automatyczną aktualizacją PB/SB

```typescript
// Wynik zostanie automatycznie sprawdzony i zaktualizuje PB/SB
const result = await resultsService.create({
  athleteId: "athlete-1",
  eventId: "event-1",
  registrationId: "registration-1",
  result: "10.45",
  isValid: true
});

// Sprawdź czy to nowy rekord
console.log(result.isPersonalBest); // true/false
console.log(result.isSeasonBest);   // true/false
```

### Pobranie rankingu na 100m

```typescript
const ranking = await athletesService.getAthletesSortedByRecords(
  '100M',
  'PB',
  'MALE',
  'SENIOR',
  10
);
```

### Lista startowa posortowana według SB

```typescript
const startList = await registrationsService.getStartListSortedByRecords(
  'competition-1',
  'event-1',
  'SB'
);
```

## Uwagi techniczne

### Performance

- Rekordy są przechowywane jako JSON w bazie danych dla szybkiego dostępu
- Aktualizacja następuje tylko przy dodawaniu nowych wyników
- Sortowanie odbywa się w pamięci aplikacji

### Migracje

Dodanie pól PB/SB wymaga migracji bazy danych:

```bash
npx prisma migrate dev --name add_personal_season_bests
```

### Testy

Pełny zestaw testów jednostkowych znajduje się w:
- `src/athletes/athletes-records.service.spec.ts`

Uruchomienie testów:
```bash
npm test -- athletes-records.service.spec.ts
```

## Przyszłe rozszerzenia

### Planowane funkcjonalności

1. **Rekordy klubowe** - śledzenie najlepszych wyników w klubie
2. **Rekordy kategorii wiekowych** - automatyczne grupowanie według kategorii
3. **Import historycznych wyników** - masowe dodawanie starych rekordów
4. **Powiadomienia o rekordach** - automatyczne alerty przy nowych PB/SB
5. **Statystyki progresji** - analiza poprawy wyników w czasie

### API rozszerzenia

Planowane endpointy:
- `GET /athletes/{id}/progression/{event}` - historia wyników
- `GET /clubs/{id}/records` - rekordy klubowe
- `POST /athletes/import-historical-results` - import historii