// Test do debugowania problemu z czasem 32:45

// Symulacja problemu - dodawanie dużej liczby minut do daty
const startTime = new Date('2024-01-01T08:00:00');
console.log('Czas startowy:', startTime.toLocaleTimeString('pl-PL', {
  hour: '2-digit',
  minute: '2-digit',
}));

// Symulacja dodawania wielu wydarzeń z długimi czasami trwania
let currentTime = new Date(startTime);

// Przykład: 10 wydarzeń po 90 minut każde + 15 minut przerwy
for (let i = 0; i < 10; i++) {
  const duration = 90; // 90 minut na wydarzenie
  const breakDuration = 15; // 15 minut przerwy
  
  console.log(`Wydarzenie ${i + 1}:`, currentTime.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  }));
  
  // Dodaj czas trwania wydarzenia + przerwa
  currentTime = new Date(currentTime.getTime() + (duration + breakDuration) * 60000);
}

console.log('Czas końcowy:', currentTime.toLocaleTimeString('pl-PL', {
  hour: '2-digit',
  minute: '2-digit',
}));

// Test z bardzo długim czasem
const extremeTime = new Date('2024-01-01T08:00:00');
extremeTime.setTime(extremeTime.getTime() + 24 * 60 * 60000); // Dodaj 24 godziny
console.log('Czas po 24 godzinach:', extremeTime.toLocaleTimeString('pl-PL', {
  hour: '2-digit',
  minute: '2-digit',
}));

// Test z 32 godzinami
const time32h = new Date('2024-01-01T08:00:00');
time32h.setTime(time32h.getTime() + 32 * 60 * 60000); // Dodaj 32 godziny
console.log('Czas po 32 godzinach:', time32h.toLocaleTimeString('pl-PL', {
  hour: '2-digit',
  minute: '2-digit',
}));

// Test z 32:45
const time32_45 = new Date('2024-01-01T08:00:00');
time32_45.setTime(time32_45.getTime() + (32 * 60 + 45) * 60000); // Dodaj 32h 45min
console.log('Czas po 32h 45min:', time32_45.toLocaleTimeString('pl-PL', {
  hour: '2-digit',
  minute: '2-digit',
}));