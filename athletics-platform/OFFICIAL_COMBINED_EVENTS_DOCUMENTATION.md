# 📋 Oficjalne Wieloboje - Dokumentacja Kompletna

## 🎯 Przegląd

System obsługuje wszystkie oficjalne wieloboje zgodnie z przepisami **World Athletics** i **WMA (World Masters Athletics)**, plus niestandardowe wieloboje lokalne.

## 📚 Kategorie Wielobojów

### 🏆 **OFICJALNE WIELOBOJE WORLD ATHLETICS**

#### 1. **Dziesięciobój (Decathlon)** - Mężczyźni
- **Kod**: `DECATHLON`
- **Dyscyplin**: 10
- **Dni**: 2
- **Kolejność**:
  - **Dzień 1**: 100m, Skok w dal, Pchnięcie kulą, Skok wzwyż, 400m
  - **Dzień 2**: 110m przez płotki, Rzut dyskiem, Skok o tyczce, Rzut oszczepem, 1500m

#### 2. **Siedmiobój (Heptathlon)** - Kobiety
- **Kod**: `HEPTATHLON`
- **Dyscyplin**: 7
- **Dni**: 2
- **Kolejność**:
  - **Dzień 1**: 100m przez płotki, Skok wzwyż, Pchnięcie kulą, 200m
  - **Dzień 2**: Skok w dal, Rzut oszczepem, 800m

#### 3. **Pięciobój Indoor** - Mężczyźni i Kobiety
- **Kod**: `PENTATHLON_INDOOR`
- **Dyscyplin**: 5
- **Dni**: 1
- **Kolejność**: 60m przez płotki, Skok wzwyż, Pchnięcie kulą, Skok w dal, 800m

#### 4. **Pięciobój Outdoor** - Kobiety
- **Kod**: `PENTATHLON_OUTDOOR`
- **Dyscyplin**: 5
- **Dni**: 1
- **Kolejność**: 100m przez płotki, Skok wzwyż, Pchnięcie kulą, Skok w dal, 800m

---

### 🥇 **WIELOBOJE MASTERS (WMA) - Kategorie 35+**

#### 1. **Dziesięciobój Masters** - Mężczyźni 35+
- **Kod**: `DECATHLON_MASTERS`
- **Kategoria**: Masters (35+)
- **Identyczna kolejność** jak standardowy Dziesięciobój
- **Specyfikacje**: Dostosowane implementy i wysokości płotków według wieku

#### 2. **Siedmiobój Masters** - Kobiety 35+
- **Kod**: `HEPTATHLON_MASTERS`
- **Kategoria**: Masters (35+)
- **Identyczna kolejność** jak standardowy Siedmiobój
- **Specyfikacje**: Dostosowane implementy i wysokości płotków według wieku

#### 3. **Pięciobój Indoor Masters** - Mężczyźni i Kobiety 35+
- **Kod**: `PENTATHLON_INDOOR_MASTERS`
- **Kategoria**: Masters (35+)
- **Kolejność**: 60m przez płotki, Skok wzwyż, Pchnięcie kulą, Skok w dal, 800m

#### 4. **Pięciobój Outdoor Masters** - Różny dla płci
- **Kod**: `PENTATHLON_OUTDOOR_MASTERS`
- **Kategoria**: Masters (35+)
- **Mężczyźni**: Skok w dal, Rzut oszczepem, 200m, Rzut dyskiem, 1500m
- **Kobiety**: 100m przez płotki, Skok wzwyż, Pchnięcie kulą, Skok w dal, 800m

#### 5. **Pięciobój Rzutowy Masters** - Mężczyźni i Kobiety 35+
- **Kod**: `THROWS_PENTATHLON_MASTERS`
- **Kategoria**: Masters (35+)
- **Kolejność**: Rzut młotem, Pchnięcie kulą, Rzut dyskiem, Rzut oszczepem, Rzut wagą
- **Specjalność**: Tylko konkurencje rzutowe

---

### 🔧 **NIESTANDARDOWE WIELOBOJE (LOKALNE)**

#### 1. **Pięciobój U16 Chłopcy** (Niestandardowy)
- **Kod**: `PENTATHLON_U16_MALE`
- **Kategoria**: Niestandardowy/Lokalny
- **Kolejność**: 110m przez płotki, Skok w dal, Kula 5kg, Skok wzwyż, 1000m

#### 2. **Pięciobój U16 Dziewczęta** (Niestandardowy)
- **Kod**: `PENTATHLON_U16_FEMALE`
- **Kategoria**: Niestandardowy/Lokalny
- **Kolejność**: 80m przez płotki, Skok wzwyż, Kula 3kg, Skok w dal, 600m

---

## 🔧 API Endpoints

### Pobieranie dostępnych typów wielobojów
```http
GET /combined-events/types
```

**Odpowiedź**:
```json
[
  {
    "type": "DECATHLON",
    "name": "Dziesięciobój",
    "description": "Oficjalny 10-bój męski (World Athletics)",
    "gender": "MALE",
    "disciplines": 10,
    "official": true,
    "category": "World Athletics"
  },
  {
    "type": "DECATHLON_MASTERS",
    "name": "Dziesięciobój Masters",
    "description": "Dziesięciobój dla kategorii Masters 35+ (WMA)",
    "gender": "MALE",
    "disciplines": 10,
    "official": true,
    "category": "Masters (WMA)"
  }
]
```

