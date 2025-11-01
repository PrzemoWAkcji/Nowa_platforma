# 🚀 Athletics Platform - Quick Start

> **One command to start everything!**

## ⚡ Super Quick Start

```bash
# Option 1: NPM (Recommended)
npm run dev

# Option 2: PowerShell Script
.\start.ps1

# Option 3: Advanced PowerShell
.\dev.ps1 start
```

## 🎯 What happens when you run `npm run dev`?

1. **🔧 Backend API** starts on `http://localhost:3002`
2. **🎨 Frontend Web** starts on `http://localhost:3000`
3. **📊 Database** is automatically connected
4. **🔄 Hot reload** is enabled for both services
5. **🎨 Beautiful colored logs** show you what's happening

## 📋 First Time Setup

```bash
# Install all dependencies and setup database
npm run setup

# Then start development
npm run dev
```

---

## 👥 **Konta Testowe**

Po uruchomieniu aplikacji możesz zalogować się używając następujących kont:

| Rola | Email | Hasło | Opis |
|------|-------|-------|------|
| **Administrator** | admin@athletics.pl | password123 | Pełny dostęp do systemu |
| **Organizator** | organizer@athletics.pl | password123 | Może tworzyć i zarządzać zawodami |
| **Trener** | coach@athletics.pl | password123 | Może zarządzać zawodnikami |
| **Zawodnik** | athlete@athletics.pl | password123 | Może przeglądać zawody i wyniki |

---

## 🌐 **Dostęp do Aplikacji**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001  
- **Strona logowania**: http://localhost:3000/login

---

## 📊 **Przykładowe Dane**

System zawiera przykładowe dane:
- 4 użytkowników (różne role)
- 4 zawodników (Adam Małysz, Justyna Święty-Ersetic, Paweł Fajdek, Ewa Swoboda)
- 3 zawody (różne statusy)
- 3 konkurencje (Bieg 100m, Bieg 400m, Rzut młotem)
- Przykładowe rejestracje i wyniki

---

## 🔧 **Funkcje Systemu**

### **Dla Administratorów**
- Zarządzanie użytkownikami (/users)
- Pełny dostęp do wszystkich zawodów
- Zarządzanie zawodnikami
- Przeglądanie wszystkich danych

### **Dla Organizatorów**
- Tworzenie i zarządzanie zawodami
- Zarządzanie konkurencjami
- Przeglądanie rejestracji
- Wprowadzanie wyników

### **Dla Trenerów**
- Zarządzanie swoimi zawodnikami (/my-athletes)
- Rejestrowanie zawodników na zawody
- Przeglądanie wyników swoich zawodników

### **Dla Zawodników**
- Przeglądanie dostępnych zawodów
- Przeglądanie swoich wyników
- Śledzenie historii startów

---

## 🛠️ **Technologie**

- **Backend**: NestJS, Prisma ORM, SQLite, JWT Authentication
- **Frontend**: Next.js 15, React 19, TanStack Query, Zustand
- **UI**: Tailwind CSS, Shadcn/ui, Lucide Icons
- **Baza danych**: SQLite (development), PostgreSQL (production)

---

## 📝 **Uwagi**

- Aplikacja jest w fazie rozwoju
- Niektóre funkcje mogą być w trakcie implementacji  
- Dane testowe są resetowane przy każdym uruchomieniu `npm run seed`
- Strona główna pokazuje publiczne zawody: http://localhost:3000
- Panel administracyjny dostępny po zalogowaniu

---

## 🐛 **Troubleshooting**

### **Problem: Port zajęty**
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### **Problem: Backend nie startuje**
```bash
# Sprawdź czy wszystkie zależności są zainstalowane
cd athletics-platform/backend
npm install

# Sprawdź czy baza danych jest utworzona
npm run seed
```

### **Problem: Frontend nie startuje**
```bash
# Sprawdź czy wszystkie zależności są zainstalowane
cd athletics-platform/frontend
npm install

# Wyczyść cache
rm -rf .next
npm run dev
```

---

## 🎉 **Gotowe!**

Masz teraz działającą platformę lekkoatletyczną! 

### **Następne kroki:**
1. Zaloguj się jako admin i eksploruj funkcje
2. Dodaj nowych zawodników
3. Stwórz nowe zawody
4. Przetestuj różne role użytkowników
5. Dostosuj platformę do swoich potrzeb

**Miłego korzystania! 🏃‍♂️🏃‍♀️**