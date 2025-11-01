# 📋 Dokumentacja Importu List Startowych

## Przegląd

Funkcjonalność importu list startowych pozwala na automatyczne dodawanie zawodników do zawodów na podstawie plików CSV z różnych systemów zarządzania zawodami lekkoatletycznymi.

## Obsługiwane Formaty

### 1. Format PZLA (starter.pzla.pl)
- **Separator**: średnik (;)
- **Kodowanie**: UTF-8 lub Windows-1250
- **Główne kolumny**:
  - `Nazwisko` - nazwisko zawodnika
  - `Imię` - imię zawodnika  
  - `DataUr` - data urodzenia (YYYY-MM-DD)
  - `Klub` - nazwa klubu
  - `NazwaPZLA` lub `Pełna nazwa` - nazwa konkurencji
  - `NrStart` - numer startowy
  - `Tor` - numer toru
  - `Seria` - numer serii
  - `PB` - rekord życiowy
  - `SB` - rekord sezonu
  - `Licencja PZLA` - numer licencji

### 2. Format Roster Athletics
- **Separator**: przecinek (,)
- **Kodowanie**: UTF-8
- **Główne kolumny**:
  - `FirstName` - imię zawodnika
  - `LastName` - nazwisko zawodnika
  - `DateOfBirth` - data urodzenia (YYYY-MM-DD)
  - `Gender` - płeć (Male/Female)
  - `ClubName` - nazwa klubu
  - `EventCode` - kod konkurencji
  - `BibNumber` - numer startowy
  - `Lane` - numer toru
  - `PersonalBest` - rekord życiowy
  - `SeasonBest` - rekord sezonu
  - `CountryCode` - kod kraju

## Jak Używać

### 1. Dostęp do Funkcji
- Przejdź do szczegółów zawodów
- Znajdź sekcję "Konkurencje" lub "Akcje"
- Kliknij przycisk "Importuj listę startową"

### 2. Proces Importu

#### Krok 1: Wybór Pliku
- Przeciągnij plik CSV do obszaru importu lub kliknij "Wybierz plik"
- Opcjonalnie wybierz format (domyślnie: automatyczne rozpoznawanie)

#### Krok 2: Podgląd Danych
- System wyświetli pierwsze wiersze pliku
- Sprawdź czy dane są poprawnie rozpoznane
- Kliknij "Importuj" aby kontynuować

#### Krok 3: Wyniki Importu
- System wyświetli podsumowanie importu
- Sprawdź liczbę zaimportowanych zawodników
- Przejrzyj ewentualne błędy i ostrzeżenia

## Automatyczne Przetwarzanie

### Rozpoznawanie Formatu
System automatycznie rozpoznaje format na podstawie:
- Nazw kolumn (nagłówków)
- Separatora (przecinek vs średnik)
- Struktury danych

### Tworzenie Zawodników
- System sprawdza czy zawodnik już istnieje (po numerze licencji lub imieniu/nazwisku)
- Jeśli nie istnieje, tworzy nowego zawodnika
- Automatycznie określa kategorię wiekową na podstawie daty urodzenia

### Tworzenie Konkurencji
- System sprawdza czy konkurencja już istnieje
- Jeśli nie istnieje, tworzy nową konkurencję
- Automatycznie określa typ konkurencji (bieg, skok, rzut, wielobój)
- Określa jednostkę miary (czas, odległość, wysokość, punkty)

### Rejestracje
- Automatycznie tworzy rejestrację zawodnika na zawody
- Przypisuje zawodnika do odpowiedniej konkurencji
- Zapisuje dane startowe (numer, tor, seria)
- Zapisuje wyniki kwalifikacyjne (PB, SB)

## Obsługa Błędów

### Typowe Błędy
1. **Nieprawidłowy format pliku**
   - Sprawdź czy plik ma rozszerzenie .csv
   - Sprawdź kodowanie pliku (UTF-8 zalecane)

2. **Brakujące dane obowiązkowe**
   - Imię i nazwisko zawodnika
   - Nazwa konkurencji
   - Data urodzenia (zalecana)

3. **Nieprawidłowe daty**
   - Format daty musi być YYYY-MM-DD
   - Sprawdź czy daty są logiczne

4. **Duplikaty**
   - System ostrzeże o zawodnikach już zarejestrowanych
   - Nie utworzy duplikatów rejestracji

