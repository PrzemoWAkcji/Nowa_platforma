# 🧪 Instrukcja Testowania Importu List Startowych

## 🚀 Uruchomienie Aplikacji

### Backend (Port 3000)
```bash
cd "c:/nowa platforma/athletics-platform/backend"
npm run start:dev
```

### Frontend (Port 3001)
```bash
cd "c:/nowa platforma/athletics-platform/frontend"
npm run dev
```

## 📋 Krok po Kroku - Test Importu

### 1. Dostęp do Aplikacji
1. Otwórz przeglądarkę i przejdź do: `http://localhost:3001`
2. Zaloguj się do systemu (jeśli wymagane)
3. Przejdź do sekcji "Zawody" / "Competitions"

### 2. Utworzenie Zawodów (jeśli potrzebne)
1. Kliknij "Dodaj zawody" / "Create Competition"
2. Wypełnij podstawowe dane:
   - Nazwa: "Test Zawody Import"
   - Data: dzisiejsza data
   - Miejsce: "Stadion Testowy"
   - Status: "PLANNED"
3. Zapisz zawody

### 3. Przejście do Szczegółów Zawodów
1. Kliknij na utworzone zawody
2. Znajdź się na stronie szczegółów zawodów
3. Sprawdź czy widoczne są sekcje:
   - Informacje o zawodach
   - Konkurencje
   - Akcje (panel boczny)

### 4. Lokalizacja Przycisków Importu
Powinieneś zobaczyć przyciski "Importuj listę startową" w dwóch miejscach:

#### A. W sekcji Konkurencje
- Obok przycisku "Dodaj konkurencję"
- Przycisk z ikoną Upload

#### B. W panelu Akcje (sidebar)
- W sekcji "Akcje szybkie"
- Przycisk z ikoną Upload

### 5. Test Importu - Format PZLA

#### Krok 1: Otwórz Dialog Importu
1. Kliknij przycisk "Importuj listę startową"
2. Sprawdź czy otwiera się dialog z trzema sekcjami:
   - Informacja o obsługiwanych formatach
   - Wybór formatu (domyślnie "AUTO")
   - Obszar drag & drop

#### Krok 2: Przygotuj Plik Testowy
Użyj pliku `test-pzla.csv` z katalogu głównego lub stwórz własny:

```csv
Impreza;NrKonkur;NazwaPZLA;Pełna nazwa;Runda;Seria;Tor;Miejsce;NrStart;Nazwisko;Imię;DataUr;Klub;Woj;NrLicencji Klub;AktLic Klub;Wynik;Wiatr;PK;SB;PB;Uczelnia;Licencja OZLA;Licencja OZLA ważność;Licencja PZLA;Licencja ważność;NrZawodnika;Weryf..;Weryfikacja elektr.;TOKEN;skład;Sztafeta;OOM;Kadra 2025;LDK!;DataAktualizacji;Trener
Mistrzostwa;1;M100;100 metrów mężczyzn;f;1;3;;101;KOWALSKI;Jan;2000-05-15;AZS Warszawa;MZ;01/MZ/20;2025;10.50;+0.5;;10.45;10.30;;;;Z/1234/18;2025;12345;;;;1;M100;;;2025-01-15 10:00:00;NOWAK Piotr
Mistrzostwa;2;K100;100 metrów kobiet;f;1;3;;201;KOWALSKA;Anna;2001-03-10;AZS Kraków;MP;03/MP/21;2025;11.80;+0.2;;11.75;11.65;;;;Z/3456/19;2025;34567;;;;1;K100;;;2025-01-15 10:00:00;WIŚNIEWSKA Maria
```

#### Krok 3: Upload Pliku
1. Przeciągnij plik CSV do obszaru drag & drop
   - LUB kliknij "Wybierz plik" i wybierz z dysku
2. Sprawdź czy format zostaje automatycznie wykryty jako "PZLA"
3. Sprawdź czy przechodzi do kroku "Podgląd"

#### Krok 4: Sprawdź Podgląd
1. Sprawdź czy wyświetla się tabela z pierwszymi wierszami
2. Sprawdź czy dane są poprawnie parsowane
3. Sprawdź wykryty format
4. Kliknij "Importuj"

#### Krok 5: Sprawdź Wyniki
Po imporcie powinieneś zobaczyć:
- ✅ Liczbę zaimportowanych zawodników
- ✅ Liczbę błędów (powinna być 0)
- ✅ Liczbę ostrzeżeń
- ✅ Wykryty format: "PZLA"

### 6. Test Importu - Format Roster

