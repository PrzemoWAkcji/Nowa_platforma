# Instrukcja instalacji Athletics Platform Agent

## 🎯 Przygotowanie środowiska

### 1. Zainstaluj Node.js
- Pobierz z: https://nodejs.org/
- Wybierz wersję LTS (Long Term Support)
- Uruchom instalator i postępuj zgodnie z instrukcjami

### 2. Sprawdź instalację
```bash
node --version
npm --version
```

## 📦 Instalacja Agent

### 1. Pobierz kod źródłowy
```bash
# Sklonuj repozytorium lub rozpakuj archiwum
cd athletics-platform-agent
```

### 2. Zainstaluj zależności
```bash
npm install
```

### 3. Zbuduj aplikację
```bash
# Dla Windows
npm run build-win

# Alternatywnie - tylko spakuj bez instalatora
npm run pack
```

### 4. Uruchom aplikację
```bash
# Tryb deweloperski
npm run dev

# Lub uruchom zbudowaną aplikację z katalogu dist/
```

## ⚙️ Konfiguracja FinishLynx

### 1. Utwórz katalogi robocze
```
C:\FinishLynx\Data\Input\    # Listy startowe
C:\FinishLynx\Data\Output\   # Wyniki
```

### 2. Skonfiguruj FinishLynx
1. Otwórz FinishLynx
2. Przejdź do **Pliki → Opcje...**
3. W zakładce **Baza** ustaw:
   - **Katalog wejściowy**: `C:\FinishLynx\Data\Input\`
   - **Katalog wyjściowy**: `C:\FinishLynx\Data\Output\`
   - **Ustaw kod**: Unicode
   - **LIF kod**: Unicode

### 3. Opcjonalnie - numery startowe
W zakładce **Wyniki**:
1. Wybierz **User 1** w polu **Pola**
2. Kliknij **Enable** (Włącz)

## 🔧 Konfiguracja Agent

### 1. Uruchom Agent
- Uruchom aplikację Athletics Platform Agent
- Przejdź do zakładki **Konfiguracja**

### 2. Ustawienia serwera
- **URL serwera**: `http://localhost:3000` (lub adres serwera)
- **Klucz API**: Pobierz z panelu administracyjnego Athletics Platform
- **ID zawodów**: Identyfikator zawodów (znajdziesz w URL zawodów)

### 3. Katalogi
- **Katalog wejściowy**: `C:\FinishLynx\Data\Input\`
- **Katalog wyjściowy**: `C:\FinishLynx\Data\Output\`

> ⚠️ **Ważne**: Katalogi muszą być identyczne z ustawieniami FinishLynx!

### 4. Ustawienia synchronizacji
- **Automatyczna synchronizacja**: ✅ Włączona
- **Interwał synchronizacji**: 10 sekund (zalecane)
- **Pokaż powiadomienia**: ✅ Włączone

### 5. Zapisz i testuj
1. Kliknij **Zapisz konfigurację**
2. Kliknij **Testuj połączenie**
3. Sprawdź czy status pokazuje "Połączono"

## 🚀 Pierwszy test

### 1. Przygotuj zawody
1. Zaloguj się do Athletics Platform
2. Utwórz nowe zawody
3. Dodaj konkurencję (np. "100m Mężczyźni U18")
4. Dodaj zawodników z numerami licencji
5. Zarejestruj zawodników w konkurencji

### 2. Uruchom synchronizację
1. W Agent kliknij **Start synchronizacji**
2. Sprawdź status - powinien pokazywać:
   - Połączenie: 🟢 Połączono
   - Monitor: 🟢 Aktywny

### 3. Sprawdź listy startowe
1. Sprawdź katalog `C:\FinishLynx\Data\Input\`
2. Powinny pojawić się pliki .evt z listami startowymi

### 4. Test w FinishLynx
1. Otwórz FinishLynx
2. Kliknij **Idź do biegu**
3. Kliknij **Ładuj program minutowy**
4. Wybierz konkurencję z listy
5. Sprawdź czy zawodnicy zostali załadowani

### 5. Test importu wyników
1. Wprowadź przykładowe wyniki w FinishLynx
2. Kliknij **Plik → Zapisz**
3. Sprawdź logi Agent - powinien wykryć nowy plik
4. Sprawdź Athletics Platform - wyniki powinny się pojawić

## 🛠️ Rozwiązywanie problemów instalacji

### **Błąd: "npm nie jest rozpoznawane"**
- Zainstaluj Node.js ponownie
- Uruchom ponownie terminal/command prompt
- Sprawdź zmienne środowiskowe PATH

### **Błąd: "electron nie może być uruchomiony"**
```bash
# Wyczyść cache npm
npm cache clean --force

# Zainstaluj ponownie
rm -rf node_modules
npm install
```

### **Błąd: "Nie można utworzyć katalogu"**
- Uruchom terminal jako Administrator
- Sprawdź uprawnienia do katalogów
- Użyj katalogów w folderze użytkownika

### **Błąd: "Nie można połączyć z serwerem"**
- Sprawdź czy serwer Athletics Platform działa
- Sprawdź firewall i antywirus
- Sprawdź URL serwera (http:// vs https://)

### **FinishLynx nie widzi plików**
- Sprawdź czy katalogi są identyczne
- Sprawdź uprawnienia do katalogów
- Sprawdź czy FinishLynx ma dostęp do katalogów

## 📋 Lista kontrolna

Po instalacji sprawdź:

- [ ] Node.js zainstalowany
- [ ] Agent uruchamia się bez błędów
- [ ] Katalogi FinishLynx utworzone
- [ ] FinishLynx skonfigurowany (Unicode, katalogi)
- [ ] Agent skonfigurowany (serwer, katalogi)
- [ ] Test połączenia przeszedł pomyślnie
- [ ] Synchronizacja uruchomiona
- [ ] Listy startowe generują się automatycznie
- [ ] FinishLynx ładuje listy startowe
- [ ] Wyniki importują się automatycznie

## 🔄 Aktualizacja

Aby zaktualizować Agent:

1. Zatrzymaj Agent
2. Pobierz nową wersję
3. Zainstaluj zależności: `npm install`
4. Zbuduj: `npm run build-win`
5. Uruchom nową wersję
6. Sprawdź czy konfiguracja została zachowana

## 📞 Wsparcie

W przypadku problemów z instalacją:

1. Sprawdź logi w katalogu `logs/`
2. Sprawdź czy wszystkie wymagania są spełnione
3. Sprawdź dokumentację FinishLynx
4. Skontaktuj się z administratorem systemu

---

**Powodzenia z instalacją!** 🚀