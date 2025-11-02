// Test różnych formatów czasu

const testDate = new Date("2024-01-01T08:45:00");

console.log("Standardowe formatowanie:");
console.log("toLocaleTimeString():", testDate.toLocaleTimeString());
console.log(
  'toLocaleTimeString("pl-PL"):',
  testDate.toLocaleTimeString("pl-PL")
);
console.log(
  'toLocaleTimeString("pl-PL", {hour: "2-digit", minute: "2-digit"}):',
  testDate.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })
);

// Test z różnymi datami
const dates = [
  new Date("2024-01-01T08:45:00"),
  new Date("2024-01-01T23:45:00"),
  new Date("2024-01-02T00:45:00"),
  new Date("2024-01-02T08:45:00"),
];

console.log("\nTest różnych dat:");
dates.forEach((date, i) => {
  console.log(
    `Data ${i + 1}:`,
    date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
});

// Test z nieprawidłową datą
console.log("\nTest z nieprawidłową datą:");
const invalidDate = new Date("invalid");
console.log(
  "Invalid date:",
  invalidDate.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  })
);

// Test z bardzo dużą liczbą milisekund
console.log("\nTest z dużą liczbą milisekund:");
const bigDate = new Date(Date.now() + 1000000000000); // Dodaj dużą liczbę ms
console.log(
  "Big date:",
  bigDate.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  })
);

// Test manualnego formatowania
function formatTime(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return "Invalid Date";
  }

  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

console.log("\nTest manualnego formatowania:");
dates.forEach((date, i) => {
  console.log(`Data ${i + 1} (manual):`, formatTime(date));
});
