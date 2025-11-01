# Dokumentacja Zespołów Sztafetowych

## Przegląd

System obsługuje pełne zarządzanie zespołami sztafetowymi w zawodach lekkoatletycznych, zgodnie z międzynarodowymi standardami i praktykami stosowanymi w systemach takich jak Roster Athletics.

## Funkcjonalności

### 1. Zarządzanie Zespołami Sztafetowymi

#### Tworzenie Zespołu

- **Lokalizacja**: `/competitions/[id]/relay-teams`
- **Funkcje**:
  - Tworzenie nowego zespołu sztafetowego
  - Unikalna nazwa w ramach zawodów
  - Opcjonalne przypisanie klubu/organizacji
  - Automatyczne przypisanie twórcy zespołu

#### Skład Zespołu

- **Podstawowy skład**: 4 zawodników (pozycje 1-4)
- **Rezerwowi**: maksymalnie 2 zawodników (pozycje 5-6)
- **Walidacja**:
  - Każdy zawodnik może być tylko w jednym zespole
  - Pozycje muszą być unikalne w zespole
  - Minimum 4 podstawowych członków do rejestracji

### 2. Rejestracja do Konkurencji

#### Wymagania

- Zespół musi mieć co najmniej 4 podstawowych członków
- Konkurencja musi być typu `RELAY`
- Zespół nie może być już zarejestrowany do tej konkurencji

#### Czas Zgłoszeniowy

- Opcjonalny format: `MM:SS.CC` (np. `3:25.45`)
- Używany do sortowania listy startowej
- Walidacja formatu po stronie klienta i serwera

### 3. Lista Startowa

#### Sortowanie

1. Zespoły z czasem zgłoszeniowym (najlepszy na końcu)
2. Zespoły bez czasu zgłoszeniowego (alfabetycznie)

#### Wyświetlanie

- Numer startowy
- Nazwa zespołu i klub
- Czas zgłoszeniowy
- Pełny skład z pozycjami
- Oznaczenie rezerwowych

### 4. Wprowadzanie Wyników

#### Obsługiwane Formaty

- **Wynik**: Format `MM:SS.CC` (obowiązkowy)
- **Miejsce**: Pozycja w klasyfikacji
- **Punkty**: Dla systemów punktowych
- **Wiatr**: Pomiar wiatru (opcjonalny)
- **Uwagi**: Dodatkowe informacje

#### Statusy Wyników

- **DNF** (Did Not Finish) - nie ukończył
- **DNS** (Did Not Start) - nie wystartował  
- **DQ** (Disqualified) - dyskwalifikacja
- **Rekordy**: Oznaczenie rekordów krajowych/światowych

## Struktura Bazy Danych

### Tabela `RelayTeam`

```sql
- id: String (UUID)
- name: String (unikalna w ramach zawodów)
- club: String? (opcjonalny)
- competitionId: String
- createdById: String
- createdAt: DateTime
- updatedAt: DateTime
```

### Tabela `RelayTeamMember`

