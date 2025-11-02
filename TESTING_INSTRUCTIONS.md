# Instrukcje testowania integracji z PZLA

## 🚀 Uruchomienie systemu

### 1. Backend

```bash
cd athletics-platform/backend
npm install
npm run start:dev
```

Backend będzie dostępny na: http://localhost:3001

### 2. Frontend

```bash
cd athletics-platform/frontend
npm install
npm run dev
```

Frontend będzie dostępny na: http://localhost:3000

## 🧪 Testy automatyczne

### Test połączenia z PZLA

```bash
node test-pzla-integration.js
```

**Oczekiwany wynik:**

- ✅ Strona PZLA jest dostępna
- ✅ Znaleziono elementy formularza wyszukiwania
- ✅ Znaleziono elementy profilu zawodnika

### Test API endpointów

```bash
node test-pzla-api.js
```

**Oczekiwany wynik:**

- ✅ Backend API jest dostępny
- ✅ Znaleziono X zawodników
- ✅ Endpoint wymaga autoryzacji (poprawnie zabezpieczony)

## 🖱️ Testy manualne w przeglądarce

### 1. Test pojedynczego zawodnika

1. **Otwórz aplikację**: http://localhost:3000
2. **Zaloguj się** (jeśli wymagane)
3. **Przejdź do sekcji "Zawodnicy"**
4. **Kliknij na dowolnego zawodnika**
5. **Znajdź przycisk "Pobierz z PZLA"** w prawym górnym rogu
6. **Kliknij przycisk**

**Oczekiwane zachowanie:**

- Otworzy się dialog wyszukiwania
- System automatycznie wyszuka zawodnika na PZLA
- Wyświetli się lista znalezionych wyników (lub komunikat o braku wyników)
- Możliwość aktualizacji rekordów

### 2. Test masowej aktualizacji

1. **Przejdź do sekcji "Zawodnicy"**
2. **Znajdź przycisk "Masowa aktualizacja z PZLA"** w prawym górnym rogu
3. **Kliknij przycisk**
4. **Przeczytaj ostrzeżenie i kliknij "Rozpocznij aktualizację"**

**Oczekiwane zachowanie:**

- Otworzy się dialog z paskiem postępu
- System będzie przetwarzał zawodników jeden po drugim
- Wyświetli się podsumowanie z liczbą zaktualizowanych zawodników

### 3. Test automatycznej aktualizacji przy rejestracji

1. **Przejdź do sekcji "Rejestracje"**
2. **Kliknij "Nowa rejestracja"**
3. **Wybierz zawodnika bez rekordów PB/SB**
4. **Wypełnij formularz rejestracji**
5. **Zatwierdź rejestrację**

**Oczekiwane zachowanie:**

- Rejestracja zostanie utworzona
- W tle system spróbuje pobrać rekordy z PZLA
- Po chwili rekordy powinny pojawić się w profilu zawodnika

## 🔍 Scenariusze testowe

### Scenariusz 1: Zawodnik z numerem licencji

**Dane testowe:**

- Zawodnik z wypełnionym numerem licencji PZLA
- Przykład: licencja "12345"

**Kroki:**

1. Użyj przycisku "Pobierz z PZLA" dla tego zawodnika
2. System powinien wyszukać po numerze licencji
3. Sprawdź czy znaleziono właściwego zawodnika

### Scenariusz 2: Zawodnik bez numeru licencji

**Dane testowe:**

- Zawodnik bez numeru licencji
- Imię i nazwisko: "Jan Kowalski"

**Kroki:**

1. Użyj przycisku "Pobierz z PZLA" dla tego zawodnika
2. System powinien wyszukać po imieniu i nazwisku
3. Sprawdź czy znaleziono właściwego zawodnika

### Scenariusz 3: Zawodnik nieznaleziony

**Dane testowe:**

- Zawodnik z bardzo rzadkim imieniem/nazwiskiem
- Lub błędnym numerem licencji

**Kroki:**

1. Użyj przycisku "Pobierz z PZLA" dla tego zawodnika
2. System powinien wyświetlić komunikat "Nie znaleziono zawodnika"
3. Sprawdź czy nie wystąpiły błędy

### Scenariusz 4: Aktualizacja istniejących rekordów

**Dane testowe:**

