# Instrukcja testowania tworzenia zawodów

## Problem
Użytkownik nie może utworzyć nowych zawodów - nie pokazuje się żaden błąd ani komunikat.

## Rozwiązanie
Naprawiliśmy kilka problemów:

1. **Błędna konfiguracja API** - frontend próbował łączyć się z portem 3002, ale backend działa na 3001
2. **Brak obsługi błędów** - błędy były "połykane" bez wyświetlania użytkownikowi
3. **Brak sprawdzania autoryzacji** - nie było jasne czy użytkownik ma uprawnienia

## Jak przetestować

### 1. Sprawdź czy serwery działają
```bash
# Backend powinien działać na porcie 3001
netstat -ano | findstr ":3001"

# Frontend powinien działać na porcie 3000  
netstat -ano | findstr ":3000"
```

### 2. Zaloguj się do aplikacji
1. Otwórz przeglądarkę i przejdź do: `http://localhost:3000`
2. Przejdź do strony logowania: `http://localhost:3000/login`
3. Zaloguj się jako administrator:
   - **Email**: `admin@athletics.pl`
   - **Hasło**: `password123`

### 3. Sprawdź uprawnienia
Po zalogowaniu sprawdź w konsoli przeglądarki (F12) czy widzisz logi:
```
🏗️ CreateCompetitionPage rendered {isAuthenticated: true, user: {...}, isLoading: false}
```

### 4. Utwórz zawody
1. Przejdź do: `http://localhost:3000/competitions`
2. Kliknij przycisk **"Nowe zawody"**
3. Wypełnij formularz:
   - **Nazwa**: np. "Test Zawody 2025"
   - **Typ**: wybierz "Stadion (outdoor)"
   - **Data rozpoczęcia**: wybierz przyszłą datę
   - **Data zakończenia**: wybierz datę po rozpoczęciu
   - **Miasto**: np. "Warszawa"
4. Kliknij **"Utwórz zawody"**

### 5. Sprawdź logi w konsoli
W konsoli przeglądarki (F12) powinieneś zobaczyć:
```
🚀 Form submitted with data: {...}
📤 Sending payload: {...}
✅ Competition created successfully: {...}
```

### 6. Sprawdź czy zawody zostały utworzone
Po utworzeniu powinieneś:
- Zobaczyć powiadomienie "Zawody zostały utworzone"
- Zostać przekierowany na listę zawodów
- Zobaczyć nowe zawody na liście

## Testowe konta

W bazie danych są dostępne testowe konta:

- **Admin**: `admin@athletics.pl` / `password123`
- **Organizator**: `organizer@athletics.pl` / `password123`
- **Trener**: `coach@athletics.pl` / `password123`
- **Zawodnik**: `athlete@athletics.pl` / `password123`

**Uwaga**: Tylko konta z rolą ADMIN lub ORGANIZER mogą tworzyć zawody.

## Debugowanie

### Jeśli nadal nie działa:

1. **Sprawdź konsolę przeglądarki** (F12 → Console) - czy są błędy?

2. **Sprawdź Network tab** (F12 → Network) - czy zapytania są wysyłane?

3. **Sprawdź localStorage** - czy użytkownik jest zalogowany:
   ```javascript
   console.log(localStorage.getItem('auth-storage'));
   ```

4. **Użyj pliku debug**: Otwórz `debug-auth.html` w przeglądarce i przetestuj API

5. **Sprawdź logi backendu** - czy zapytania docierają do serwera?

## Rozwiązane problemy

✅ **Naprawiono konfigurację API** - zmieniono port z 3002 na 3001
✅ **Dodano obsługę błędów** - użytkownik teraz widzi komunikaty o błędach  
✅ **Dodano sprawdzanie autoryzacji** - sprawdzamy czy użytkownik ma uprawnienia
✅ **Dodano szczegółowe logowanie** - łatwiejsze debugowanie
✅ **Dodano powiadomienia** - użytkownik widzi status operacji

## Kontakt
Jeśli problem nadal występuje, sprawdź logi w konsoli i prześlij szczegóły błędu.