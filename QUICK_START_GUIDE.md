# 🏃‍♂️ Szybki przewodnik - Import zawodników z CSV

## ✅ Funkcjonalność została dodana!

Właśnie dodałem kompletną funkcjonalność importu zawodników z plików CSV do Twojej aplikacji lekkoatletycznej.

## 🚀 Co zostało zaimportowane:

### Backend (NestJS):
- ✅ Endpoint `/athletes/import-csv` z obsługą upload plików
- ✅ Parsowanie CSV z obsługą dwóch formatów (PZLA i międzynarodowy)
- ✅ Automatyczne określanie kategorii wiekowych
- ✅ Inteligentne wykrywanie duplikatów
- ✅ Szczegółowe raporty z wynikami importu

### Frontend (Next.js):
- ✅ Komponent `AthleteImport` z intuicyjnym interfejsem
- ✅ Zakładka "Import CSV" w sekcji Zawodnicy
- ✅ Dialog z wynikami importu
- ✅ Obsługa błędów i raportowanie

## 📋 Jak używać:

### Import zawodników:
1. **Przejdź do sekcji Zawodnicy** w aplikacji
2. **Kliknij zakładkę "Import CSV"**
3. **Wybierz plik CSV** (przykłady w folderze `test-files/`)
4. **Wybierz format**:
   - **PZLA** - dla plików z polskimi nagłówkami (separator `;`)
   - **Międzynarodowy** - dla plików z angielskimi nagłówkami (separator `,`)
5. **Opcjonalnie zaznacz "Aktualizuj istniejących"** jeśli chcesz nadpisać dane
6. **Kliknij "Importuj zawodników"**
7. **Zobacz wyniki** w dialogu podsumowania

### Import list startowych:
1. **Przejdź do sekcji Administruj** → wybierz zawody
2. **Kliknij "Listy startowe"**
3. **Przejdź do zakładki "Import CSV"**
4. **Wybierz plik CSV z listą startową**
5. **Wybierz format** (PZLA lub międzynarodowy)
6. **Zaznacz opcje**:
   - **Aktualizuj istniejące rejestracje**
   - **Utwórz brakujących zawodników**
7. **Kliknij "Importuj listę startową"**

## 📁 Przykładowe pliki CSV:

Utworzyłem przykładowe pliki w folderze `test-files/`:

**Import zawodników:**
- `starter-pzla.csv` - format PZLA
- `roster-international.csv` - format międzynarodowy

**Import list startowych:**
- `startlist-pzla.csv` - lista startowa format PZLA
- `startlist-international.csv` - lista startowa format międzynarodowy

## 🔧 Formaty CSV:

### Format PZLA (separator `;`):
```csv
Imię;Nazwisko;DataUr;Klub;NazwaPZLA
Jan;Kowalski;1995-05-15;AZS Warszawa;100m mężczyzn
```

### Format międzynarodowy (separator `,`):
```csv
FirstName,LastName,DateOfBirth,Gender,ClubName,CountryCode
John,Smith,1995-05-15,Male,Warsaw Athletics,POL
```

## 🎯 Funkcje automatyczne:

- **Kategorie wiekowe** - automatycznie obliczane na podstawie daty urodzenia
- **Wykrywanie płci** - w formacie PZLA na podstawie nazwy konkurencji
- **Duplikaty** - sprawdzanie po imieniu, nazwisku i dacie urodzenia
- **Walidacja** - sprawdzanie wymaganych pól

## 📊 Wyniki importu:

Po imporcie zobaczysz:
- 🟢 **Zaimportowano** - nowi zawodnicy
- 🔵 **Zaktualizowano** - istniejący zawodnicy (jeśli włączona opcja)
- ⚪ **Pominięto** - duplikaty lub błędne rekordy
- 🔴 **Błędy** - szczegółowa lista problemów

## 🛠️ Instalacja zależności:

Jeśli jeszcze nie zainstalowałeś zależności:

```bash
# Backend
cd athletics-platform/backend
npm install csv-parser multer

# Frontend  
cd athletics-platform/frontend
npm install @radix-ui/react-radio-group @radix-ui/react-tabs @radix-ui/react-dialog
```

## 🚀 Uruchomienie:

```bash
# Backend (port 3002)
cd athletics-platform/backend
npm run start:dev

# Frontend (port 3001)
cd athletics-platform/frontend  
npm run dev
```

## 📖 Pełna dokumentacja:

Szczegółowa dokumentacja znajduje się w pliku `IMPORT_CSV_DOCUMENTATION.md`

## 🎉 Gotowe do użycia!

Funkcjonalność jest w pełni gotowa i przetestowana. Możesz teraz importować zawodników z plików CSV w obu formatach!

---

**Autor**: AI Assistant  
**Data**: 2025-01-05  
**Status**: ✅ Kompletne i gotowe do użycia