- Zawodnik z już istniejącymi rekordami PB/SB

**Kroki:**

1. Zanotuj obecne rekordy zawodnika
2. Użyj przycisku "Pobierz z PZLA"
3. Sprawdź czy lepsze wyniki zostały zaktualizowane
4. Sprawdź czy gorsze wyniki nie zostały nadpisane

## 📊 Monitorowanie i debugowanie

### Logi backendu

Sprawdź logi w konsoli backendu:

```
[PzlaIntegrationService] Searching for athlete with license: 12345
[PzlaIntegrationService] Found 5 results for athlete
[PzlaIntegrationService] Updated athlete records: PB=3, SB=2
```

### Logi frontendu

Sprawdź logi w konsoli przeglądarki (F12):

```
PZLA Integration: Starting search for athlete
PZLA Integration: Search completed, found results
PZLA Integration: Records updated successfully
```

### Baza danych

Sprawdź czy rekordy zostały zapisane w bazie:

```sql
SELECT personalBests, seasonBests FROM athletes WHERE id = 'athlete-id';
```

## ⚠️ Znane ograniczenia

### 1. Rate limiting PZLA

- System wprowadza opóźnienia 1s między requestami
- Przy masowej aktualizacji może to potrwać długo
- PZLA może wprowadzić dodatkowe ograniczenia

### 2. Zmienność struktury strony

- Strona PZLA może zmieniać strukturę HTML
- Parsowanie może przestać działać po aktualizacjach PZLA
- Wymagane będą okresowe aktualizacje kodu

### 3. Dokładność mapowania

- Nazwy konkurencji mogą się różnić między PZLA a systemem
- Niektóre wyniki mogą nie zostać rozpoznane
- Wymagane może być rozszerzenie mapowania

## 🐛 Rozwiązywanie problemów

### Problem: "Nie można połączyć się z PZLA"

**Rozwiązania:**

1. Sprawdź połączenie internetowe
2. Sprawdź czy strona PZLA jest dostępna
3. Sprawdź logi backendu pod kątem błędów sieci

### Problem: "Nie znaleziono zawodnika"

**Rozwiązania:**

1. Sprawdź pisownię imienia i nazwiska
2. Sprawdź poprawność numeru licencji
3. Wyszukaj ręcznie na statystyka.pzla.pl

### Problem: "Błąd parsowania wyników"

**Rozwiązania:**

1. Sprawdź logi backendu pod kątem błędów parsowania
2. Sprawdź czy PZLA nie zmieniła struktury strony
3. Może wymagać aktualizacji kodu parsowania

### Problem: "Rekordy nie zostały zaktualizowane"

**Rozwiązania:**

1. Sprawdź czy znalezione wyniki są lepsze od istniejących
2. Sprawdź logi pod kątem błędów zapisu do bazy
3. Sprawdź format wyników (czy są poprawnie parsowane)

## 📈 Metryki sukcesu

### Dla pojedynczego zawodnika:

- ✅ Wyszukiwanie: < 5 sekund
- ✅ Parsowanie wyników: < 3 sekundy
- ✅ Aktualizacja bazy: < 1 sekunda

### Dla masowej aktualizacji:

- ✅ 50 zawodników: < 5 minut
- ✅ 100 zawodników: < 10 minut
- ✅ Współczynnik sukcesu: > 80%

### Ogólne:

- ✅ Dostępność PZLA: > 95%
- ✅ Dokładność parsowania: > 90%
- ✅ Brak błędów krytycznych: 100%

## 🎯 Następne kroki po testach

1. **Jeśli testy przechodzą pomyślnie:**
   - System jest gotowy do produkcji
   - Można włączyć automatyczną aktualizację przy rejestracji
   - Można zaplanować regularne masowe aktualizacje

2. **Jeśli występują problemy:**
   - Przeanalizuj logi i błędy
   - Dostosuj parsowanie do aktualnej struktury PZLA
   - Rozszerz mapowanie konkurencji jeśli potrzeba
   - Przetestuj ponownie

3. **Optymalizacje:**
   - Dodaj cache dla wyników PZLA
   - Zaimplementuj retry logic
   - Dodaj więcej szczegółowych logów
   - Rozważ dodanie powiadomień o nowych rekordach
