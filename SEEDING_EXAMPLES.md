# 📋 Przykłady rozstawienia zawodników

## Przykład 1: Finał 100m męski (8 zawodników)

### Dane wejściowe
```
Zawodnicy z czasami zgłoszeniowymi:
1. Jan Kowalski - 10.15
2. Piotr Nowak - 10.22  
3. Adam Wiśniewski - 10.18
4. Marcin Zieliński - 10.31
5. Tomasz Lewandowski - 10.28
6. Krzysztof Wójcik - 10.25
7. Michał Kamiński - 10.35
8. Robert Kowalczyk - 10.40
```

### Ustawienia
- **Metoda**: WA - Sprinty (prosta)
- **Liczba torów**: 8

### Wynik rozstawienia
```
Tor 1: Michał Kamiński (10.35) - 7. czas
Tor 2: Tomasz Lewandowski (10.28) - 5. czas
Tor 3: Adam Wiśniewski (10.18) - 3. czas
Tor 4: Jan Kowalski (10.15) - NAJLEPSZY
Tor 5: Piotr Nowak (10.22) - 2. czas
Tor 6: Krzysztof Wójcik (10.25) - 4. czas
Tor 7: Marcin Zieliński (10.31) - 6. czas
Tor 8: Robert Kowalczyk (10.40) - 8. czas
```

---

## Przykład 2: Eliminacje 400m (24 zawodników, 3 serie)

### Dane wejściowe
```
24 zawodników z czasami od 46.50 do 52.30
```

### Ustawienia
- **Podział na serie**: Według czasu/wyniku
- **Przypisanie torów**: WA - 400m/800m
- **Liczba serii**: 3 (automatycznie)

### Wynik rozstawienia

#### Seria 1 (najwolniejsi)
```
Tor 1: Zawodnik #23 (52.10)
Tor 2: Zawodnik #24 (52.30)  
Tor 3: Zawodnik #21 (51.85)
Tor 4: Zawodnik #17 (51.20) - najlepszy w serii
Tor 5: Zawodnik #18 (51.35)
Tor 6: Zawodnik #19 (51.50)
Tor 7: Zawodnik #20 (51.70)
Tor 8: Zawodnik #22 (51.95)
```

#### Seria 2 (średni)
```
Tor 1: Zawodnik #15 (50.80)
Tor 2: Zawodnik #16 (50.95)
Tor 3: Zawodnik #13 (50.45)
Tor 4: Zawodnik #9 (49.85) - najlepszy w serii
Tor 5: Zawodnik #10 (50.10)
Tor 6: Zawodnik #11 (50.25)
Tor 7: Zawodnik #12 (50.35)
Tor 8: Zawodnik #14 (50.65)
```

#### Seria 3 (najszybsi)
```
Tor 1: Zawodnik #7 (49.45)
Tor 2: Zawodnik #8 (49.65)
Tor 3: Zawodnik #5 (48.95)
Tor 4: Zawodnik #1 (46.50) - NAJLEPSZY OGÓŁEM
Tor 5: Zawodnik #2 (47.20)
Tor 6: Zawodnik #3 (48.15)
Tor 7: Zawodnik #4 (48.75)
Tor 8: Zawodnik #6 (49.25)
```

---

## Przykład 3: Skok w dal męski (12 zawodników)

### Dane wejściowe
```
Zawodnicy z wynikami zgłoszeniowymi:
1. Paweł Skoczylas - 7.85m
2. Marek Daleki - 7.72m
3. Łukasz Wysoki - 7.68m
4. Kamil Skoczek - 7.55m
5. Bartosz Lotny - 7.48m
6. Grzegorz Szybki - 7.42m
7. Rafał Mocny - 7.38m
8. Damian Zwinny - 7.35m
9. Sebastian Gibki - 7.28m
10. Mateusz Sprawny - 7.22m
11. Jakub Ruchliwy - 7.15m
12. Patryk Zręczny - 7.08m
```

### Ustawienia
- **Podział na serie**: Według wyniku
- **Przypisanie torów**: Od najlepszego do najgorszego
- **Jedna grupa**: Wszyscy w jednej serii

### Wynik rozstawienia (kolejność skoków)
```
1. Paweł Skoczylas (7.85m) - NAJLEPSZY
2. Marek Daleki (7.72m)
3. Łukasz Wysoki (7.68m)
4. Kamil Skoczek (7.55m)
5. Bartosz Lotny (7.48m)
6. Grzegorz Szybki (7.42m)
7. Rafał Mocny (7.38m)
8. Damian Zwinny (7.35m)
9. Sebastian Gibki (7.28m)
10. Mateusz Sprawny (7.22m)
11. Jakub Ruchliwy (7.15m)
12. Patryk Zręczny (7.08m) - najsłabszy
```

---

## Przykład 4: Bieg 1500m (20 zawodników, 2 serie)

### Dane wejściowe
```
20 zawodników z czasami od 3:45.00 do 4:15.30
```

### Ustawienia
- **Podział na serie**: Według czasu/wyniku
- **Przypisanie torów**: Wodospad
- **Liczba serii**: 2

