# Import zawodników z plików CSV

## Opis funkcjonalności

Aplikacja umożliwia import zawodników z plików CSV w dwóch formatach:
1. **Format PZLA** - używany przez Polski Związek Lekkiej Atletyki
2. **Format międzynarodowy** - standardowy format używany międzynarodowo

## Dostęp do funkcji

Import CSV jest dostępny w sekcji **Zawodnicy** → zakładka **Import CSV**.

## Obsługiwane formaty

### Format PZLA (starter.csv)
Separator: `;` (średnik)

Wymagane kolumny:
- `Imię` - imię zawodnika
- `Nazwisko` - nazwisko zawodnika  
- `DataUr` - data urodzenia (format: YYYY-MM-DD)
- `Klub` - nazwa klubu (opcjonalne)
- `NazwaPZLA` - nazwa konkurencji (używana do określenia płci)

Przykład:
```csv
Imię;Nazwisko;DataUr;Klub;NazwaPZLA
Jan;Kowalski;1995-05-15;AZS Warszawa;100m mężczyzn
Anna;Nowak;1998-03-22;Legia Warszawa;100m kobiet
```

### Format międzynarodowy (roster.csv)
Separator: `,` (przecinek)

Wymagane kolumny:
- `FirstName` - imię zawodnika
- `LastName` - nazwisko zawodnika
- `DateOfBirth` - data urodzenia (format: YYYY-MM-DD)
- `Gender` - płeć (Male/Female)
- `ClubName` - nazwa klubu (opcjonalne)
- `CountryCode` - kod kraju (opcjonalne)

Przykład:
```csv
FirstName,LastName,DateOfBirth,Gender,ClubName,CountryCode
John,Smith,1995-05-15,Male,Warsaw Athletics,POL
Sarah,Johnson,1998-03-22,Female,Krakow Running Club,POL
```

## Opcje importu

### Aktualizuj istniejących zawodników
- **Zaznaczone**: Jeśli zawodnik już istnieje (to samo imię, nazwisko i data urodzenia), jego dane zostaną zaktualizowane
- **Niezaznaczone**: Istniejący zawodnicy zostaną pominięci

## Automatyczne określanie kategorii

System automatycznie określa kategorię zawodnika na podstawie wieku:
- **U16**: do 16 lat
- **U18**: 17-18 lat  
- **U20**: 19-20 lat
- **SENIOR**: 21-34 lata
- **M35**: 35-39 lat
- **M40**: 40-44 lata
- **M45**: 45-49 lat
- **M50**: 50-54 lata
- **M55**: 55-59 lat
- **M60**: 60-64 lata
- **M65**: 65-69 lat
- **M70**: 70-74 lata
- **M75**: 75-79 lat
- **M80**: 80+ lat

## Określanie płci

### Format PZLA
Płeć jest określana na podstawie nazwy konkurencji:
- Jeśli nazwa zawiera "kobiet" lub zaczyna się od "K" → Kobieta
- W przeciwnym razie → Mężczyzna

### Format międzynarodowy
Płeć jest pobierana bezpośrednio z kolumny `Gender`:
- `Male` → Mężczyzna
- `Female` → Kobieta

## Wyniki importu

Po zakończeniu importu system wyświetla:
- **Zaimportowano**: liczba nowych zawodników
- **Zaktualizowano**: liczba zaktualizowanych zawodników  
- **Pominięto**: liczba pominiętych rekordów
- **Błędy**: lista błędów, które wystąpiły podczas importu

## Przykładowe pliki testowe

W katalogu `test-files/` znajdują się przykładowe pliki:
- `starter-pzla.csv` - przykład formatu PZLA
- `roster-international.csv` - przykład formatu międzynarodowego

## Rozwiązywanie problemów

### Najczęstsze błędy:
1. **Nieprawidłowy format daty** - używaj formatu YYYY-MM-DD
2. **Brakujące wymagane kolumny** - sprawdź czy wszystkie wymagane kolumny są obecne
3. **Nieprawidłowy separator** - PZLA używa `;`, międzynarodowy używa `,`
4. **Kodowanie znaków** - zapisz plik w kodowaniu UTF-8

### Wskazówki:
- Sprawdź przykładowe pliki przed utworzeniem własnego CSV
- Upewnij się, że daty są w formacie YYYY-MM-DD
- Dla formatu PZLA używaj średnika jako separatora
- Dla formatu międzynarodowego używaj przecinka jako separatora

## API Endpoint

Funkcjonalność jest dostępna również przez API:

```
POST /athletes/import-csv
Content-Type: multipart/form-data

Parametry:
- file: plik CSV
- format: "pzla" lub "international"  
- updateExisting: true/false
```

Odpowiedź:
```json
{
  "imported": 5,
  "updated": 2,
  "skipped": 1,
  "errors": []
}
```