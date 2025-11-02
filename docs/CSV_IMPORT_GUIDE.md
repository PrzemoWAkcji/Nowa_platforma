# Przewodnik importu plików CSV

## Obsługiwane kodowania

System automatycznie wykrywa i obsługuje następujące kodowania znaków:

1. **Windows-1250** (domyślne dla polskich systemów)
2. **UTF-8** (standard internetowy)
3. **ISO-8859-2** (starsze polskie kodowanie)
4. **CP852** (DOS/starsze systemy)

## Automatyczne wykrywanie kodowania

System używa inteligentnego algorytmu wykrywania:

1. **Sprawdza BOM UTF-8** - jeśli plik ma znacznik UTF-8, używa tego kodowania
2. **Testuje Windows-1250** - najpierw próbuje najczęstszego polskiego kodowania
3. **Weryfikuje polskie znaki** - sprawdza czy wynik zawiera poprawne polskie znaki (ą, ć, ę, ł, ń, ó, ś, ź, ż)
4. **Sprawdza nagłówki** - szuka typowych nagłówków jak "Pełna nazwa", "metrów", "Imię"
5. **Fallback do UTF-8** - jeśli inne kodowania nie działają

## Najlepsze praktyki

### ✅ Zalecane
- Używaj plików w kodowaniu **Windows-1250** (system je automatycznie rozpozna)
- Upewnij się, że plik zawiera polskie znaki w nagłówkach
- Używaj standardowych separatorów (średnik `;` lub przecinek `,`)

### ⚠️ Uwagi
- Unikaj mieszania kodowań w jednym pliku
- Sprawdź podgląd przed importem
- W przypadku problemów, skonwertuj plik do UTF-8

## Narzędzie konwersji

Jeśli masz problemy z kodowaniem, użyj narzędzia konwersji:

\`\`\`bash
# Automatyczna konwersja do UTF-8
node scripts/convert-csv-encoding.js twoj-plik.csv

# Ręczna konwersja
node scripts/convert-csv-encoding.js twoj-plik.csv plik-utf8.csv windows-1250 utf-8
\`\`\`

## Rozwiązywanie problemów

### Problem: Znaki zastępcze (�) w danych
**Rozwiązanie:** Plik ma błędne kodowanie. System spróbuje automatycznie wykryć poprawne kodowanie.

### Problem: Brak polskich znaków
**Rozwiązanie:** Sprawdź czy plik został zapisany w odpowiednim kodowaniu (Windows-1250 lub UTF-8).

### Problem: Błędy importu
**Rozwiązanie:** 
1. Sprawdź format pliku CSV
2. Użyj narzędzia konwersji
3. Upewnij się, że nagłówki są w języku polskim

## Przykłady poprawnych nagłówków

\`\`\`csv
Impreza;NrKonkur;NazwaPZLA;Pełna nazwa;Runda;Seria;Tor;Miejsce;NrStart;Nazwisko;Imię;DataUr;Klub
\`\`\`

## Wsparcie techniczne

W przypadku problemów z importem:
1. Sprawdź kodowanie pliku
2. Użyj narzędzia konwersji
3. Skontaktuj się z administratorem systemu