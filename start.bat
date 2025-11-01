@echo off
echo ========================================
echo   Athletics Platform - Quick Start
echo ========================================
echo.

echo [1/3] Uruchamianie Backend (port 3001)...
cd athletics-platform\backend
start "Backend" cmd /k "npm run start:dev"

echo [2/3] Czekanie 3 sekundy...
timeout /t 3 /nobreak >nul

echo [3/3] Uruchamianie Frontend (port 3000)...
cd ..\frontend
start "Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   Aplikacja się uruchamia...
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Konta testowe:
echo - Admin:      admin@athletics.pl / password123
echo - Organizator: organizer@athletics.pl / password123  
echo - Trener:     coach@athletics.pl / password123
echo - Zawodnik:   athlete@athletics.pl / password123
echo.
echo Czekanie 5 sekund przed otwarciem przeglądarki...
timeout /t 5 /nobreak >nul

echo Otwieranie przeglądarki...
start http://localhost:3000

echo.
echo Gotowe! Miłego korzystania! 🏃‍♂️🏃‍♀️
pause