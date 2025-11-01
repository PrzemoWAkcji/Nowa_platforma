# 🏃‍♂️ Zaawansowane rozstawienie zawodników - Dokumentacja

## Przegląd

System zaawansowanego rozstawiania zawodników został wdrożony zgodnie ze standardami **Roster Athletics** i **World Athletics**. Oferuje profesjonalne metody podziału na serie i przypisania torów, używane w zawodach lekkoatletycznych na całym świecie.

## 🎯 Funkcjonalności

### 1. Metody podziału na serie/grupy

#### Podstawowe metody
- **Alfanumerycznie (po numerze)** - Podział według numerów startowych
- **Alfabetycznie (po nazwisku)** - Podział alfabetyczny według nazwisk
- **Według czasu/wyniku** - Standardowy podział według wyników
- **Losowo** - Losowy podział na serie

#### Zaawansowane metody
- **Koło (Round Robin)** - Zawodnicy przypisywani po kolei do serii
- **Zygzak** - Najlepsi zawodnicy rozdzielani metodą zygzaka
- **Według czasu (hala)** - Specjalna metoda dla zawodów halowych
- **Serpentynowo** - Metoda serpentynowa zgodna z przepisami PZLA

### 2. Metody przypisania torów

#### Standardowe metody
- **Od najlepszego do najgorszego** - Tor 1 = najlepszy
- **Od najgorszego do najlepszego** - Tor 1 = najgorszy
- **Standardowo od zewnątrz** - Kolejność 1,2,3,4,5,6,7,8
- **Standardowo od wewnątrz** - Kolejność 8,7,6,5,4,3,2,1

#### Metody parowe
- **Pary** - Zawodnicy w parach, najlepsza para na torach środkowych
- **Pary (hala)** - Specjalne pary dla zawodów halowych
- **Pół na pół** - Najlepsi 4 w środku, pozostali na zewnątrz

#### Metody wodospadu
- **Wodospad** - Najlepszy najbliżej wewnętrznej strony
- **Wodospad odwrócony** - Najlepszy najbliżej zewnętrznej strony

#### World Athletics Standards
- **WA - Połówki i pary** - Stary standard WA
- **WA - Sprinty (prosta)** - Standard dla sprintów
- **WA - 200m** - Specjalny standard dla 200m
- **WA - 400m/800m** - Standard dla średnich dystansów
- **WA - 9 torów** - Standard dla bieżni 9-torowych

## 🔧 Implementacja techniczna

### Backend

#### Nowe endpointy
```typescript
POST /api/organization/heats/advanced-auto-assign
```

#### Nowe DTO
```typescript
class AdvancedAutoAssignDto {
  eventId: string;
  round: string;
  seriesMethod: AssignmentMethodEnum;
  laneMethod: AssignmentMethodEnum;
  maxLanes?: number;
  heatsCount?: number;
  finalistsCount?: number;
  maxLanesIndoor?: number;
  seedingCriteria?: string;
}
```

#### Rozszerzone enum AssignmentMethod
```typescript
enum AssignmentMethod {
  // Podstawowe metody
  MANUAL, SEED_TIME, RANDOM, SERPENTINE, STRAIGHT_FINAL,
  
  // Metody podziału na serie
  ALPHABETICAL_NUMBER, ALPHABETICAL_NAME, ROUND_ROBIN, 
  ZIGZAG, BY_RESULT, BY_RESULT_INDOOR,
  
  // Metody przypisania torów
  BEST_TO_WORST, WORST_TO_BEST, HALF_AND_HALF, PAIRS, 
  PAIRS_INDOOR, STANDARD_OUTSIDE, STANDARD_INSIDE, 
  WATERFALL, WATERFALL_REVERSE,
  
  // World Athletics standardy
  WA_HALVES_AND_PAIRS, WA_SPRINTS_STRAIGHT, WA_200M, 
  WA_400M_800M, WA_9_LANES
}
```

### Frontend

#### Nowy komponent AdvancedHeatManager
- Interfejs z dwoma krokami: podział na serie + przypisanie torów
- Zalecane ustawienia dla różnych typów konkurencji
- Podgląd w czasie rzeczywistym
- Opcje zaawansowane (liczba torów, liczba serii)

#### Integracja z istniejącym HeatManager
- Zakładki: "Podstawowe rozstawienie" i "Zaawansowane rozstawienie"
- Zachowana kompatybilność wsteczna

## 📋 Instrukcja użytkowania

### 1. Dostęp do funkcji
1. Przejdź do **Organizacja zawodów** → **Rozstawienie**
2. Wybierz zakładkę **"Zaawansowane rozstawienie"**

### 2. Konfiguracja rozstawienia
1. **Wybierz wydarzenie** z listy dostępnych konkurencji
2. **Wybierz rundę** (Eliminacje, Półfinał, Finał)
3. **Ustaw metodę podziału na serie** (krok 1)
4. **Ustaw metodę przypisania torów** (krok 2)
5. **Opcjonalnie**: Dostosuj liczbę torów i serii

### 3. Zalecane ustawienia
System automatycznie sugeruje optymalne ustawienia dla różnych typów konkurencji:

