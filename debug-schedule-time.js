// Test symulujący generowanie harmonogramu z długimi czasami

console.log("=== SYMULACJA GENEROWANIA HARMONOGRAMU ===\n");

// Symulacja danych wejściowych
const startTime = new Date("2024-01-01T08:00:00");
const breakDuration = 15; // minuty

console.log(
  "Czas startowy:",
  startTime.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  })
);

// Symulacja wydarzeń z różnymi czasami trwania
const events = [
  { name: "100m M", duration: 15 },
  { name: "100m K", duration: 15 },
  { name: "400m M", duration: 20 },
  { name: "400m K", duration: 20 },
  { name: "1500m M", duration: 25 },
  { name: "1500m K", duration: 25 },
  { name: "5000m M", duration: 45 },
  { name: "5000m K", duration: 45 },
  { name: "10000m M", duration: 90 }, // Długi bieg
  { name: "10000m K", duration: 90 }, // Długi bieg
  { name: "Maraton M", duration: 180 }, // Bardzo długi
  { name: "Maraton K", duration: 180 }, // Bardzo długi
];

let currentTime = new Date(startTime);
const scheduleItems = [];

console.log("\n=== GENEROWANIE HARMONOGRAMU ===\n");

for (let i = 0; i < events.length; i++) {
  const event = events[i];

  // Zapisz czas wydarzenia
  const eventTime = new Date(currentTime);
  const timeKey = eventTime.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  scheduleItems.push({
    time: timeKey,
    eventName: event.name,
    scheduledTime: eventTime,
  });

  console.log(`${timeKey} - ${event.name} (${event.duration} min)`);

  // Przesuń czas o czas trwania wydarzenia + przerwa
  currentTime = new Date(
    currentTime.getTime() + (event.duration + breakDuration) * 60000
  );

  // Sprawdź czy czas nie przekroczył 24h
  if (currentTime.getDate() !== startTime.getDate()) {
    console.log(`⚠️  UWAGA: Czas przeszedł na następny dzień!`);
    console.log(`   Aktualna data: ${currentTime.toISOString()}`);
  }
}

console.log("\n=== PODSUMOWANIE ===\n");
console.log(
  "Czas końcowy:",
  currentTime.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  })
);

const totalMinutes =
  (currentTime.getTime() - startTime.getTime()) / (1000 * 60);
console.log(
  `Całkowity czas: ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}min`
);

// Test z jeszcze dłuższymi czasami
console.log("\n=== TEST Z EKSTREMALNIE DŁUGIMI CZASAMI ===\n");

const extremeStartTime = new Date("2024-01-01T08:00:00");
let extremeCurrentTime = new Date(extremeStartTime);

// Dodaj 30 godzin
extremeCurrentTime = new Date(extremeCurrentTime.getTime() + 30 * 60 * 60000);
console.log(
  "Po 30 godzinach:",
  extremeCurrentTime.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  })
);

// Dodaj jeszcze 2h 45min (razem 32h 45min)
extremeCurrentTime = new Date(
  extremeCurrentTime.getTime() + (2 * 60 + 45) * 60000
);
console.log(
  "Po 32h 45min:",
  extremeCurrentTime.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  })
);

// Test z błędnymi danymi
console.log("\n=== TEST Z BŁĘDNYMI DANYMI ===\n");

const badDate = new Date("invalid");
console.log(
  "Błędna data:",
  badDate.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  })
);

// Test z null/undefined
try {
  const nullTime = null;
  console.log(
    "Null time:",
    nullTime.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
} catch (error) {
  console.log("Błąd z null:", error.message);
}
