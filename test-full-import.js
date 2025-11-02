const fs = require("fs");

// Test the full parsing logic
function parseCSV(csvData) {
  const lines = csvData.trim().split(/\r?\n/);
  const headers = lines[0].split(";");

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(";");
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    rows.push(row);
  }

  return rows;
}

function cleanResultValue(value) {
  if (!value) return undefined;

  const cleaned = value
    .trim()
    .replace(/^'/, "") // Remove apostrophe at start
    .replace(/'$/, "") // Remove apostrophe at end
    .replace(/^"/, "") // Remove quote at start
    .replace(/"$/, "") // Remove quote at end
    .trim();

  // If empty after cleaning, return undefined
  if (cleaned === "" || cleaned === "''" || cleaned === '""') {
    return undefined;
  }

  // Check if it's a valid result (number with optional unit)
  if (cleaned.match(/^\d+[\.,]\d+$/)) {
    return cleaned.replace(",", "."); // Replace comma with dot for consistency
  }

  return cleaned;
}

function parsePZLARow(row) {
  const lastName = row.Nazwisko || row["Nazwisko"];
  const firstName = row["Imi�"] || row["Imię"] || row["Imie"];
  const eventName =
    row["Pe�na nazwa"] ||
    row["Pełna nazwa"] ||
    row["Pelna nazwa"] ||
    row.NazwaPZLA;

  if (
    !lastName ||
    !firstName ||
    lastName === "Nazwisko" ||
    lastName === "Impreza"
  ) {
    return null;
  }

  // Parse date of birth
  let dateOfBirth = "";
  const birthDateField = row.DataUr || row["DataUr"];
  if (birthDateField) {
    const dateMatch = birthDateField.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      dateOfBirth = birthDateField;
    }
  }

  // Determine gender from event name
  const gender =
    eventName && eventName.toLowerCase().includes("kobiet") ? "FEMALE" : "MALE";

  // Clean PB and SB values
  const personalBest = cleanResultValue(row.PB);
  const seasonBest = cleanResultValue(row.SB);

  return {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    club: row.Klub?.trim() || undefined,
    eventName: eventName?.trim() || undefined,
    personalBest,
    seasonBest,
    startNumber: row.NrStart?.trim() || undefined,
    coach: row.Trener?.trim() || undefined,
    notes: row.OOM?.trim() || undefined,
  };
}

// Test the full parsing
const csvContent = fs.readFileSync("2025-07-19_WARS.csv", "utf-8");
const rows = parseCSV(csvContent);

console.log(`🔍 Total CSV rows: ${rows.length}`);

// Parse all rows
const parsedEntries = [];
let skippedCount = 0;

for (let i = 0; i < rows.length; i++) {
  const entry = parsePZLARow(rows[i]);
  if (entry) {
    parsedEntries.push(entry);
  } else {
    skippedCount++;
  }
}

console.log(`\n📊 Parsing Results:`);
console.log(`- Total CSV rows: ${rows.length}`);
console.log(`- Valid entries: ${parsedEntries.length}`);
console.log(`- Skipped entries: ${skippedCount}`);
console.log(
  `- Success rate: ${((parsedEntries.length / rows.length) * 100).toFixed(1)}%`
);

// Show sample entries
console.log(`\n🎯 Sample entries (first 5):`);
for (let i = 0; i < Math.min(5, parsedEntries.length); i++) {
  const entry = parsedEntries[i];
  console.log(`${i + 1}. ${entry.firstName} ${entry.lastName}`);
  console.log(`   Event: ${entry.eventName}`);
  console.log(`   Gender: ${entry.gender}`);
  console.log(`   DOB: ${entry.dateOfBirth}`);
  console.log(`   Club: ${entry.club}`);
  console.log(`   PB: ${entry.personalBest || "N/A"}`);
  console.log(`   SB: ${entry.seasonBest || "N/A"}`);
  console.log("");
}

// Check for different events
const events = [
  ...new Set(parsedEntries.map((e) => e.eventName).filter(Boolean)),
];
console.log(`\n🏃 Events found: ${events.length}`);
events.slice(0, 10).forEach((event, i) => {
  const count = parsedEntries.filter((e) => e.eventName === event).length;
  console.log(`${i + 1}. ${event} (${count} athletes)`);
});

// Check gender distribution
const genderStats = parsedEntries.reduce((acc, entry) => {
  acc[entry.gender] = (acc[entry.gender] || 0) + 1;
  return acc;
}, {});

console.log(`\n👥 Gender distribution:`);
Object.entries(genderStats).forEach(([gender, count]) => {
  console.log(`- ${gender}: ${count} athletes`);
});

// Check PB/SB data
const withPB = parsedEntries.filter((e) => e.personalBest).length;
const withSB = parsedEntries.filter((e) => e.seasonBest).length;

console.log(`\n📈 Performance data:`);
console.log(
  `- Athletes with PB: ${withPB} (${((withPB / parsedEntries.length) * 100).toFixed(1)}%)`
);
console.log(
  `- Athletes with SB: ${withSB} (${((withSB / parsedEntries.length) * 100).toFixed(1)}%)`
);