### Wynik rozstawienia

#### Seria 1 (wolniejsi)
```
Tor 1: Zawodnik #11 (4:02.50) - najlepszy w serii
Tor 2: Zawodnik #12 (4:04.20)
Tor 3: Zawodnik #13 (4:05.80)
Tor 4: Zawodnik #14 (4:07.10)
Tor 5: Zawodnik #15 (4:08.45)
Tor 6: Zawodnik #16 (4:09.90)
Tor 7: Zawodnik #17 (4:11.25)
Tor 8: Zawodnik #18 (4:12.60)
Tor 9: Zawodnik #19 (4:13.95)
Tor 10: Zawodnik #20 (4:15.30) - najwolniejszy
```

#### Seria 2 (szybsi)
```
Tor 1: Zawodnik #1 (3:45.00) - NAJLEPSZY OGÓŁEM
Tor 2: Zawodnik #2 (3:47.30)
Tor 3: Zawodnik #3 (3:49.15)
Tor 4: Zawodnik #4 (3:51.20)
Tor 5: Zawodnik #5 (3:53.45)
Tor 6: Zawodnik #6 (3:55.80)
Tor 7: Zawodnik #7 (3:57.90)
Tor 8: Zawodnik #8 (3:59.25)
Tor 9: Zawodnik #9 (4:00.60)
Tor 10: Zawodnik #10 (4:01.95)
```

---

## Przykład 5: Rzut dyskiem kobiet (8 zawodniczek, hala)

### Dane wejściowe
```
Zawodniczki z wynikami zgłoszeniowymi:
1. Anna Mocna - 58.50m
2. Katarzyna Silna - 56.80m
3. Magdalena Potężna - 55.20m
4. Joanna Krzepka - 54.15m
5. Agnieszka Dzielna - 53.40m
6. Beata Sprawna - 52.75m
7. Monika Zwinny - 51.90m
8. Paulina Gibka - 50.25m
```

### Ustawienia
- **Podział na serie**: Według wyniku
- **Przypisanie torów**: Pary (hala)
- **Liczba torów**: 6 (hala)

### Wynik rozstawienia
```
Tor 1: Agnieszka Dzielna (53.40m) - 5. wynik
Tor 2: Joanna Krzepka (54.15m) - 4. wynik
Tor 3: Monika Zwinny (51.90m) - 7. wynik  
Tor 4: Beata Sprawna (52.75m) - 6. wynik
Tor 5: Anna Mocna (58.50m) - NAJLEPSZA
Tor 6: Katarzyna Silna (56.80m) - 2. wynik

Poza konkurencją (brak miejsca):
- Magdalena Potężna (55.20m) - 3. wynik
- Paulina Gibka (50.25m) - 8. wynik
```

---

## Przykład 6: Półfinał 200m (16 zawodników, 2 serie)

### Dane wejściowe
```
16 zawodników zakwalifikowanych z eliminacji
```

### Ustawienia
- **Podział na serie**: Zygzak (najlepsi rozdzieleni)
- **Przypisanie torów**: WA - 200m
- **Liczba serii**: 2

### Wynik rozstawienia

#### Seria 1
```
Tor 1: Zawodnik #15 (21.85)
Tor 2: Zawodnik #16 (21.92)
Tor 3: Zawodnik #5 (21.25) 
Tor 4: Zawodnik #6 (21.28)
Tor 5: Zawodnik #1 (20.95) - najlepszy w serii
Tor 6: Zawodnik #2 (21.02)
Tor 7: Zawodnik #3 (21.15)
Tor 8: Zawodnik #7 (21.35)
```

#### Seria 2  
```
Tor 1: Zawodnik #13 (21.75)
Tor 2: Zawodnik #14 (21.78)
Tor 3: Zawodnik #9 (21.45)
Tor 4: Zawodnik #10 (21.52)
Tor 5: Zawodnik #4 (21.18) - najlepszy w serii
Tor 6: Zawodnik #8 (21.38)
Tor 7: Zawodnik #11 (21.58)
Tor 8: Zawodnik #12 (21.65)
```

---

## 💡 Wskazówki praktyczne

### Dla sprintów (100m, 200m, 400m)
- Używaj standardów World Athletics
- Najlepsi zawodnicy w środkowych torach
- Finał: najlepszy na torze 4 lub 5

### Dla biegów długich (800m+)
- Metoda wodospadu - najlepszy przy wewnętrznej stronie
- Mniej ważne są tory, ważniejsza kolejność startu

### Dla konkurencji technicznych
- Kolejność od najlepszego do najgorszego
- Najlepsi na końcu (większa presja, ale lepsze warunki)

### Dla zawodów halowych
- Uwzględnij mniejszą liczbę torów
- Specjalne metody parowe dla hali
- Najlepsza para często na zewnętrznych torach

---

*Te przykłady pokazują praktyczne zastosowanie różnych metod rozstawienia. Wybierz metodę odpowiednią dla Twojej konkurencji i poziomu zawodów.*