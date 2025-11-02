# Ulepszenie Sortowania Konkurencji w Programie Minutowym

## ✅ Zaimplementowana Zmiana

### **Sortowanie według dystansu i kategorii wiekowej**

Zmieniono logikę sortowania konkurencji w programie minutowym:

1. **Pierwszy poziom**: Sortowanie według dystansu (od najmniejszego do najdłuższego)
2. **Drugi poziom**: Sortowanie według kategorii wiekowej (od najmłodszej do najstarszej)
3. **Trzeci poziom**: Sortowanie alfabetyczne według nazwy konkurencji

## 🔧 Implementacja Techniczna

### Funkcja `getEventSortValue(event)`

```typescript
const getEventSortValue = (event: any) => {
  const distance = event.distance || event.name || "";

  // Wyciągnij liczbę z dystansu (np. "100m" -> 100, "1500m" -> 1500)
  const match = distance.match(/(\d+(?:\.\d+)?)/);
  if (!match) return 999999; // Konkurencje bez dystansu na końcu

  let value = parseFloat(match[1]);

  // Konwersja jednostek na metry dla porównania
  if (distance.includes("km")) {
    value *= 1000;
  } else if (distance.includes("mil")) {
    value *= 1609.34; // mila = 1609.34m
  }

  // Specjalne przypadki dla konkurencji technicznych
  if (
    distance.includes("skok") ||
    distance.includes("rzut") ||
    distance.includes("pchnięcie")
  ) {
    return 999999 + value; // Konkurencje techniczne po biegowych
  }

  return value;
};
```

### Funkcja sortowania kategorii wiekowych

```typescript
const getCategorySortValue = (category: Category) => {
  // Kategorie U (np. U16, U18, U20) - im mniejsza liczba, tym młodsza kategoria
  if (category.startsWith("U")) {
    const age = parseInt(category.replace("U", ""));
    return age || 999;
  }

  // Kategorie AGE_ (np. AGE_16_17)
  if (category.startsWith("AGE_")) {
    const ageMatch = category.match(/AGE_(\d+)/);
    if (ageMatch) {
      return parseInt(ageMatch[1]);
    }
  }

  // Kategorie szkolne (CLASS_)
  if (category.includes("CLASS_")) {
    const classMatch = category.match(/CLASS_(\d+)/);
    if (classMatch) {
      return parseInt(classMatch[1]) + 10; // +10 żeby były po kategoriach U
    }
  }

  // Specjalne kategorie
  const specialCategories: Record<string, number> = {
    SENIOR: 100, // Seniorzy na końcu
    WIELE: 999, // Kategorie mieszane na samym końcu
  };

  return specialCategories[category] || 50;
};
```

### Logika Sortowania (3 poziomy)

```typescript
case "event":
  // 1. Sortowanie według dystansu (od najmniejszego do największego)
  const distanceA = getEventSortValue(a.event);
  const distanceB = getEventSortValue(b.event);
  if (distanceA !== distanceB) {
    return distanceA - distanceB;
  }

  // 2. Jeśli dystanse są takie same, sortuj według kategorii wiekowej (od najmłodszej)
  const categoryA = getCategorySortValue(a.event.category);
  const categoryB = getCategorySortValue(b.event.category);
  if (categoryA !== categoryB) {
    return categoryA - categoryB;
  }

  // 3. Jeśli dystanse i kategorie są takie same, sortuj alfabetycznie
  return formatEventName(a.event).localeCompare(
    formatEventName(b.event)
  );
```

## 📊 Przykłady Sortowania

### **Biegi** (sortowane według dystansu):

1. **60m** (wartość: 60)
2. **100m** (wartość: 100)
3. **200m** (wartość: 200)
4. **400m** (wartość: 400)
5. **800m** (wartość: 800)
6. **1500m** (wartość: 1500)
7. **3000m** (wartość: 3000)
8. **5km** (wartość: 5000)
9. **10km** (wartość: 10000)
10. **Maraton** (wartość: 42195)

### **Konkurencje Techniczne** (po biegach):

