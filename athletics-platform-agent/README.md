# Athletics Platform Agent

**Automatyczna synchronizacja z systemem FinishLynx**

Athletics Platform Agent to dedykowana aplikacja desktopowa, która umożliwia bezproblemową integrację między platformą Athletics Platform a systemem photofinish FinishLynx.

## 🎯 Funkcjonalności

### ✅ **Dwukierunkowa synchronizacja**
- **Athletics Platform → FinishLynx**: Automatyczny eksport list startowych
- **FinishLynx → Athletics Platform**: Automatyczny import wyników

### ✅ **Monitoring w czasie rzeczywistym**
- Automatyczne wykrywanie nowych plików wyników (.lif)
- Monitoring katalogów FinishLynx
- Kolejkowanie plików przy braku połączenia

### ✅ **Inteligentne mapowanie**
- Automatyczne rozpoznawanie konkurencji
- Mapowanie zawodników po numerach licencji
- Obsługa wszystkich statusów (DNS, DNF, DQ)

### ✅ **Profesjonalny interfejs**
- Intuicyjna konfiguracja
- Monitoring statusu w czasie rzeczywistym
- Szczegółowe logi systemowe
- Ikona w zasobniku systemowym

## 🚀 Instalacja

### Wymagania
- **System operacyjny**: Windows 10/11
- **FinishLynx**: Zainstalowany i skonfigurowany
- **Athletics Platform**: Działający serwer backend

### Kroki instalacji

1. **Pobierz Agent**
   ```bash
   # Sklonuj repozytorium
   git clone [repository-url]
   cd athletics-platform-agent
   
   # Zainstaluj zależności
   npm install
   ```

2. **Zbuduj aplikację**
   ```bash
   # Dla Windows
   npm run build-win
   
   # Lub uruchom w trybie deweloperskim
   npm run dev
   ```

3. **Zainstaluj aplikację**
   - Uruchom plik instalacyjny z katalogu `dist/`
   - Postępuj zgodnie z instrukcjami instalatora

## ⚙️ Konfiguracja

### 1. **Ustawienia serwera**
- **URL serwera**: Adres backend Athletics Platform (np. `http://localhost:3000`)
- **Klucz API**: Token autoryzacyjny (pobierz z panelu administracyjnego)
- **ID zawodów**: Identyfikator zawodów do synchronizacji

### 2. **Katalogi FinishLynx**
- **Katalog wejściowy**: Gdzie Agent zapisuje listy startowe (.evt)
- **Katalog wyjściowy**: Skąd Agent czyta wyniki (.lif)

> ⚠️ **Ważne**: Katalogi muszą być takie same jak w ustawieniach FinishLynx!

### 3. **Ustawienia FinishLynx**

W FinishLynx przejdź do **Pliki → Opcje → Baza** i ustaw:
- **Katalog wejściowy**: Ten sam co w Agent
- **Katalog wyjściowy**: Ten sam co w Agent  
- **Ustaw kod**: Unicode
- **LIF kod**: Unicode

## 🔄 Workflow

### **Przygotowanie zawodów**
1. Utwórz zawody w Athletics Platform
2. Dodaj konkurencje z jasnymi nazwami
3. Zarejestruj zawodników z numerami licencji
4. Uruchom Agent i skonfiguruj połączenie

### **Synchronizacja list startowych**
1. Agent automatycznie pobiera listy startowe z serwera
2. Generuje pliki .evt w katalogu wejściowym FinishLynx
3. W FinishLynx: **Idź do biegu → Ładuj program minutowy**

### **Import wyników**
1. Przeprowadź bieg w FinishLynx
2. Zapisz wyniki: **Plik → Zapisz** (lub **Zapisz LIF**)
3. Agent automatycznie wykrywa nowy plik .lif
4. Wyniki są automatycznie przesyłane do Athletics Platform

## 📊 Monitoring

### **Status połączenia**
- 🟢 **Połączono**: Agent komunikuje się z serwerem
- 🟡 **Łączenie**: Próba nawiązania połączenia
- 🔴 **Rozłączono**: Brak połączenia z serwerem
- ❌ **Błąd**: Problem z konfiguracją lub serwerem

### **Monitor wyników**
- 🟢 **Aktywny**: Monitoring katalogów działa
- 🔴 **Nieaktywny**: Monitoring zatrzymany
- ❌ **Błąd**: Problem z dostępem do katalogów

### **Kolejka plików**
Agent pokazuje:
- Pliki oczekujące na przetworzenie
- Pliki w trakcie przetwarzania
- Przetworzone pliki
- Błędy przetwarzania

## 🛠️ Rozwiązywanie problemów

### **Nie można nawiązać połączenia**
- Sprawdź URL serwera i klucz API
- Upewnij się, że serwer Athletics Platform działa
- Sprawdź połączenie internetowe

### **Listy startowe nie są ładowane**
- Sprawdź czy katalogi w Agent i FinishLynx są identyczne
- Upewnij się, że FinishLynx ma dostęp do katalogu wejściowego
- Sprawdź czy zawody mają utworzone konkurencje

### **Wyniki nie są importowane**
- Sprawdź czy katalogi w Agent i FinishLynx są identyczne
- Upewnij się, że zawodnicy są zarejestrowani w konkurencjach
- Sprawdź numery licencji zawodników

### **Błędy mapowania konkurencji**
- Użyj jasnych nazw konkurencji (np. "100m Mężczyźni U18")
- Sprawdź czy konkurencja została utworzona w zawodach
- Sprawdź logi Agent dla szczegółowych informacji

## 📝 Logi

Agent prowadzi szczegółowe logi:
- **Info**: Normalne operacje
- **Ostrzeżenia**: Potencjalne problemy
- **Błędy**: Problemy wymagające uwagi
- **Debug**: Szczegółowe informacje techniczne

Logi można:
- Filtrować według poziomu
- Eksportować do pliku
- Czyścić w razie potrzeby

## 🔧 Zaawansowane

### **Tryb deweloperski**
```bash
npm run dev
```

### **Budowanie z logami**
```bash
# Włącz szczegółowe logi
set NODE_ENV=development
npm start
```

### **Konfiguracja przez plik**
Agent może wczytać konfigurację z pliku .json lub .roster (kompatybilność z Roster Athletics).

## 📞 Wsparcie

W przypadku problemów:
1. Sprawdź logi w zakładce "Logi"
2. Sprawdź status połączenia
3. Sprawdź konfigurację katalogów
4. Skontaktuj się z administratorem systemu

## 🔄 Aktualizacje

Agent automatycznie sprawdza dostępność aktualizacji i powiadamia o nowych wersjach.

---

**Athletics Platform Agent** - Profesjonalna integracja z FinishLynx 🏃‍♂️⚡