### Ostrzeżenia
- **Zawodnik już zarejestrowany** - zawodnik istnieje w systemie
- **Brakujące dane opcjonalne** - klub, numer licencji itp.
- **Nierozpoznana konkurencja** - system utworzy konkurencję z domyślnymi ustawieniami

## Wskazówki

### Przygotowanie Pliku CSV
1. **Sprawdź kodowanie** - użyj UTF-8 dla najlepszej kompatybilności
2. **Usuń puste wiersze** - mogą powodować błędy parsowania
3. **Sprawdź separatory** - używaj konsekwentnie przecinków lub średników
4. **Sprawdź cudzysłowy** - pola z przecinkami powinny być w cudzysłowach

### Najlepsze Praktyki
1. **Testuj na małych plikach** - najpierw przetestuj import na kilku zawodnikach
2. **Sprawdź wyniki** - zawsze przejrzyj wyniki importu
3. **Backup danych** - przed dużym importem zrób kopię zapasową
4. **Sprawdź konkurencje** - po imporcie sprawdź czy konkurencje są poprawnie utworzone

## Przykłady Plików

### Format PZLA
```csv
Impreza;NrKonkur;NazwaPZLA;Pełna nazwa;Runda;Seria;Tor;Miejsce;NrStart;Nazwisko;Imię;DataUr;Klub;Woj;NrLicencji Klub;AktLic Klub;Wynik;Wiatr;PK;SB;PB;Uczelnia;Licencja OZLA;Licencja OZLA ważność;Licencja PZLA;Licencja ważność;NrZawodnika;Weryf..;Weryfikacja elektr.;TOKEN;skład;Sztafeta;OOM;Kadra 2025;LDK!;DataAktualizacji;Trener
32;43;K4x100;4x100 metrów kobiet;s;;;;52;KOWALSKI;Anna;2004-07-04;AZS UMCS Lublin;LU;02/LU/15;2025;;;;'';;;;;Z/0892/18;2025;96327;;;;1;K4x100; ;KN B ;;2025-06-28 22:39:54;NOWAK Piotr;
```

### Format Roster Athletics
```csv
MeetingId,EntryId,StartListId,Title,RelayTeamName,FullName,FirstName,MiddleName,LastName,Gender,ParaClassRunJump,ParaClassThrow,NotesPublic,NotesInternal,CountryCode,DateOfBirth,YearOfBirth,SchoolGrade,TilastopajaId,RelayId,EventStart,EventCode,PZLAEventCode,PZLAEventCodeNum,UKAEventCode,EventStage,AgeGroup,MultipleAgeGroups,OldestAgeGroup,CombinedEventRelation,ShortClubName,ClubName,TeamName,TeamGender,BibNumber,Lane,EventGroup,PersonalBest,SeasonBest,SeedingResult
27019,2370744,305435,"13-14 lat",,"Anna Kowalska",Anna,,Kowalska,Female,,,,,POL,2011-10-14,2011,,721439,,"2025-06-15 17:28:00",600,"600 m",8,600,Final,14,true,14,None,"KS Zawkrze","KS Zawkrze Mława",,,616,2,0,1:54.89,1:54.89,
```

## Rozwiązywanie Problemów

### Problem: Import się nie udaje
**Rozwiązanie**: 
1. Sprawdź format pliku CSV
2. Sprawdź kodowanie (UTF-8)
3. Sprawdź czy plik nie jest uszkodzony

### Problem: Błędne rozpoznanie płci
**Rozwiązanie**:
1. Sprawdź nazwę konkurencji - powinna zawierać "kobiet"/"mężczyzn" lub "women"/"men"
2. W formacie Roster sprawdź kolumnę "Gender"

### Problem: Błędne kategorie wiekowe
**Rozwiązanie**:
1. Sprawdź format daty urodzenia (YYYY-MM-DD)
2. Sprawdź czy daty są logiczne

### Problem: Duplikaty zawodników
**Rozwiązanie**:
1. System automatycznie wykrywa duplikaty po numerze licencji
2. Jeśli brak numeru licencji, sprawdza po imieniu/nazwisku i dacie urodzenia
3. Duplikaty są pomijane z ostrzeżeniem

## Kontakt i Wsparcie

W przypadku problemów z importem:
1. Sprawdź logi błędów w wynikach importu
2. Sprawdź format pliku według tej dokumentacji
3. Skontaktuj się z administratorem systemu

---

*Dokumentacja została utworzona dla systemu zarządzania zawodami lekkoatletycznymi*