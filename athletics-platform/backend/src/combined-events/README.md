# Moduł Wielobojów (Combined Events)

Kompletny system do obsługi wielobojów lekkoatletycznych z automatycznym przeliczaniem punktów według oficjalnych tabel IAAF/World Athletics.

## Obsługiwane wieloboje

### 🏃‍♂️ Dziesięciobój (Decathlon) - Mężczyźni
1. 100m
2. Skok w dal
3. Pchnięcie kulą
4. Skok wzwyż
5. 400m
6. 110m przez płotki
7. Rzut dyskiem
8. Skok o tyczce
9. Rzut oszczepem
10. 1500m

### 🏃‍♀️ Siedmiobój (Heptathlon) - Kobiety
1. 100m przez płotki
2. Skok wzwyż
3. Pchnięcie kulą
4. 200m
5. Skok w dal
6. Rzut oszczepem
7. 800m

### 🏃 Pięciobój (Pentathlon) - Indoor
1. 60m przez płotki
2. Skok wzwyż
3. Pchnięcie kulą
4. Skok w dal
5. 800m

## Formuły punktacji

System używa oficjalnych formuł IAAF/World Athletics:

### Biegi (Track Events)
```
Punkty = A × (B - T)^C
```
gdzie:
- T = czas w sekundach
- A, B, C = współczynniki specyficzne dla dyscypliny

### Skoki i rzuty (Field Events)
```
Punkty = A × (M - B)^C
```
gdzie:
- M = wynik w metrach (lub centymetrach dla skoków)
- A, B, C = współczynniki specyficzne dla dyscypliny

## API Endpoints

### Tworzenie wieloboju
```http
POST /combined-events
Content-Type: application/json

{
  "eventType": "DECATHLON",
  "athleteId": "athlete-id",
  "competitionId": "competition-id",
  "gender": "MALE"
}
```

### Aktualizacja wyniku dyscypliny
```http
PUT /combined-events/{id}/discipline/{discipline}
Content-Type: application/json

{
  "performance": "10.50",
  "wind": "+1.5"
}
```

### Pobieranie wieloboju
```http
GET /combined-events/{id}
```

### Ranking wieloboju
```http
GET /combined-events/competition/{competitionId}/ranking?eventType=DECATHLON
```

### Statystyki
```http
GET /combined-events/competition/{competitionId}/statistics
```

### Obliczanie punktów (pomocniczy)
```http
POST /combined-events/calculate-points
Content-Type: application/json

{
  "discipline": "100M",
  "performance": "10.50",
  "gender": "MALE"
}
```

### Walidacja wyniku (pomocniczy)
```http
POST /combined-events/validate-performance
Content-Type: application/json

{
  "discipline": "100M",
  "performance": "10.50"
}
```

## Formaty wyników

### Biegi
- Krótkie dystanse: `"10.50"` (sekundy)
- Długie dystanse: `"4:15.30"` (minuty:sekundy)

### Skoki
- Skok wzwyż/o tyczce: `"2.15"` (metry)
- Skok w dal: `"7.45"` (metry)

### Rzuty
- Wszystkie rzuty: `"15.50"` (metry)

## Przykłady użycia

### Tworzenie dziesięcioboju
```typescript
const decathlon = await combinedEventsService.createCombinedEvent({
  eventType: CombinedEventType.DECATHLON,
  athleteId: 'athlete-123',
  competitionId: 'competition-456',
  gender: 'MALE'
});
```

### Dodawanie wyniku
```typescript
const result = await combinedEventsService.updateEventResult(
  'combined-event-id',
  '100M',
  {
    performance: '10.50',
    wind: '+1.5'
  }
);
```

### Obliczanie punktów
```typescript
const points = combinedEventsService.calculatePoints('100M', '10.50', 'MALE');
console.log(points); // np. 1007
```

## Przykładowe wyniki

### Dziesięciobój (8500 punktów)
- 100m: 10.50s (~1000 pkt)
- Skok w dal: 7.45m (~900 pkt)
- Pchnięcie kulą: 15.50m (~850 pkt)
- Skok wzwyż: 2.15m (~900 pkt)
- 400m: 47.50s (~950 pkt)
- 110m ppł: 13.80s (~950 pkt)
- Rzut dyskiem: 48.00m (~850 pkt)
- Skok o tyczce: 5.20m (~950 pkt)
- Rzut oszczepem: 65.00m (~850 pkt)
- 1500m: 4:15.30 (~800 pkt)

### Siedmiobój (6500 punktów)
- 100m ppł: 13.00s (~1100 pkt)
- Skok wzwyż: 1.85m (~1000 pkt)
- Pchnięcie kulą: 15.00m (~850 pkt)
- 200m: 23.50s (~1000 pkt)
- Skok w dal: 6.50m (~950 pkt)
- Rzut oszczepem: 50.00m (~850 pkt)
- 800m: 2:10.00 (~950 pkt)

## Rekordy świata

- **Dziesięciobój**: 9126 punktów (Kevin Mayer, 2018)
- **Siedmiobój**: 7291 punktów (Jackie Joyner-Kersee, 1988)

## Testy

Uruchom testy jednostkowe:
```bash
npm test combined-events
```

Uruchom testy z pokryciem:
```bash
npm run test:cov combined-events
```

## Struktura bazy danych

### CombinedEvent
- `id`: Unikalny identyfikator
- `eventType`: Typ wieloboju (DECATHLON/HEPTATHLON/PENTATHLON)
- `athleteId`: ID zawodnika
- `competitionId`: ID zawodów
- `gender`: Płeć (MALE/FEMALE)
- `totalPoints`: Suma punktów
- `isComplete`: Czy wszystkie dyscypliny są ukończone

### CombinedEventResult
- `id`: Unikalny identyfikator
- `combinedEventId`: ID wieloboju
- `discipline`: Kod dyscypliny (100M, LJ, SP, etc.)
- `dayOrder`: Kolejność dyscypliny (1-10)
- `performance`: Wynik (10.50, 7.45, 4:15.30)
- `points`: Punkty za dyscyplinę
- `wind`: Prędkość wiatru (opcjonalnie)
- `isValid`: Czy wynik jest ważny

## Współczynniki punktacji

Współczynniki są zdefiniowane w `constants/scoring-tables.ts` i odpowiadają oficjalnym tabelom IAAF/World Athletics z 2025 roku.

## Walidacja

System automatycznie waliduje:
- Format wyników (czas, odległość, wysokość)
- Realistyczne wartości wyników
- Kompletność danych wieloboju
- Poprawność współczynników punktacji