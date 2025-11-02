# Program Minutowy w Stylu Roster Athletics

## Opis

Nowy komponent programu minutowego został stworzony w stylu Roster Athletics, oferując bardziej intuicyjny i profesjonalny interfejs do zarządzania programami minutowymi zawodów lekkoatletycznych.

## Funkcje

### 1. Tabela w stylu Roster Athletics
- **Konkurencja**: Nazwa konkurencji z dystansem
- **Płeć**: Mężczyźni/Kobiety/Mieszane
- **Kategoria**: Kategorie wiekowe (7 lat, 8 lat, Seniorzy, itp.)
- **Runda**: Serie/Półfinał/Finał z liczbą serii
- **Data**: Data zawodów (automatycznie pobierana z zawodów)
- **Godzina**: Godzina rozpoczęcia (edytowalna inline)
- **Awans/medal**: Informacje o awansie i uwagi

### 2. Automatyczne generowanie programu
- Przycisk "Generuj automatycznie" tworzy program na podstawie zarejestrowanych wydarzeń
- Automatyczne sortowanie: najpierw biegi, potem konkurencje techniczne
- Inteligentne określanie rund na podstawie liczby uczestników:
  - **Biegi**: Zawsze serie (8 osób na serię)
  - **Konkurencje techniczne**: 
    - ≤12 uczestników: Bezpośrednio finał
    - >12 uczestników: Eliminacje + finał (12 do finału)
- Automatyczne obliczanie czasu trwania:
  - **Sprinty (100m, 200m, 400m)**: 10 minut
  - **Średnie dystanse (800m, 1500m)**: 15 minut
  - **Długie dystanse**: 20 minut
  - **Konkurencje techniczne**: 45 minut

### 3. Edycja inline
- **Godzina**: Kliknij na godzinę, aby ją edytować
- **Liczba serii**: Kliknij na "X serii", aby zmienić liczbę
- **Uwagi**: Kliknij na uwagę lub "+ Dodaj uwagę"

### 4. Sortowanie i filtrowanie
- **Sortowanie**: Według czasu, konkurencji lub kategorii
- **Filtr płci**: Wszystkie/Mężczyźni/Kobiety/Mieszane
- **Filtr kategorii**: Wszystkie kategorie lub wybrana kategoria

### 5. Statystyki programu
- Łączna liczba pozycji
- Liczba konkurencji biegowych
- Liczba konkurencji technicznych
- Szacowany czas trwania całego programu

### 6. Funkcje dodatkowe
- **Drukowanie**: Przygotowany layout do druku
- **Eksport PDF**: (w przygotowaniu)
- **Zapisywanie**: Automatyczne zapisywanie w bazie danych
- **Ładowanie**: Automatyczne ładowanie istniejącego programu

## Jak używać

### 1. Tworzenie nowego programu
1. Przejdź do zawodów → Program minutowy
2. Kliknij "Utwórz program (styl Roster)"
3. Wypełnij nazwę i opis programu
4. Kliknij "Generuj automatycznie" lub dodawaj pozycje ręcznie

### 2. Edycja programu
1. Kliknij na dowolną godzinę, aby ją zmienić
2. Kliknij na liczbę serii, aby ją dostosować
3. Dodaj uwagi klikając "+ Dodaj uwagę"
4. Użyj filtrów do szybkiego znajdowania pozycji

### 3. Zapisywanie i publikowanie
1. Kliknij "Zapisz" aby zapisać zmiany
2. Program jest automatycznie synchronizowany z bazą danych
3. Możesz drukować lub eksportować program

## Różnice względem standardowego programu

| Funkcja | Standardowy | Roster Style |
|---------|-------------|--------------|
| Interfejs | Lista z kartami | Tabela |
| Edycja | Modalne okna | Inline editing |
| Sortowanie | Podstawowe | Zaawansowane z filtrami |
| Generowanie | Proste | Inteligentne z regułami |
| Statystyki | Brak | Pełne statystyki |
| Drukowanie | Podstawowe | Profesjonalny layout |

## Struktura danych

Program minutowy jest zapisywany w tej samej strukturze co standardowy program, zapewniając pełną kompatybilność z istniejącym API.

## Wsparcie techniczne

W przypadku problemów lub pytań, skontaktuj się z zespołem deweloperskim.