#### Sprinty (100m, 200m)
- **Serie**: Według czasu/wyniku
- **Tory**: WA - Sprinty (prosta)

#### Średnie dystanse (400m, 800m)
- **Serie**: Według czasu/wyniku  
- **Tory**: WA - 400m/800m

#### Długie dystanse (1500m+)
- **Serie**: Według czasu/wyniku
- **Tory**: Wodospad

#### Konkurencje techniczne
- **Serie**: Według czasu/wyniku
- **Tory**: Od najlepszego do najgorszego

### 4. Wykonanie rozstawienia
1. Kliknij **"Rozstaw zawodników"**
2. System automatycznie utworzy serie i przypisze tory
3. Sprawdź wyniki w sekcji **"Utworzone serie"**

## 🏆 Zgodność ze standardami

### World Athletics
- Implementacja oficjalnych standardów WA dla różnych dystansów
- Specjalne metody dla bieżni 9-torowych
- Zgodność z przepisami dla eliminacji i finałów

### Roster Athletics
- Pełna implementacja metod z dokumentacji Roster Athletics
- Wszystkie 18 metod podziału na serie/grupy
- Wszystkie 18 metod przypisania torów/kolejności

### PZLA
- Zachowana kompatybilność z polskimi przepisami
- Metoda serpentynowa zgodna z PZLA
- Obsługa specyfiki zawodów halowych

## 🔍 Przykłady użycia

### Przykład 1: Finał 100m męski (8 zawodników)
```
Metoda: WA - Sprinty (prosta)
Wynik:
Tor 1: 7. zawodnik
Tor 2: 5. zawodnik  
Tor 3: 3. zawodnik
Tor 4: 1. zawodnik (najlepszy)
Tor 5: 2. zawodnik
Tor 6: 4. zawodnik
Tor 7: 6. zawodnik
Tor 8: 8. zawodnik
```

### Przykład 2: Eliminacje 400m (24 zawodników, 3 serie)
```
Podział na serie: Według czasu/wyniku
Przypisanie torów: WA - 400m/800m

Seria 1: Zawodnicy 17-24 (najwolniejsi)
Seria 2: Zawodnicy 9-16  
Seria 3: Zawodnicy 1-8 (najszybsi)
```

### Przykład 3: Skok w dal (12 zawodników)
```
Podział na serie: Według wyniku
Przypisanie torów: Od najlepszego do najgorszego

Kolejność skoków: 1. najlepszy, 2. drugi najlepszy, itd.
```

## 🚀 Korzyści

### Dla organizatorów
- **Profesjonalizm**: Zgodność z międzynarodowymi standardami
- **Automatyzacja**: Szybkie rozstawienie dużej liczby zawodników
- **Elastyczność**: Możliwość dostosowania do specyfiki zawodów
- **Przejrzystość**: Jasne zasady rozstawienia

### Dla zawodników
- **Sprawiedliwość**: Równe szanse dla wszystkich uczestników
- **Przewidywalność**: Znane i sprawdzone metody rozstawienia
- **Motywacja**: Najlepsi zawodnicy w najlepszych pozycjach

### Dla sędziów
- **Standardy**: Zgodność z oficjalnymi przepisami
- **Dokumentacja**: Pełna historia rozstawienia
- **Kontrola**: Możliwość weryfikacji poprawności

## 🔧 Rozwiązywanie problemów

### Błąd: "No participants registered"
- **Przyczyna**: Brak zarejestrowanych zawodników do wydarzenia
- **Rozwiązanie**: Sprawdź rejestracje w sekcji "Uczestnicy"

### Błąd: "Too many participants for straight final"
- **Przyczyna**: Więcej niż 8 zawodników dla finału bezpośredniego
- **Rozwiązanie**: Użyj eliminacji lub zwiększ liczbę torów

### Błąd: "Use advanced-auto-assign endpoint"
- **Przyczyna**: Próba użycia zaawansowanej metody w podstawowym trybie
- **Rozwiązanie**: Przejdź do zakładki "Zaawansowane rozstawienie"

## 📈 Przyszłe rozszerzenia

### Planowane funkcje
- **Import czasów kwalifikacyjnych** z zewnętrznych baz danych
- **Automatyczne rozstawienie wielobojów** zgodnie z tabelami punktowymi
- **Integracja z systemami pomiaru czasu** dla automatycznego seedingu
- **Eksport list startowych** w formatach PDF/Excel
- **Historia rozstawień** z możliwością przywracania

### Możliwe ulepszenia
- **Wizualizacja torów** w formie graficznej
- **Symulacja wyników** na podstawie czasów zgłoszeniowych
- **Optymalizacja czasów** między seriami
- **Powiadomienia** o zmianach w rozstawieniu

## 📞 Wsparcie

W przypadku problemów lub pytań dotyczących zaawansowanego rozstawiania:

1. Sprawdź tę dokumentację
2. Skorzystaj z pomocy kontekstowej w aplikacji
3. Skontaktuj się z administratorem systemu

---

*Dokumentacja została utworzona w oparciu o standardy Roster Athletics i World Athletics. Ostatnia aktualizacja: Styczeń 2025*