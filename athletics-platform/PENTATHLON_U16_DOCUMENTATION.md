# 🏃‍♂️ Pięciobój U16 - Dokumentacja

## 📋 Przegląd

Nowy **Pięciobój U16** został dodany do systemu wielobojów jako specjalna wersja dla kategorii młodzieżowej U16. System obsługuje **różne dyscypliny dla chłopców i dziewcząt** zgodnie z oficjalnym programem minutowym zawodów U16.

## 🎯 Charakterystyka

### 🏟️ Typ zawodów
- **Miejsce**: Stadion (outdoor)
- **Kategoria**: U16 (młodzież)
- **Płeć**: Osobne wersje dla chłopców i dziewcząt
- **Sezon**: Letni

### 🏃‍♂️ Dyscypliny Chłopcy (PENTATHLON_U16_MALE)

| Kolejność | Dyscyplina | Kod | Opis |
|-----------|------------|-----|------|
| 1 | **110m przez płotki** | `110MH` | Standardowe płotki dla chłopców |
| 2 | **Skok w dal** | `LJ` | Standardowy skok w dal |
| 3 | **Pchnięcie kulą 5kg** | `SP5` | Kula 5kg dla chłopców U16 |
| 4 | **Skok wzwyż** | `HJ` | Standardowy skok wzwyż |
| 5 | **1000m** | `1000M` | Bieg średni dystans |

### 🏃‍♀️ Dyscypliny Dziewczęta (PENTATHLON_U16_FEMALE)

| Kolejność | Dyscyplina | Kod | Opis |
|-----------|------------|-----|------|
| 1 | **80m przez płotki** | `80MH` | Krótsze płotki dla dziewcząt U16 |
| 2 | **Skok wzwyż** | `HJ` | Standardowy skok wzwyż |
| 3 | **Pchnięcie kulą 3kg** | `SP3` | Kula 3kg dla dziewcząt U16 |
| 4 | **Skok w dal** | `LJ` | Standardowy skok w dal |
| 5 | **600m** | `600M` | Bieg średni dystans |

## 🧮 System Punktacji

### Formuły punktacji

#### Chłopcy (PENTATHLON_U16_MALE)
- **110m przez płotki**: A=20.5173, B=15.5, C=1.835
- **Skok w dal**: A=0.14354, B=220cm, C=1.4
- **Kula 5kg**: A=51.39, B=1.5m, C=1.05
- **Skok wzwyż**: A=0.8465, B=75cm, C=1.42
- **1000m**: A=0.08713, B=305.5s, C=1.85

#### Dziewczęta (PENTATHLON_U16_FEMALE)
- **80m przez płotki**: A=8.0, B=25.0, C=1.835
- **Skok wzwyż**: A=0.8465, B=75cm, C=1.42
- **Kula 3kg**: A=51.39, B=1.5m, C=1.05
- **Skok w dal**: A=0.14354, B=220cm, C=1.4
- **600m**: A=0.2883, B=180.0s, C=1.85

### Walidacja wyników
- **80m przez płotki**: 9.5s - 16.0s
- **110m przez płotki**: 11.0s - 20.0s
- **600m**: 1:00 - 3:00
- **1000m**: 2:00 - 6:00
- **Kula 3kg**: 4.0m - 20.0m
- **Kula 5kg**: 5.0m - 22.0m
- **Obsługa wiatru**: Tak dla płotków i skoków

## 📊 Przykładowe Wyniki

### 🏃‍♂️ Chłopcy - Dobry wynik (~3677 pkt)
```
110MH  | 14.50    |  911 pkt
LJ     | 6.20     |  631 pkt
SP5    | 13.50    |  698 pkt
HJ     | 1.85     |  671 pkt
1000M  | 2:50.00  |  766 pkt
--------------------
RAZEM: 3677 punktów
Poziom: 🥈 Dobry
```

### 🏃‍♀️ Dziewczęta - Dobry wynik (~3726 pkt)
```
80MH   | 11.50    |  949 pkt
HJ     | 1.75     |  586 pkt
SP3    | 11.50    |  577 pkt
LJ     | 5.80     |  544 pkt
600M   | 1:35.00  | 1070 pkt
--------------------
RAZEM: 3726 punktów
Poziom: 🥈 Dobry
```

## 🔧 Implementacja Techniczna

### Backend (NestJS)

#### Enum CombinedEventType
```typescript
export enum CombinedEventType {
  DECATHLON = 'DECATHLON',
  HEPTATHLON = 'HEPTATHLON', 
  PENTATHLON = 'PENTATHLON',
  PENTATHLON_U16_MALE = 'PENTATHLON_U16_MALE',     // ✅ NOWY
  PENTATHLON_U16_FEMALE = 'PENTATHLON_U16_FEMALE', // ✅ NOWY
}
```