```sql
- id: String (UUID)
- teamId: String
- athleteId: String
- position: Int (1-6)
- isReserve: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

### Tabela `RelayTeamRegistration`

```sql
- id: String (UUID)
- teamId: String
- eventId: String
- seedTime: String? (format MM:SS.CC)
- createdAt: DateTime
- updatedAt: DateTime
```

### Tabela `RelayTeamResult`

```sql
- id: String (UUID)
- teamId: String
- eventId: String
- result: String (format MM:SS.CC)
- position: Int?
- points: Int?
- wind: String?
- reaction: String?
- splits: Json? (czasy międzyczasów)
- notes: String?
- isValid: Boolean
- isDNF: Boolean
- isDNS: Boolean
- isDQ: Boolean
- isNationalRecord: Boolean
- isWorldRecord: Boolean
- selectedForDopingControl: Boolean
- dopingControlStatus: DopingControlStatus
- createdAt: DateTime
- updatedAt: DateTime
```

## API Endpoints

### Zespoły Sztafetowe

- `POST /relay-teams` - Tworzenie zespołu
- `GET /relay-teams/competition/:competitionId` - Lista zespołów dla zawodów
- `GET /relay-teams/:id` - Szczegóły zespołu
- `PATCH /relay-teams/:id` - Aktualizacja zespołu
- `DELETE /relay-teams/:id` - Usuwanie zespołu

### Członkowie Zespołu

- `POST /relay-teams/:id/members` - Dodawanie członka
- `DELETE /relay-teams/:teamId/members/:memberId` - Usuwanie członka

### Rejestracje

- `POST /relay-teams/registrations` - Rejestracja do konkurencji
- `GET /relay-teams/events/:eventId/registrations` - Lista rejestracji dla konkurencji

### Wyniki

- `POST /relay-teams/results` - Dodawanie wyniku
- `GET /relay-teams/events/:eventId/results` - Wyniki konkurencji

## Komponenty Frontend

### Główne Komponenty

- `CreateRelayTeamDialog` - Dialog tworzenia zespołu
- `RelayTeamMembersManager` - Zarządzanie składem zespołu
- `RelayTeamRegistrationDialog` - Rejestracja do konkurencji
- `RelayEventStartList` - Lista startowa konkurencji
- `RelayResultsManager` - Wprowadzanie wyników

### Strony

- `/competitions/[id]/relay-teams` - Lista zespołów
- `/competitions/[id]/relay-teams/[teamId]` - Szczegóły zespołu
- `/competitions/[id]/relay-events/[eventId]` - Zarządzanie konkurencją sztafetową

## Walidacja i Bezpieczeństwo

### Walidacja Danych

- Format czasów: regex `/^\d{1,2}:\d{2}\.\d{2}$/`
- Pozycje członków: 1-4 dla podstawowych, 5-6 dla rezerwowych
- Unikalność nazw zespołów w ramach zawodów
- Minimum 4 podstawowych członków do rejestracji

### Autoryzacja

- Tylko twórca zespołu może go edytować/usuwać
- Wszystkie operacje wymagają uwierzytelnienia JWT
- Walidacja uprawnień na poziomie serwera

## Integracja z Istniejącym Systemem

### Typy Konkurencji

- Dodano `EventType.RELAY` do enum
- Konkurencje sztafetowe są rozpoznawane automatycznie
- Integracja z systemem rejestracji zawodników

### Kompatybilność

- Pełna kompatybilność z istniejącymi funkcjami
- Wykorzystanie wspólnych komponentów UI
- Spójny design z resztą aplikacji

## Przykłady Użycia

### Tworzenie Zespołu Sztafetowego

```typescript
const team = await createRelayTeam({
  name: "AZS Warszawa I",
  club: "AZS Warszawa",
  competitionId: "comp-123"
});
```

### Dodawanie Członka Zespołu

```typescript
await addRelayTeamMember(teamId, {
  athleteId: "athlete-123",
  position: 1,
  isReserve: false
});
```

### Rejestracja do Konkurencji

```typescript
await registerRelayTeamForEvent({
  teamId: "team-123",
  eventId: "event-456",
  seedTime: "3:25.45"
});
```

### Wprowadzanie Wyniku

```typescript
await addRelayTeamResult({
  teamId: "team-123",
  eventId: "event-456",
  result: "3:23.12",
  position: 1,
  wind: "+0.8",
  isNationalRecord: true
});
```

## Zgodność ze Standardami

System został zaprojektowany zgodnie z praktykami stosowanymi w profesjonalnych systemach zarządzania zawodami lekkoatletycznymi, takich jak:

- **Roster Athletics** - format rejestracji i zarządzania zespołami
- **World Athletics** - standardy wyników i rekordów
- **Międzynarodowe zawody** - format list startowych i protokołów wyników

## Rozszerzenia Przyszłe

### Planowane Funkcjonalności

- Import/export list startowych
- Automatyczne generowanie protokołów wyników
- Integracja z systemami pomiaru czasu
- Statystyki zespołów i zawodników
- Historia występów zespołów

### Optymalizacje

- Cache'owanie wyników
- Optymalizacja zapytań bazodanowych
- Kompresja danych dla dużych zawodów
- Offline support dla wprowadzania wyników