### Pobieranie dyscyplin dla konkretnego wieloboju
```http
GET /combined-events/types/{eventType}/disciplines?gender=MALE
```

**Przykład**:
```http
GET /combined-events/types/PENTATHLON_OUTDOOR_MASTERS/disciplines?gender=FEMALE
```

**Odpowiedź**:
```json
{
  "eventType": "PENTATHLON_OUTDOOR_MASTERS",
  "gender": "FEMALE",
  "disciplines": ["100MH", "HJ", "SP", "LJ", "800M"]
}
```

### Tworzenie wieloboju
```http
POST /combined-events
```

**Body**:
```json
{
  "eventType": "HEPTATHLON_MASTERS",
  "athleteId": "athlete-uuid",
  "competitionId": "competition-uuid",
  "gender": "FEMALE"
}
```

---

## 📊 Przykłady Użycia

### 1. Dziesięciobój Masters (Mężczyźni 35+)
```javascript
// Tworzenie dziesięcioboju Masters
const decathlonMasters = await fetch('/combined-events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventType: 'DECATHLON_MASTERS',
    athleteId: 'athlete-123',
    competitionId: 'comp-456',
    gender: 'MALE'
  })
});

// Aktualizacja wyniku - 100m
await fetch(`/combined-events/${decathlonId}/discipline/100M`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    performance: '11.25',
    wind: '+1.2'
  })
});
```

### 2. Pięciobój Rzutowy Masters
```javascript
// Tworzenie pięcioboju rzutowego Masters
const throwsPentathlon = await fetch('/combined-events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventType: 'THROWS_PENTATHLON_MASTERS',
    athleteId: 'athlete-789',
    competitionId: 'comp-456',
    gender: 'FEMALE'
  })
});

// Aktualizacja wyników rzutowych
const disciplines = ['HT', 'SP', 'DT', 'JT', 'WT'];
const performances = ['45.20', '12.50', '38.75', '42.10', '15.80'];

for (let i = 0; i < disciplines.length; i++) {
  await fetch(`/combined-events/${pentathlonId}/discipline/${disciplines[i]}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      performance: performances[i]
    })
  });
}
```

### 3. Pięciobój Outdoor Masters (różny dla płci)
```javascript
// Kobiety - standardowy pięciobój
const womenPentathlon = await fetch('/combined-events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventType: 'PENTATHLON_OUTDOOR_MASTERS',
    athleteId: 'athlete-female',
    competitionId: 'comp-456',
    gender: 'FEMALE'  // Automatycznie wybierze: 100MH, HJ, SP, LJ, 800M
  })
});

// Mężczyźni - inny zestaw dyscyplin
const menPentathlon = await fetch('/combined-events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventType: 'PENTATHLON_OUTDOOR_MASTERS',
    athleteId: 'athlete-male',
    competitionId: 'comp-456',
    gender: 'MALE'  // Automatycznie wybierze: LJ, JT, 200M, DT, 1500M
  })
});
```

---

## ⚠️ Ważne Uwagi

### 1. **Rozróżnienie Masters vs Standardowe**
- Wieloboje Masters są **wyraźnie oznaczone** w nazwie i opisie
- Mają identyczne dyscypliny, ale **różne specyfikacje implementów**
- Kategorie wiekowe: 35-39, 40-44, 45-49, itd.

### 2. **Specyfikacje Implementów Masters**
- **Płotki**: Różne wysokości według grup wiekowych
- **Kula**: Różne wagi (np. 6kg dla M50+, 4kg dla W35+)
- **Oszczep**: Różne specyfikacje według wieku
- **Młot/Waga**: Dostosowane wagi

### 3. **Punktacja**
- Wszystkie wieloboje używają **oficjalnych tabel punktacji IAAF/WA**
- Masters używają **tych samych współczynników** co standardowe
- Różnice w wynikach wynikają z dostosowanych implementów

### 4. **Walidacja**
- System automatycznie **waliduje formaty wyników**
- Sprawdza **realistyczne zakresy** dla każdej dyscypliny
- Blokuje **niemożliwe wyniki**

---

## 🔍 Testowanie

### Test wszystkich typów wielobojów:
```bash
# Pobierz dostępne typy
curl -X GET "http://localhost:3000/combined-events/types"

# Sprawdź dyscypliny dla każdego typu
curl -X GET "http://localhost:3000/combined-events/types/DECATHLON_MASTERS/disciplines?gender=MALE"
curl -X GET "http://localhost:3000/combined-events/types/THROWS_PENTATHLON_MASTERS/disciplines?gender=FEMALE"
curl -X GET "http://localhost:3000/combined-events/types/PENTATHLON_OUTDOOR_MASTERS/disciplines?gender=MALE"
curl -X GET "http://localhost:3000/combined-events/types/PENTATHLON_OUTDOOR_MASTERS/disciplines?gender=FEMALE"
```

---

## 📈 Statystyki i Ranking

System automatycznie generuje:
- **Rankingi** dla każdego typu wieloboju
- **Statystyki** zawodów
- **Porównania** wyników między kategoriami
- **Rekordy** dla każdej grupy wiekowej Masters

---

**Status**: ✅ **Kompletna implementacja wszystkich oficjalnych wielobojów zgodnie z przepisami World Athletics i WMA**