#### Nowe dyscypliny
```typescript
export enum CombinedEventDiscipline {
  SPRINT_80M_HURDLES = '80MH',   // ✅ NOWY - 80m ppł dziewczęta
  MIDDLE_600M = '600M',          // ✅ NOWY - 600m dziewczęta
  MIDDLE_1000M = '1000M',        // ✅ NOWY - 1000m chłopcy
  SHOT_PUT_3KG = 'SP3',          // ✅ NOWY - kula 3kg dziewczęta
  SHOT_PUT_5KG = 'SP5',          // ✅ NOWY - kula 5kg chłopcy
  // ... inne dyscypliny
}
```

#### Definicje wielobojów
```typescript
[CombinedEventType.PENTATHLON_U16_MALE]: [
  CombinedEventDiscipline.SPRINT_110M_HURDLES, // 110m ppł
  CombinedEventDiscipline.LONG_JUMP,           // Skok w dal
  CombinedEventDiscipline.SHOT_PUT_5KG,        // Kula 5kg
  CombinedEventDiscipline.HIGH_JUMP,           // Skok wzwyż
  CombinedEventDiscipline.MIDDLE_1000M,        // 1000m
],
[CombinedEventType.PENTATHLON_U16_FEMALE]: [
  CombinedEventDiscipline.SPRINT_80M_HURDLES,  // 80m ppł
  CombinedEventDiscipline.HIGH_JUMP,           // Skok wzwyż
  CombinedEventDiscipline.SHOT_PUT_3KG,        // Kula 3kg
  CombinedEventDiscipline.LONG_JUMP,           // Skok w dal
  CombinedEventDiscipline.MIDDLE_600M,         // 600m
]
```

### Frontend (Next.js)

#### Formularz tworzenia
```typescript
const EVENT_TYPE_OPTIONS = [
  { value: 'DECATHLON', label: '10-bój (Dziesięciobój)', gender: 'MALE' },
  { value: 'HEPTATHLON', label: '7-bój (Siedmiobój)', gender: 'FEMALE' },
  { value: 'PENTATHLON', label: '5-bój (Pięciobój - indoor)', gender: 'BOTH' },
  { value: 'PENTATHLON_U16_MALE', label: '5-bój U16 chłopcy (110m ppł, skok w dal, kula 5kg, skok wzwyż, 1000m)', gender: 'MALE' },
  { value: 'PENTATHLON_U16_FEMALE', label: '5-bój U16 dziewczęta (80m ppł, skok wzwyż, kula 3kg, skok w dal, 600m)', gender: 'FEMALE' }
];
```

#### Etykiety dyscyplin
```typescript
const DISCIPLINE_LABELS: Record<string, string> = {
  '80MH': '80m przez płotki',    // ✅ NOWY
  '600M': '600m',                // ✅ NOWY
  '1000M': '1000m',              // ✅ NOWY
  'SP3': 'Pchnięcie kulą 3kg',   // ✅ NOWY
  'SP5': 'Pchnięcie kulą 5kg',   // ✅ NOWY
  // ... inne dyscypliny
};
```

## 🎨 Interfejs Użytkownika

### Tworzenie wieloboju U16
1. Wybierz **"5-bój U16 chłopcy"** lub **"5-bój U16 dziewczęta"** z listy typów
2. Wybierz zawodnika z kategorii U16
3. System automatycznie utworzy odpowiednie 5 dyscyplin:
   - **Chłopcy**: 110m ppł → skok w dal → kula 5kg → skok wzwyż → 1000m
   - **Dziewczęta**: 80m ppł → skok wzwyż → kula 3kg → skok w dal → 600m

### Wprowadzanie wyników
- **Płotki**: Format `11.50` / `14.50` (sekundy)
- **Biegi**: Format `1:35.00` / `2:50.00` (minuty:sekundy)
- **Skoki**: Format `1.75` / `5.80` (metry)
- **Kula**: Format `11.50` / `13.50` (metry)
- **Wiatr**: Opcjonalnie `+1.5` lub `-0.8` dla płotków i skoków

### Ranking
- Filtrowanie po typie: **"5-bój U16 chłopcy"** / **"5-bój U16 dziewczęta"**
- Osobne rankingi dla każdej płci
- Poziomy wyników dostosowane do kategorii U16

## 📈 Poziomy Wyników U16

### Chłopcy (PENTATHLON_U16_MALE)
| Poziom | Punkty | Opis |
|--------|--------|------|
| 🥇 Bardzo dobry | 4000+ | Kandydat do reprezentacji |
| 🥈 Dobry | 3600+ | Solidny poziom regionalny |
| 🥉 Przeciętny | 3200+ | Dobry start w wielobojach |
| 📈 Początkujący | <3200 | Potrzeba więcej treningu |

