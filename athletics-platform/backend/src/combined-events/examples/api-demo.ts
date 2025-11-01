#!/usr/bin/env ts-node

/**
 * Demonstracja API wielobojów
 * Pokazuje jak używać endpointów do zarządzania wielobojami
 */

// Przykładowe żądania HTTP dla API wielobojów

console.log('🏃‍♂️ Demonstracja API Wielobojów\n');

// 1. Tworzenie dziesięcioboju
console.log('=== 1. TWORZENIE DZIESIĘCIOBOJU ===');
console.log('POST /combined-events');
console.log('Content-Type: application/json');
console.log('Authorization: Bearer <jwt-token>');
console.log('');
console.log(
  JSON.stringify(
    {
      eventType: 'DECATHLON',
      athleteId: 'athlete-123',
      competitionId: 'competition-456',
      gender: 'MALE',
    },
    null,
    2,
  ),
);
console.log('');

// 2. Dodawanie wyników dyscyplin
console.log('=== 2. DODAWANIE WYNIKÓW DYSCYPLIN ===');

const disciplines = [
  { name: '100M', performance: '10.50', wind: '+1.5' },
  { name: 'LJ', performance: '7.45' },
  { name: 'SP', performance: '15.50' },
  { name: 'HJ', performance: '2.15' },
  { name: '400M', performance: '47.50' },
  { name: '110MH', performance: '13.80', wind: '+0.8' },
  { name: 'DT', performance: '48.00' },
  { name: 'PV', performance: '5.20' },
  { name: 'JT', performance: '65.00' },
  { name: '1500M', performance: '4:15.30' },
];

disciplines.forEach((discipline, index) => {
  console.log(`${index + 1}. ${discipline.name}`);
  console.log(`PUT /combined-events/{id}/discipline/${discipline.name}`);
  console.log('Content-Type: application/json');
  console.log('');

  const body: any = { performance: discipline.performance };
  if (discipline.wind) {
    body.wind = discipline.wind;
  }

  console.log(JSON.stringify(body, null, 2));
  console.log('');
});

// 3. Pobieranie szczegółów wieloboju
console.log('=== 3. POBIERANIE SZCZEGÓŁÓW WIELOBOJU ===');
console.log('GET /combined-events/{id}');
console.log('Authorization: Bearer <jwt-token>');
console.log('');
console.log('Odpowiedź:');
console.log(
  JSON.stringify(
    {
      id: 'combined-event-123',
      eventType: 'DECATHLON',
      athleteId: 'athlete-123',
      competitionId: 'competition-456',
      gender: 'MALE',
      totalPoints: 9059,
      isComplete: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T16:30:00Z',
      athlete: {
        id: 'athlete-123',
        firstName: 'Jan',
        lastName: 'Kowalski',
        dateOfBirth: '1995-05-15T00:00:00Z',
        gender: 'MALE',
        club: 'AZS Warszawa',
      },
      results: [
        {
          id: 'result-1',
          discipline: '100M',
          dayOrder: 1,
          performance: '10.50',
          points: 976,
          wind: '+1.5',
          isValid: true,
        },
        {
          id: 'result-2',
          discipline: 'LJ',
          dayOrder: 2,
          performance: '7.45',
          points: 923,
          wind: null,
          isValid: true,
        },
        // ... pozostałe dyscypliny
      ],
    },
    null,
    2,
  ),
);
console.log('');

// 4. Ranking wieloboju
console.log('=== 4. RANKING WIELOBOJU ===');
console.log(
  'GET /combined-events/competition/{competitionId}/ranking?eventType=DECATHLON',
);
console.log('Authorization: Bearer <jwt-token>');
console.log('');
console.log('Odpowiedź:');
console.log(
  JSON.stringify(
    [
      {
        id: 'combined-event-123',
        position: 1,
        totalPoints: 9059,
        isComplete: true,
        athlete: {
          firstName: 'Jan',
          lastName: 'Kowalski',
          club: 'AZS Warszawa',
        },
      },
      {
        id: 'combined-event-124',
        position: 2,
        totalPoints: 8756,
        isComplete: true,
        athlete: {
          firstName: 'Piotr',
          lastName: 'Nowak',
          club: 'Legia Warszawa',
        },
      },
    ],
    null,
    2,
  ),
);
console.log('');

// 5. Obliczanie punktów (pomocniczy endpoint)
console.log('=== 5. OBLICZANIE PUNKTÓW ===');
console.log('POST /combined-events/calculate-points');
console.log('Content-Type: application/json');
console.log('');
console.log(
  JSON.stringify(
    {
      discipline: '100M',
      performance: '10.50',
      gender: 'MALE',
    },
    null,
    2,
  ),
);
console.log('');
console.log('Odpowiedź:');
console.log(
  JSON.stringify(
    {
      points: 976,
    },
    null,
    2,
  ),
);
console.log('');

// 6. Walidacja wyniku
console.log('=== 6. WALIDACJA WYNIKU ===');
console.log('POST /combined-events/validate-performance');
console.log('Content-Type: application/json');
console.log('');
console.log(
  JSON.stringify(
    {
      discipline: '100M',
      performance: '10.50',
    },
    null,
    2,
  ),
);
console.log('');
console.log('Odpowiedź:');
console.log(
  JSON.stringify(
    {
      isValid: true,
    },
    null,
    2,
  ),
);
console.log('');

// 7. Statystyki zawodów
console.log('=== 7. STATYSTYKI ZAWODÓW ===');
console.log('GET /combined-events/competition/{competitionId}/statistics');
console.log('Authorization: Bearer <jwt-token>');
console.log('');
console.log('Odpowiedź:');
console.log(
  JSON.stringify(
    {
      totalEvents: 15,
      completedEvents: 12,
      averagePoints: 7850,
      bestPerformance: {
        id: 'combined-event-123',
        totalPoints: 9059,
        athlete: {
          firstName: 'Jan',
          lastName: 'Kowalski',
        },
      },
      eventTypeBreakdown: {
        DECATHLON: 10,
        HEPTATHLON: 5,
      },
    },
    null,
    2,
  ),
);
console.log('');

// 8. Przykład kompletnego przepływu
console.log('=== 8. PRZYKŁAD KOMPLETNEGO PRZEPŁYWU ===');
console.log(`
1. Organizator tworzy zawody wielobojowe
2. Zawodnicy rejestrują się na wielobój
3. System tworzy rekordy wieloboju dla każdego zawodnika
4. W trakcie zawodów wprowadzane są wyniki poszczególnych dyscyplin
5. System automatycznie przelicza punkty i aktualizuje ranking
6. Po zakończeniu wszystkich dyscyplin wielobój jest oznaczany jako kompletny
7. Generowany jest końcowy ranking z pozycjami zawodników
`);

console.log('🎉 Koniec demonstracji API!');

// Przykładowe błędy
console.log('=== PRZYKŁADOWE BŁĘDY ===');
console.log(`
400 Bad Request - Nieprawidłowy format wyniku:
{
  "message": "Nieprawidłowy format wyniku",
  "statusCode": 400
}

404 Not Found - Wielobój nie został znaleziony:
{
  "message": "Wielobój nie został znaleziony",
  "statusCode": 404
}

400 Bad Request - Nieznana dyscyplina:
{
  "message": "Nieznana dyscyplina: UNKNOWN",
  "statusCode": 400
}
`);
