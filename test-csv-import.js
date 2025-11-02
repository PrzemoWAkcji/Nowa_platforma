const fs = require("fs");

// Read the CSV file
const csvContent = fs.readFileSync("2025-07-19_WARS.csv", "utf-8");

// Parse CSV manually to see the structure
const lines = csvContent.trim().split(/\r?\n/);
console.log("Total lines:", lines.length);

// Check the header
const separator = csvContent.includes(";") ? ";" : ",";
console.log("Detected separator:", separator);

const headers = lines[0].split(separator);
console.log("Headers:", headers.slice(0, 15));
console.log("Total headers:", headers.length);

// Check first data row
if (lines.length > 1) {
  const firstDataRow = lines[1].split(separator);
  console.log("First data row values:", firstDataRow.slice(0, 15));
  console.log("Total values in first row:", firstDataRow.length);

  // Create object from first row
  const rowObj = {};
  headers.forEach((header, index) => {
    rowObj[header] = firstDataRow[index] || "";
  });

  console.log("Row object keys:", Object.keys(rowObj).slice(0, 15));
  console.log("Nazwisko:", rowObj.Nazwisko);
  console.log("Imię variants:", {
    Imię: rowObj["Imię"],
    "Imi�": rowObj["Imi�"],
    Imie: rowObj["Imie"],
  });
}
