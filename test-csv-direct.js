const fs = require("fs");

// Simulate the CSV parsing logic from the backend
function parseCSV(csvData) {
  const lines = csvData.trim().split(/\r?\n/);
  const headers = lines[0].split(";");

  console.log("📋 Headers found:", headers.slice(0, 15));

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

// Simulate the parsePZLARow logic
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

  return {
    lastName,
    firstName,
    eventName,
    dateOfBirth: row.DataUr || row["DataUr"],
    club: row.Klub,
    personalBest: row.PB,
    seasonBest: row.SB,
    startNumber: row.NrStart,
  };
}

// Test the parsing
const csvContent = fs.readFileSync("2025-07-19_WARS.csv", "utf-8");
const rows = parseCSV(csvContent);

console.log(`\n🔍 Total rows parsed: ${rows.length}`);

// Parse first 10 rows
const parsedEntries = [];
for (let i = 0; i < Math.min(10, rows.length); i++) {
  const entry = parsePZLARow(rows[i]);
  if (entry) {
    parsedEntries.push(entry);
    console.log(
      `✅ Row ${i + 1}: ${entry.firstName} ${entry.lastName} - ${entry.eventName}`
    );
  } else {
    console.log(`❌ Row ${i + 1}: Skipped (invalid data)`);
  }
}

console.log(`\n📊 Summary:`);
console.log(`- Total CSV rows: ${rows.length}`);
console.log(`- Valid entries in first 10: ${parsedEntries.length}`);

// Show first valid entry details
if (parsedEntries.length > 0) {
  console.log(`\n🎯 First valid entry details:`);
  console.log(JSON.stringify(parsedEntries[0], null, 2));
}