#### Użyj pliku `test-roster.csv`:
```csv
MeetingId,EntryId,StartListId,Title,RelayTeamName,FullName,FirstName,MiddleName,LastName,Gender,ParaClassRunJump,ParaClassThrow,NotesPublic,NotesInternal,CountryCode,DateOfBirth,YearOfBirth,SchoolGrade,TilastopajaId,RelayId,EventStart,EventCode,PZLAEventCode,PZLAEventCodeNum,UKAEventCode,EventStage,AgeGroup,MultipleAgeGroups,OldestAgeGroup,CombinedEventRelation,ShortClubName,ClubName,TeamName,TeamGender,BibNumber,Lane,EventGroup,PersonalBest,SeasonBest,SeedingResult
27019,2370744,305435,"U16 Boys",,"Jan Kowalski",Jan,,Kowalski,Male,,,,,POL,2008-10-14,2008,,721439,,"2025-06-15 17:28:00",100,"100 m",1,100,Final,16,false,16,None,"AZS Warszawa","AZS Warszawa",,,101,3,0,11.54,11.54,11.60
```

Powtórz kroki 3-5, sprawdzając czy format zostaje wykryty jako "ROSTER".

### 7. Weryfikacja Wyników Importu

#### A. Sprawdź Zawodników
1. Przejdź do sekcji "Zawodnicy" / "Athletes"
2. Sprawdź czy zostali utworzeni nowi zawodnicy:
   - Jan Kowalski
   - Anna Kowalska
   - itd.

#### B. Sprawdź Konkurencje
1. W szczegółach zawodów sprawdź sekcję "Konkurencje"
2. Sprawdź czy zostały utworzone:
   - 100 metrów mężczyzn
   - 100 metrów kobiet
   - 400 metrów mężczyzn (jeśli w pliku)

#### C. Sprawdź Rejestracje
1. Sprawdź czy zawodnicy są przypisani do konkurencji
2. Sprawdź czy zachowane są dane startowe:
   - Numery startowe
   - Tory
   - Serie
   - Wyniki kwalifikacyjne (PB/SB)

### 8. Test Obsługi Błędów

#### A. Test Nieprawidłowego Pliku
1. Stwórz plik z błędnymi danymi:
```csv
Błędny;Format;Bez;Wymaganych;Kolumn
Test;Test;Test;Test;Test
```
2. Spróbuj zaimportować
3. Sprawdź czy wyświetlają się odpowiednie błędy

#### B. Test Duplikatów
1. Zaimportuj ten sam plik dwukrotnie
2. Sprawdź czy system wykrywa duplikaty
3. Sprawdź ostrzeżenia o już istniejących zawodnikach

### 9. Test Pomocy Kontekstowej

#### Sprawdź Komponent Pomocy
1. W dialogu importu kliknij przycisk "Pomoc"
2. Sprawdź czy otwiera się dialog pomocy z zakładkami:
   - Przegląd
   - Formaty
   - Proces
   - Problemy
3. Sprawdź czy zawiera przykłady plików CSV

## ✅ Checklist Testów

### Funkcjonalność Podstawowa
- [ ] Dialog importu otwiera się poprawnie
- [ ] Drag & drop działa
- [ ] Wybór pliku z dysku działa
- [ ] Automatyczne rozpoznawanie formatu PZLA
- [ ] Automatyczne rozpoznawanie formatu Roster
- [ ] Podgląd danych przed importem
- [ ] Import zawodników
- [ ] Import konkurencji
- [ ] Tworzenie rejestracji

### Dane Importowane
- [ ] Imiona i nazwiska zawodników
- [ ] Daty urodzenia
- [ ] Kluby
- [ ] Numery licencji
- [ ] Nazwy konkurencji
- [ ] Numery startowe
- [ ] Tory
- [ ] Serie
- [ ] Wyniki kwalifikacyjne (PB/SB)

### Obsługa Błędów
- [ ] Błędne pliki CSV
- [ ] Brakujące wymagane dane
- [ ] Duplikaty zawodników
- [ ] Nieprawidłowe daty
- [ ] Komunikaty błędów są czytelne

### Interface Użytkownika
- [ ] Przyciski importu w odpowiednich miejscach
- [ ] Dialog jest responsywny
- [ ] Pomoc kontekstowa działa
- [ ] Wyniki importu są czytelne
- [ ] Można zamknąć dialog po imporcie

### Integracja
- [ ] Dane są zapisywane w bazie
- [ ] Listy są odświeżane po imporcie
- [ ] Można przejść do utworzonych konkurencji
- [ ] Można zobaczyć zarejestrowanych zawodników

## 🐛 Znane Problemy i Rozwiązania

### Problem: Błędne kodowanie polskich znaków
**Rozwiązanie**: Zapisz plik CSV w kodowaniu UTF-8

### Problem: Błędne rozpoznanie formatu
**Rozwiązanie**: Ręcznie wybierz format z listy rozwijanej

### Problem: Brak uprawnień do importu
**Rozwiązanie**: Zaloguj się jako ADMIN, ORGANIZER lub JUDGE

## 📞 Kontakt w Przypadku Problemów

Jeśli napotkasz problemy podczas testowania:
1. Sprawdź logi w konsoli przeglądarki (F12)
2. Sprawdź logi backendu w terminalu
3. Sprawdź czy wszystkie wymagane pola są wypełnione
4. Sprawdź format pliku CSV według dokumentacji

---

*Instrukcja testowania dla systemu importu list startowych*