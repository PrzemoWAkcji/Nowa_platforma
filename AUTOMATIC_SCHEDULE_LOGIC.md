# Logika Automatycznego Generowania Programu Minutowego

## Nowa Logika Czasów (Zaktualizowana)

### 🏃‍♂️ Konkurencje Biegowe (TRACK)

#### Sprinty (60m, 100m, 200m, 400m)

- **Czas na serię**: 3 minuty
- **Przerwa między konkurencjami**:
  - **Biegi płaskie**: 0 minut (bez przerwy)
  - **Biegi płotkowe**: 10 minut

#### Średnie dystanse (800m, 1500m)

- **Czas na serię**: 10 minut
- **Przerwa**: 5 minut

#### Długie dystanse (3000m, 5000m, 10000m, maraton)

- **Czas na serię**: 15 minut
- **Przerwa**: 10 minut

#### Sztafety (4x100m, 4x400m, itp.)

- **Czas na serię**: 5 minut
- **Przerwa**: 5 minut

#### Inne biegi

- **Czas na serię**: 10 minut (domyślnie)
- **Przerwa**: 5 minut

### 🏃‍♀️ Konkurencje Techniczne (FIELD)

#### Skoki Pionowe (wzwyż, o tyczce)

- **Czas**: 3 minuty na zawodnika
- **Minimum**: 20 minut na konkurencję
- **Przerwa**: 5 minut

#### Skoki Poziome (w dal, potrójny)

- **Próby**: 3 próby na zawodnika
- **Czas**: 2 minuty na próbę
- **Obliczenie**: zawodnicy × 3 próby × 2 minuty
- **Przerwa**: 5 minut

#### Rzuty (kula, dysk, młot, oszczep)

- **Próby eliminacyjne**: 3 próby na zawodnika
- **Próby finałowe**: 6 prób na zawodnika
- **Czas**: 2 minuty na próbę
- **Obliczenie**: zawodnicy × próby × 2 minuty
- **Przerwa**: 5 minut

#### Wieloboje

- **Próby**: 3 próby na zawodnika
- **Czas**: 2 minuty na próbę
- **Przerwa**: 5 minut

## 🔍 Rozpoznawanie Konkurencji

### Płotki (Hurdles)

System rozpoznaje konkurencje płotkowe na podstawie słów kluczowych:

- `płotki`, `hurdles`
- `110m płotki`, `100m płotki`, `400m płotki`
- `110m hurdles`, `100m hurdles`, `400m hurdles`

### Dystanse Biegowe

- **60m, 100m, 200m, 400m**: Sprinty
- **800m, 1500m**: Średnie dystanse
- **3000m, 5000m, 10000m, maraton**: Długie dystanse
- **4x**: Sztafety

### Konkurencje Techniczne

- **Skoki pionowe**: `skok wzwyż`, `skok o tyczce`, `high jump`, `pole vault`
- **Skoki poziome**: `skok w dal`, `skok potrójny`, `long jump`, `triple jump`
- **Rzuty**: `pchnięcie`, `rzut dyskiem`, `rzut młotem`, `rzut oszczepem`, `shot put`, `discus`, `hammer`, `javelin`

## 📊 Przykłady Obliczeń

### Przykład 1: Bieg 100m płaski

- **3 serie × 3 minuty = 9 minut**
- **Przerwa: 0 minut**
- **Następna konkurencja: od razu**

### Przykład 2: Bieg 110m płotki

- **2 serie × 3 minuty = 6 minut**
- **Przerwa: 10 minut**
- **Następna konkurencja: po 16 minutach**

### Przykład 3: Skok w dal (12 zawodników)

- **Eliminacje**: 12 zawodników × 3 próby × 2 min = 72 minuty
- **Finał**: 12 zawodników × 3 próby × 2 min = 72 minuty
- **Przerwa między rundami**: 5 minut

### Przykład 4: Pchnięcie kulą (15 zawodników)

- **Eliminacje**: 15 zawodników × 3 próby × 2 min = 90 minut
- **Finał**: 12 zawodników × 6 prób × 2 min = 144 minuty
- **Przerwa**: 5 minut

### Przykład 5: Skok wzwyż (10 zawodników)

- **Finał**: 10 zawodników × 3 min = 30 minut
- **Przerwa**: 5 minut

## 🎯 Logika Rund

### Biegi

- **Zawsze serie** (8 osób na serię)
- **Liczba serii**: ⌈liczba uczestników ÷ 8⌉

### Konkurencje Techniczne

- **≤12 uczestników**: Bezpośrednio finał
- **>12 uczestników**: Eliminacje → Finał (12 najlepszych)

## ⏰ Harmonogram Przykładowy

```
09:00 - Bieg 100m K (Serie 1-3) - 9 min
09:09 - Bieg 100m M (Serie 1-4) - 12 min
09:21 - Bieg 110m płotki M (Serie 1-2) - 6 min + 10 min przerwy
09:37 - Skok w dal K (Eliminacje) - 72 min
10:49 - Bieg 800m K (Serie 1-2) - 20 min + 5 min przerwy
11:14 - Skok w dal K (Finał) - 72 min
```

## 🔧 Implementacja Techniczna

### Funkcja główna

```typescript
const handleGenerateAuto = async () => {
  // Sortowanie: biegi → konkurencje techniczne
  // Dla każdej konkurencji:
  //   - Określ typ (TRACK/FIELD)
  //   - Rozpoznaj konkretną konkurencję
  //   - Oblicz czas trwania
  //   - Dodaj odpowiednią przerwę
  //   - Ustaw następny czas rozpoczęcia
};
```

### Rozpoznawanie konkurencji

```typescript
const eventName = event.name.toLowerCase();
const isHurdles = eventName.includes("płotki") || eventName.includes("hurdles");
```

### Obliczanie czasu

```typescript
// Biegi: serie × czas_na_serię
duration = roundInfo.seriesCount * timePerSeries;

// Konkurencje techniczne: zawodnicy × próby × 2_minuty
duration = actualParticipants * attemptsPerAthlete * 2;
```

Ta nowa logika zapewnia bardziej realistyczne czasy trwania konkurencji i odpowiednie przerwy między nimi, zgodnie z praktyką organizacji zawodów lekkoatletycznych.