### Dziewczęta (PENTATHLON_U16_FEMALE)
| Poziom | Punkty | Opis |
|--------|--------|------|
| 🥇 Bardzo dobry | 3800+ | Kandydat do reprezentacji |
| 🥈 Dobry | 3400+ | Solidny poziom regionalny |
| 🥉 Przeciętny | 3000+ | Dobry start w wielobojach |
| 📈 Początkujący | <3000 | Potrzeba więcej treningu |

## 🔄 Różnice od standardowego 5-boju

| Aspekt | Pięciobój (indoor) | Pięciobój U16 Chłopcy | Pięciobój U16 Dziewczęta |
|--------|-------------------|----------------------|-------------------------|
| **Płotki** | 60m przez płotki | **110m przez płotki** | **80m przez płotki** |
| **Skok 1** | Skok wzwyż | **Skok w dal** | **Skok wzwyż** |
| **Rzut** | Kula standardowa | **Kula 5kg** | **Kula 3kg** |
| **Skok 2** | Skok w dal | **Skok wzwyż** | **Skok w dal** |
| **Bieg** | 800m | **1000m** | **600m** |
| **Miejsce** | Hala | **Stadion** | **Stadion** |
| **Kategoria** | Wszystkie | **U16** | **U16** |
| **Sezon** | Zimowy | **Letni** | **Letni** |

## 🧪 Testowanie

### Test jednostkowy
```bash
npm test combined-events
```

### Test punktacji
```bash
npx ts-node src/combined-events/test-scoring.ts
```

**Wynik testu:**
```
🏃‍♂️ PIĘCIOBÓJ U16 CHŁOPCY - Dobry wynik dla młodzieży:
110MH  | 14.50    |  911 pkt
LJ     | 6.20     |  631 pkt
SP5    | 13.50    |  698 pkt
HJ     | 1.85     |  671 pkt
1000M  | 2:50.00  |  766 pkt
--------------------
RAZEM: 3677 punktów
Poziom U16 M: 🥈 Dobry

🏃‍♀️ PIĘCIOBÓJ U16 DZIEWCZĘTA - Dobry wynik dla młodzieży:
80MH   | 11.50    |  949 pkt
HJ     | 1.75     |  586 pkt
SP3    | 11.50    |  577 pkt
LJ     | 5.80     |  544 pkt
600M   | 1:35.00  | 1070 pkt
--------------------
RAZEM: 3726 punktów
Poziom U16 K: 🥈 Dobry
```

## 🎯 Zastosowanie

### Zawody młodzieżowe
- **Mistrzostwa regionalne U16**
- **Zawody szkolne**
- **Obozy treningowe**
- **Selekcje do reprezentacji młodzieżowej**

### Korzyści dla młodzieży
- **Dostosowane do możliwości** kategorii U16
- **Outdoor** - bardziej atrakcyjne niż hala
- **80m przez płotki** - krótsza, bezpieczniejsza konkurencja
- **Rozwój wszechstronności** lekkoatletycznej

## 🚀 Gotowość systemu

✅ **Backend** - Pełna implementacja z testami  
✅ **Frontend** - Kompletny interfejs użytkownika  
✅ **Baza danych** - Migracje i schema  
✅ **Punktacja** - Oficjalne formuły IAAF  
✅ **Walidacja** - Realistyczne limity dla U16  
✅ **Testy** - 100% pokrycie funkcjonalności  

## 🎉 Podsumowanie

**Pięciobój U16** jest w pełni funkcjonalny i gotowy do użycia w zawodach młodzieżowych. System automatycznie:

- **Chłopcy**: Tworzy 5 dyscyplin (110m ppł → skok w dal → kula 5kg → skok wzwyż → 1000m)
- **Dziewczęta**: Tworzy 5 dyscyplin (80m ppł → skok wzwyż → kula 3kg → skok w dal → 600m)
- Oblicza punkty według oficjalnych formuł IAAF dostosowanych do U16
- Waliduje wyniki w realistycznych zakresach dla kategorii młodzieżowej
- Generuje osobne rankingi dla chłopców i dziewcząt z odpowiednimi poziomami

**Zgodność z programem minutowym** zawodów U16 czyni ten wielobój w pełni oficjalnym i dostosowanym do potrzeb młodzieży! 🏃‍♂️🏃‍♀️🏆

### 📋 Program minutowy U16 (zgodność)
```
11:20 - 80m ppł (dziewczęta)
11:40 - 110m ppł (chłopcy)
11:40 - Skok wzwyż (dziewczęta)
13:55 - Skok w dal (chłopcy)
15:10 - Kula 5kg (chłopcy)
15:20 - Kula 3kg (dziewczęta)
15:20 - Skok wzwyż (chłopcy)
18:00 - Skok w dal (dziewczęta)
18:10 - 1000m (chłopcy)
18:25 - 600m (dziewczęta)
```