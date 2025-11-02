# Integracja z PZLA - Dokumentacja

## Przegląd

System integracji z PZLA (Polski Związek Lekkiej Atletyki) umożliwia automatyczne pobieranie i aktualizację rekordów zawodników ze strony statystyka.pzla.pl.

## Funkcjonalności

### 1. Automatyczna aktualizacja przy rejestracji

- **Kiedy**: Automatycznie przy rejestracji zawodnika na zawody
- **Jak**: System sprawdza czy zawodnik ma już rekordy w bazie. Jeśli nie, automatycznie próbuje pobrać dane z PZLA
- **Implementacja**: Wywołanie asynchroniczne w `RegistrationsService.create()`

### 2. Manualna aktualizacja pojedynczego zawodnika

- **Gdzie**: Profil zawodnika - przycisk "Pobierz z PZLA"
- **Funkcje**:
  - Wyszukiwanie po numerze licencji PZLA
  - Wyszukiwanie po imieniu, nazwisku i dacie urodzenia
  - Podgląd znalezionych wyników przed aktualizacją
  - Aktualizacja rekordów PB (Personal Best) i SB (Season Best)

### 3. Masowa aktualizacja wszystkich zawodników

- **Gdzie**: Strona zawodników - przycisk "Masowa aktualizacja z PZLA"
- **Funkcje**:
  - Aktualizacja wszystkich zawodników bez rekordów w systemie
  - Pasek postępu i raportowanie błędów
  - Opóźnienia między requestami (1 sekunda) aby nie przeciążyć serwera PZLA

## Algorytm wyszukiwania

### Priorytet wyszukiwania:

1. **Po numerze licencji** - jeśli zawodnik ma wypełniony numer licencji
2. **Po imieniu i nazwisku** - jeśli nie znaleziono po licencji lub brak licencji
3. **Z datą urodzenia** - jako dodatkowy filtr weryfikacyjny

### Przetwarzanie wyników:

- **Personal Best (PB)**: Najlepszy wynik w historii dla każdej konkurencji
- **Season Best (SB)**: Najlepszy wynik w bieżącym sezonie lub ostatnim kwartale
- **Normalizacja nazw konkurencji**: Mapowanie nazw z PZLA na standardowe nazwy systemu

## Endpointy API

### Wyszukiwanie zawodnika

```
GET /athletes/:id/search-pzla
```

**Odpowiedź**:

```json
{
  "athlete": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "licenseNumber": "string"
  },
  "pzlaData": {
    "firstName": "string",
    "lastName": "string",
    "club": "string",
    "licenseNumber": "string",
    "results": [
      {
        "event": "string",
        "result": "string",
        "date": "string",
        "competition": "string",
        "wind": "string"
      }
    ]
  },
  "found": boolean
}
```

### Aktualizacja rekordów pojedynczego zawodnika

```
POST /athletes/:id/update-from-pzla
```

**Odpowiedź**:

```json
{
  "updated": boolean,
  "personalBests": object,
  "seasonBests": object,
  "errors": string[]
}
```

### Masowa aktualizacja

```
POST /athletes/update-all-from-pzla
```

**Odpowiedź**:

```json
{
  "processed": number,
  "updated": number,
  "errors": string[]
}
```

## Komponenty Frontend

### PzlaIntegrationDialog

- **Lokalizacja**: `src/components/athletes/PzlaIntegrationDialog.tsx`
- **Użycie**: Dialog do wyszukiwania i aktualizacji pojedynczego zawodnika
- **Props**:
  - `athleteId`: ID zawodnika
  - `athleteName`: Imię i nazwisko zawodnika
  - `licenseNumber`: Numer licencji (opcjonalny)
  - `trigger`: Niestandardowy trigger (opcjonalny)

### PzlaBulkUpdateDialog

- **Lokalizacja**: `src/components/athletes/PzlaBulkUpdateDialog.tsx`
- **Użycie**: Dialog do masowej aktualizacji wszystkich zawodników
- **Funkcje**:
  - Pasek postępu
  - Raportowanie wyników
  - Obsługa błędów

## Konfiguracja

### Zmienne środowiskowe

```env
# Opcjonalne - URL do API PZLA (domyślnie: https://statystyka.pzla.pl)
PZLA_BASE_URL=https://statystyka.pzla.pl
```

### Opóźnienia i limity

- **Opóźnienie między requestami**: 1 sekunda
- **Timeout requestów**: 10 sekund
- **User-Agent**: Mozilla/5.0 (symulacja przeglądarki)

## Obsługa błędów

### Typy błędów:

1. **Zawodnik nie znaleziony**: Brak zawodnika na stronie PZLA
2. **Błąd sieci**: Problemy z połączeniem do PZLA
3. **Błąd parsowania**: Problemy z analizą HTML strony PZLA
4. **Błąd bazy danych**: Problemy z zapisem do bazy

### Logowanie:

- **INFO**: Udane aktualizacje
- **DEBUG**: Brak danych dla zawodnika
- **WARN**: Błędy pobierania danych z PZLA
- **ERROR**: Krytyczne błędy systemu

## Bezpieczeństwo

### Ochrona przed przeciążeniem:

- Opóźnienia między requestami
- Timeout dla długotrwałych operacji
- Symulacja przeglądarki (User-Agent)

### Walidacja danych:

- Sprawdzanie formatu wyników
- Walidacja dat
- Normalizacja nazw konkurencji

## Rozszerzenia przyszłe

### Planowane funkcjonalności:

1. **Cache wyników**: Przechowywanie wyników z PZLA w cache
2. **Harmonogram aktualizacji**: Automatyczne aktualizacje w tle
3. **Więcej źródeł danych**: Integracja z innymi bazami wyników
4. **Zaawansowane filtrowanie**: Filtrowanie wyników według kryteriów
5. **Eksport danych**: Eksport rekordów do różnych formatów

### Możliwe ulepszenia:

1. **Lepsze mapowanie konkurencji**: Dokładniejsze dopasowanie nazw
2. **Obsługa rekordów masters**: Specjalne kategorie wiekowe
3. **Integracja z World Athletics**: Międzynarodowe rekordy
4. **Powiadomienia**: Informowanie o nowych rekordach

## Testowanie

### Testy jednostkowe:

```bash
npm test -- pzla-integration.service.spec.ts
```

### Testy integracyjne:

```bash
npm run test:e2e -- pzla-integration.e2e-spec.ts
```

### Testowanie manualne:

1. Utwórz zawodnika z numerem licencji PZLA
2. Użyj przycisku "Pobierz z PZLA" w profilu zawodnika
3. Sprawdź czy rekordy zostały poprawnie zaktualizowane
4. Przetestuj masową aktualizację na kilku zawodnikach

## Troubleshooting

### Częste problemy:

**Problem**: Nie można znaleźć zawodnika na PZLA
**Rozwiązanie**:

- Sprawdź poprawność numeru licencji
- Sprawdź pisownię imienia i nazwiska
- Sprawdź czy zawodnik jest aktywny w systemie PZLA

**Problem**: Błędy sieci podczas pobierania
**Rozwiązanie**:

- Sprawdź połączenie internetowe
- Sprawdź czy strona PZLA jest dostępna
- Zwiększ timeout w konfiguracji

**Problem**: Niepoprawne mapowanie konkurencji
**Rozwiązanie**:

- Sprawdź mapowanie w `normalizeEventName()`
- Dodaj nowe mapowania jeśli potrzeba
- Zgłoś problem do zespołu rozwoju

## Kontakt

W przypadku problemów lub pytań dotyczących integracji z PZLA, skontaktuj się z zespołem rozwoju platformy lekkoatletycznej.
