# 🏃‍♂️ Athletics Platform

Profesjonalna platforma do zarządzania zawodami lekkoatletycznymi w Polsce.

## 🔒 Bezpieczeństwo

Ta aplikacja implementuje nowoczesne standardy bezpieczeństwa:
- ✅ JWT tokeny w HttpOnly cookies (zabezpieczenie przed XSS)
- ✅ Bezpieczna obsługa błędów (różne komunikaty dev/prod)
- ✅ Silne klucze szyfrowania
- ✅ Prawidłowa konfiguracja CORS
- ✅ Usunięte debug/test strony z produkcji

📖 **Szczegóły:** Zobacz [SECURITY_IMPROVEMENTS.md](SECURITY_IMPROVEMENTS.md)

## 🚀 Szybkie uruchomienie

### Windows
```bash
# Opcja 1: Użyj skryptu (najłatwiejsze)
start.bat

# Opcja 2: Ręcznie
# Terminal 1 - Backend
cd athletics-platform/backend
npm run start:dev

# Terminal 2 - Frontend  
cd athletics-platform/frontend
npm run dev
```

### Linux/Mac
```bash
# Terminal 1 - Backend
cd athletics-platform/backend
npm run start:dev

# Terminal 2 - Frontend
cd athletics-platform/frontend  
npm run dev
```

## 🌐 Dostęp

- **Aplikacja**: http://localhost:3000
- **API**: http://localhost:3001
- **Login**: http://localhost:3000/login

## 👥 Konta testowe

| Rola | Email | Hasło |
|------|-------|-------|
| Admin | admin@athletics.pl | password123 |
| Organizator | organizer@athletics.pl | password123 |
| Trener | coach@athletics.pl | password123 |
| Zawodnik | athlete@athletics.pl | password123 |

## 📚 Dokumentacja

- [Szybki start](QUICK_START.md) - Szczegółowe instrukcje
- [API Documentation](athletics-platform/backend/README.md)
- [Frontend Guide](athletics-platform/frontend/README.md)

## 🛠️ Technologie

- **Backend**: NestJS, Prisma, SQLite, JWT
- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Database**: SQLite (dev), PostgreSQL (prod)

## 📊 Funkcje

### ✅ Zaimplementowane
- System uwierzytelniania (JWT)
- Zarządzanie użytkownikami (role: Admin, Organizator, Trener, Zawodnik)
- Zarządzanie zawodnikami
- Zarządzanie zawodami
- Zarządzanie konkurencjami
- System rejestracji na zawody
- Wprowadzanie i przeglądanie wyników
- Responsywny interfejs użytkownika
- Dashboard dla różnych ról

### 🚧 W trakcie rozwoju
- Wieloboje (decathlon, heptathlon)
- Integracja z systemem FinishLynx
- Generowanie raportów
- System powiadomień
- Płatności online
- API dla aplikacji mobilnych

## 🏗️ Architektura

```
athletics-platform/
├── backend/          # NestJS API
├── frontend/         # Next.js App
├── athletics-platform-agent/  # Desktop Agent (FinishLynx)
├── docs/            # Dokumentacja
└── scripts/         # Skrypty pomocnicze
```

## 🤝 Rozwój

### Wymagania
- Node.js 18+
- npm lub yarn
- Git

### Setup deweloperski
```bash
# Sklonuj repozytorium
git clone <repo-url>
cd athletics-platform

# Backend
cd athletics-platform/backend
npm install
npm run seed  # Dane testowe
npm run start:dev

# Frontend
cd ../frontend
npm install  
npm run dev
```

### Dodawanie nowych funkcji
1. Backend: Dodaj endpoint w NestJS
2. Database: Zaktualizuj schema Prisma
3. Frontend: Stwórz komponenty React
4. Testuj funkcjonalność
5. Dokumentuj zmiany

## 📝 Licencja

Ten projekt jest własnością prywatną. Wszystkie prawa zastrzeżone.

## 📞 Kontakt

W przypadku pytań lub problemów, skontaktuj się z zespołem deweloperskim.

---

**Miłego korzystania z Athletics Platform! 🏃‍♂️🏃‍♀️**