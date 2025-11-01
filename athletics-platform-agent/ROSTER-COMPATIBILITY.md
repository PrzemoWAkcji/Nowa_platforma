# Kompatybilność z Roster Athletics

Athletics Platform Agent jest w pełni kompatybilny z formatem plików konfiguracyjnych Roster Athletics (.roster).

## 🔄 Format pliku .roster

Nasz Agent obsługuje identyczny format JSON jak Roster Athletics:

```json
{
  "url": "api.admin.rosterathletics.com",
  "token": "a74c838a-fc73-4a24-b48a-929dc73967c5",
  "deviceId": "finish-lynx-agent-63989",
  "email": "przemyslawnorbertjedrzejewski@gmail.com",
  "meetingId": 27019,
  "meetingName": "Warszawska Liga Biegowa 2025 - 5 runda",
  "timingSystem": "FinishLynx",
  "devServer": false
}
```

## 📥 Importowanie konfiguracji z Roster Athletics

### 1. **Pobierz plik .roster z Roster Athletics**
- Zaloguj się do Roster Athletics
- Przejdź do szczegółów zawodów
- Kliknij **"Konfiguracja Agenta"** → **"FinishLynx"**
- Pobierz plik `.roster`

### 2. **Wczytaj do Athletics Platform Agent**
- Otwórz Athletics Platform Agent
- Przejdź do menu **Plik** → **Wczytaj konfigurację...**
- Wybierz pobrany plik `.roster`
- Agent automatycznie zaimportuje wszystkie ustawienia

### 3. **Dostosuj ustawienia**
- **URL serwera**: Zmień na adres Athletics Platform (np. `http://localhost:3000`)
- **Katalogi**: Ustaw katalogi FinishLynx
- **ID zawodów**: Wprowadź ID zawodów z Athletics Platform

## 📤 Generowanie plików .roster

Athletics Platform może generować pliki .roster identyczne z Roster Athletics:

### 1. **Przez interfejs webowy**
```
GET /api/competitions/{id}/agent-config
```

### 2. **Przez Agent**
- Menu **Plik** → **Zapisz konfigurację...**
- Wybierz format `.roster`
- Agent wygeneruje plik kompatybilny z Roster Athletics

## 🔧 Mapowanie pól

| Roster Athletics | Athletics Platform Agent | Opis |
|------------------|--------------------------|------|
| `url` | `serverUrl` | Adres serwera API |
| `token` | `apiKey` | Token autoryzacyjny |
| `deviceId` | `deviceId` | Unikalny ID urządzenia |
| `email` | `email` | Email użytkownika |
| `meetingId` | `competitionId` | ID zawodów |
| `meetingName` | `competitionName` | Nazwa zawodów |
| `timingSystem` | `timingSystem` | System pomiaru czasu |
| `devServer` | `devServer` | Tryb deweloperski |

## 🚀 Migracja z Roster Athletics

### **Krok 1: Eksport danych**
1. Pobierz wszystkie pliki .roster z Roster Athletics
2. Wyeksportuj listy startowe i wyniki (jeśli potrzebne)

### **Krok 2: Konfiguracja Athletics Platform**
1. Utwórz zawody w Athletics Platform
2. Dodaj konkurencje z identycznymi nazwami
3. Zaimportuj zawodników z numerami licencji
4. Zarejestruj zawodników w konkurencjach

### **Krok 3: Konfiguracja Agent**
1. Wczytaj plik .roster do Agent
2. Zmień URL serwera na Athletics Platform
3. Ustaw prawidłowe ID zawodów
4. Skonfiguruj katalogi FinishLynx

### **Krok 4: Test synchronizacji**
1. Uruchom synchronizację
2. Sprawdź czy listy startowe są generowane
3. Przetestuj import wyników

## 🔄 Workflow porównanie

### **Roster Athletics**
1. Sędzia pobiera plik .roster
2. Wczytuje do RosterAgent
3. RosterAgent synchronizuje z Roster Athletics
4. FinishLynx ↔ RosterAgent ↔ Roster Athletics

### **Athletics Platform**
1. Sędzia pobiera plik .roster (lub konfiguruje ręcznie)
2. Wczytuje do Athletics Platform Agent
3. Agent synchronizuje z Athletics Platform
4. FinishLynx ↔ Athletics Platform Agent ↔ Athletics Platform

## 🛠️ Różnice i ograniczenia

### **Identyczne funkcje:**
- ✅ Format plików .roster
- ✅ Dwukierunkowa synchronizacja
- ✅ Monitoring katalogów
- ✅ Kolejkowanie plików
- ✅ Obsługa statusów DNS/DNF/DQ
- ✅ Numery startowe
- ✅ Czas reakcji i wiatr

### **Dodatkowe funkcje w naszym Agent:**
- ✅ Szczegółowe logi z poziomami
- ✅ Lepszy interfejs użytkownika
- ✅ Eksport konfiguracji
- ✅ Zaawansowane mapowanie konkurencji
- ✅ Health check połączenia

### **Ograniczenia:**
- ⚠️ Wymaga Athletics Platform backend
- ⚠️ Inne API endpoints niż Roster Athletics
- ⚠️ Może wymagać dostosowania nazw konkurencji

## 📋 Lista kontrolna migracji

- [ ] Pobranie plików .roster z Roster Athletics
- [ ] Instalacja Athletics Platform Agent
- [ ] Import konfiguracji z pliku .roster
- [ ] Dostosowanie URL serwera
- [ ] Konfiguracja katalogów FinishLynx
- [ ] Test połączenia z Athletics Platform
- [ ] Utworzenie zawodów w Athletics Platform
- [ ] Mapowanie konkurencji
- [ ] Test synchronizacji list startowych
- [ ] Test importu wyników
- [ ] Szkolenie sędziów z nowego systemu

## 🆘 Rozwiązywanie problemów

### **Błąd: "Nieprawidłowy format pliku .roster"**
- Sprawdź czy plik zawiera prawidłowy JSON
- Sprawdź czy wszystkie wymagane pola są obecne

### **Błąd: "Nie można połączyć z serwerem"**
- Zmień URL z Roster Athletics na Athletics Platform
- Sprawdź czy serwer Athletics Platform działa

### **Błąd: "Nie znaleziono zawodów"**
- Sprawdź czy ID zawodów jest prawidłowe
- Utwórz zawody w Athletics Platform

### **Błąd: "Nie można zmapować konkurencji"**
- Sprawdź nazwy konkurencji w obu systemach
- Użyj identycznych nazw lub skonfiguruj mapowanie

## 📞 Wsparcie

W przypadku problemów z migracją z Roster Athletics:

1. Sprawdź dokumentację obu systemów
2. Porównaj formaty danych
3. Skontaktuj się z zespołem wsparcia
4. Rozważ stopniową migrację (test na jednych zawodach)

---

**Athletics Platform Agent - Pełna kompatybilność z Roster Athletics!** 🔄✨