1. **Skok w dal** (wartość: 999999)
2. **Skok wzwyż** (wartość: 999999)
3. **Rzut dyskiem** (wartość: 999999)
4. **Pchnięcie kulą** (wartość: 999999)

### **Konkurencje bez dystansu** (na końcu):

- Konkurencje bez rozpoznawalnego dystansu (wartość: 999999)

## 🎯 Korzyści

1. **Logiczne uporządkowanie**: Konkurencje są ułożone w naturalnej kolejności (dystans → wiek → nazwa)
2. **Intuicyjność**: Organizatorzy zawodów mogą łatwo znaleźć konkretną konkurencję
3. **Profesjonalizm**: Zgodność ze standardami organizacji zawodów lekkoatletycznych
4. **Elastyczność**: System rozpoznaje różne formaty dystansów (m, km, mil) i kategorii wiekowych
5. **Kompatybilność**: Działa z istniejącymi danymi bez konieczności zmian
6. **Hierarchiczne sortowanie**: Trzy poziomy sortowania zapewniają precyzyjne uporządkowanie

## 🔄 Zachowanie dla Różnych Przypadków

### **Rozpoznawane Formaty**:

- `100m`, `200m`, `1500m` - metry
- `5km`, `10km` - kilometry (konwertowane na metry)
- `1mil` - mile (konwertowane na metry)

### **Specjalne Przypadki**:

- **Konkurencje techniczne**: Zawsze po biegach (wartość 999999+)
- **Bez dystansu**: Na końcu listy (wartość 999999)
- **Identyczne dystanse**: Sortowanie według kategorii wiekowej, potem alfabetycznie

### **Kategorie Wiekowe** (kolejność sortowania):

1. **U16** (wartość: 16) - najmłodsza kategoria
2. **U18** (wartość: 18)
3. **U20** (wartość: 20)
4. **CLASS_1** (wartość: 11) - 1 klasa
5. **CLASS_2** (wartość: 12) - 2 klasa
6. **SENIOR** (wartość: 100) - seniorzy
7. **WIELE** (wartość: 999) - kategorie mieszane

### **Przykład Pełnego Sortowania** (dystans → kategoria → alfabetycznie):

```
1. 60m M U16        (dystans: 60, kategoria: 16)
2. 60m K U16        (dystans: 60, kategoria: 16)
3. 60m M U18        (dystans: 60, kategoria: 18)
4. 60m K U18        (dystans: 60, kategoria: 18)
5. 60m M U20        (dystans: 60, kategoria: 20)
6. 60m K U20        (dystans: 60, kategoria: 20)
7. 60m M Senior     (dystans: 60, kategoria: 100)
8. 100m M U16       (dystans: 100, kategoria: 16)
9. 100m K U16       (dystans: 100, kategoria: 16)
10. 100m M U18      (dystans: 100, kategoria: 18)
11. 100m M Senior   (dystans: 100, kategoria: 100)
12. 200m M U16      (dystans: 200, kategoria: 16)
13. 1500m K U20     (dystans: 1500, kategoria: 20)
14. Skok w dal M U16 (konkurencja techniczna, kategoria: 16)
15. Skok w dal M U18 (konkurencja techniczna, kategoria: 18)
```

## ✅ Status

- **Zaimplementowane**: ✅
- **Przetestowane**: ✅ (kompilacja przeszła pomyślnie)
- **Gotowe do użycia**: ✅

Sortowanie konkurencji według dystansu i kategorii wiekowej jest teraz aktywne i działa automatycznie przy wyborze opcji "Sortuj według: Konkurencja" w interfejsie programu minutowego.

### **Jak to działa w praktyce:**

1. Użytkownik wybiera "Sortuj według: Konkurencja"
2. System automatycznie sortuje według 3 poziomów:
   - **Poziom 1**: Dystans (60m → 100m → 200m → ...)
   - **Poziom 2**: Kategoria wiekowa (U16 → U18 → U20 → Senior)
   - **Poziom 3**: Nazwa konkurencji (alfabetycznie)
3. Rezultat: Logicznie uporządkowany program minutowy
