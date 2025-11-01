# 📺 Wyniki na żywo - Dokumentacja

## 🎯 Przegląd funkcjonalności

System wyników na żywo umożliwia publiczne wyświetlanie aktualnych wyników zawodów w czasie rzeczywistym. Każde zawody otrzymują unikalny token dostępu, który pozwala na bezpieczne udostępnianie wyników bez konieczności logowania.

## 🔧 Implementacja techniczna

### Backend API

#### Nowe pola w modelu Competition
```typescript
agentId: string?           // Unikalny ID dla agenta FinishLynx
liveResultsEnabled: boolean // Czy włączone są wyniki na żywo
liveResultsToken: string?   // Token dostępu do wyników na żywo
```

#### Nowe pola w modelu Event
```typescript
isCompleted: boolean       // Czy konkurencja została zakończona
hurdleHeight: string?      // Wysokość płotków
implementWeight: string?   // Waga przyrządu
implementSpecs: Json?      // Dodatkowe specyfikacje sprzętu
```

### API Endpoints

#### Zarządzanie wynikami na żywo
- `POST /competitions/:id/live-results/toggle` - Włącza/wyłącza wyniki na żywo
- `GET /competitions/live/:token` - Pobiera wyniki na żywo (JSON)
- `GET /live-results/:token` - Strona HTML z wynikami na żywo
- `GET /live-results/api/:token` - API endpoint dla wyników na żywo

#### Zarządzanie konkurencjami
- `POST /events/:id/complete` - Oznacza konkurencję jako zakończoną
- `POST /events/:id/ongoing` - Oznacza konkurencję jako w trakcie

#### Specyfikacje sprzętu
- `GET /equipment/categories` - Lista wszystkich kategorii wiekowych
- `GET /equipment/specs?category=U16&discipline=SHOT_PUT&gender=MALE` - Specyfikacje sprzętu
- `GET /equipment/category-description?category=U16` - Opis kategorii

## 🌐 Strona wyników na żywo

### Funkcjonalności
- **Auto-odświeżanie**: Strona odświeża się automatycznie co 30 sekund
- **Responsywny design**: Działa na wszystkich urządzeniach
- **Podział na sekcje**: Zakończone i trwające konkurencje
- **Specyfikacje sprzętu**: Wyświetlanie wysokości płotków, wag przyrządów
- **Szczegółowe wyniki**: Pozycja, zawodnik, klub, wynik, wiatr

### Przykładowy URL
```
https://your-domain.com/live-results/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

## 🏃‍♂️ Kategorie wiekowe

### Specjalne kategorie
- `WIELE` - Wiele kategorii w jednym biegu

### Kategorie dziecięce (0-22 lat)
- `AGE_0_11` - 0-11 lat (zbiorczy)
- `AGE_5` do `AGE_22` - Poszczególne roczniki

### Kategorie szkolne
- `CLASS_1_SZKOLA_SREDNIA` do `CLASS_6_SZKOLA_SREDNIA`
- `CLASS_7`, `CLASS_8`

### Kategorie młodzieżowe
- `U8` do `U23`

### Kategorie seniorskie i Masters
- `SENIOR` - Seniorzy (20+)
- `M35` do `M110` - Masters (co 5 lat)

## ⚙️ Specyfikacje sprzętu

System automatycznie przypisuje odpowiednie specyfikacje sprzętu na podstawie:
- Kategorii wiekowej
- Płci zawodnika
- Rodzaju konkurencji

### Wysokości płotków
Zgodnie z przepisami PZLA 2023:
- **110m/100m płotki**: od 0.50m (dzieci) do 1.067m (seniorzy mężczyźni)
- **400m płotki**: od 0.50m do 0.91m
- **80m płotki**: dla kategorii U12/U13
- **60m płotki**: konkurencje halowe

### Wagi przyrządów

#### Kula
- **Mężczyźni**: 1kg (dzieci) → 7.26kg (seniorzy)
- **Kobiety**: 1kg (dzieci) → 4kg (seniorki)

#### Dysk
- **Mężczyźni**: 0.5kg (dzieci) → 2kg (seniorzy)
- **Kobiety**: 0.5kg (dzieci) → 1kg (seniorki)

#### Młot
- **Mężczyźni**: 3kg (U13) → 7.26kg (seniorzy)
- **Kobiety**: 2kg (U13) → 4kg (seniorki)

#### Oszczep
- **Mężczyźni**: 300g (dzieci) → 800g (seniorzy)
- **Kobiety**: 300g (dzieci) → 600g (seniorki)

## 🔒 Bezpieczeństwo

### Token dostępu
- Każde zawody otrzymują unikalny 64-znakowy token
- Token jest generowany kryptograficznie bezpieczną metodą
- Dostęp do wyników tylko z aktywnym tokenem

### Kontrola dostępu
- Wyniki na żywo można włączyć/wyłączyć w panelu administracyjnym
- Tylko autoryzowani użytkownicy mogą zarządzać ustawieniami

## 📱 Użytkowanie

### Dla organizatorów
1. Utwórz zawody w systemie
2. Włącz wyniki na żywo w panelu zawodów
3. Skopiuj link do wyników na żywo
4. Udostępnij link publiczności
5. Oznaczaj konkurencje jako zakończone po ich ukończeniu

### Dla widzów
1. Otwórz link do wyników na żywo
2. Strona automatycznie się odświeża
3. Przeglądaj wyniki zakończonych i trwających konkurencji
4. Sprawdzaj specyfikacje sprzętu dla każdej konkurencji

## 🛠️ Konfiguracja

### Zmienne środowiskowe
Brak dodatkowych zmiennych - system używa istniejącej konfiguracji bazy danych.

### Wymagania
- Node.js 18+
- Prisma ORM
- SQLite/PostgreSQL
- NestJS backend

## 🔄 Integracja z FinishLynx

System przygotowany do integracji z agentem FinishLynx:
- Każde zawody otrzymują unikalny `agentId`
- Agent może pobierać listę zawodników: `GET /competitions/agent/:agentId`
- Agent może wysyłać wyniki przez API

## 📊 Monitoring

### Logi
System loguje:
- Włączanie/wyłączanie wyników na żywo
- Dostęp do stron wyników na żywo
- Błędy podczas generowania stron

### Metryki
- Liczba aktywnych sesji wyników na żywo
- Częstotliwość odświeżania stron
- Najpopularniejsze zawody

## 🚀 Przyszłe rozszerzenia

### Planowane funkcjonalności
- WebSocket dla real-time updates
- Powiadomienia push o nowych wynikach
- Eksport wyników do PDF
- Integracja z mediami społecznościowymi
- Statystyki oglądalności

### API v2
- GraphQL endpoint
- Filtrowanie wyników
- Subskrypcje na zmiany
- Bulk operations

---

**Status**: ✅ Implementacja zakończona i gotowa do użycia
**Wersja**: 1.0.0
**Data**: 2025-01-03