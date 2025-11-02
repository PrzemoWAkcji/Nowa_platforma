#!/usr/bin/env node

/**
 * Narzędzie do konwersji kodowania plików CSV
 * Użycie: node convert-csv-encoding.js input.csv [output.csv] [source-encoding] [target-encoding]
 */

const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");

function convertCsvEncoding(
  inputFile,
  outputFile,
  sourceEncoding = "windows-1250",
  targetEncoding = "utf-8"
) {
  try {
    console.log(`🔄 Konwertowanie ${inputFile}...`);
    console.log(`📥 Kodowanie źródłowe: ${sourceEncoding}`);
    console.log(`📤 Kodowanie docelowe: ${targetEncoding}`);

    // Wczytaj plik
    const buffer = fs.readFileSync(inputFile);

    // Dekoduj z kodowania źródłowego
    const text = iconv.decode(buffer, sourceEncoding);

    // Koduj do kodowania docelowego
    const convertedBuffer = iconv.encode(text, targetEncoding);

    // Zapisz plik
    fs.writeFileSync(outputFile, convertedBuffer);

    console.log(`✅ Plik został skonwertowany: ${outputFile}`);

    // Pokaż próbkę
    const sample = text.split("\n").slice(0, 3).join("\n");
    console.log("\n📋 Próbka zawartości:");
    console.log(sample);
  } catch (error) {
    console.error("❌ Błąd podczas konwersji:", error.message);
    process.exit(1);
  }
}

function detectEncoding(filePath) {
  const buffer = fs.readFileSync(filePath);

  // Sprawdź BOM UTF-8
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xef &&
    buffer[1] === 0xbb &&
    buffer[2] === 0xbf
  ) {
    return "utf-8";
  }

  // Testuj różne kodowania
  const encodings = ["windows-1250", "utf-8", "iso-8859-2", "cp852"];

  for (const encoding of encodings) {
    try {
      const text = iconv.decode(buffer, encoding);
      const hasPolishChars = /[ąćęłńóśźż]/i.test(text);
      const hasValidHeaders =
        text.includes("Pełna nazwa") ||
        text.includes("metrów") ||
        text.includes("Imię");
      const hasNoReplacementChars = !text.includes("�");

      if ((hasPolishChars || hasValidHeaders) && hasNoReplacementChars) {
        return encoding;
      }
    } catch (e) {
      continue;
    }
  }

  return "windows-1250"; // Domyślne dla polskich plików
}

// Główna logika
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
🔧 Narzędzie do konwersji kodowania plików CSV

Użycie:
  node convert-csv-encoding.js input.csv [output.csv] [source-encoding] [target-encoding]

Przykłady:
  node convert-csv-encoding.js data.csv                    # Auto-wykrycie -> UTF-8
  node convert-csv-encoding.js data.csv data_utf8.csv     # Auto-wykrycie -> UTF-8
  node convert-csv-encoding.js data.csv data_utf8.csv windows-1250 utf-8

Obsługiwane kodowania:
  - windows-1250 (domyślne dla polskich plików)
  - utf-8
  - iso-8859-2
  - cp852
`);
  process.exit(0);
}

const inputFile = args[0];
const outputFile = args[1] || inputFile.replace(/\.csv$/i, "_utf8.csv");
const sourceEncoding = args[2] || detectEncoding(inputFile);
const targetEncoding = args[3] || "utf-8";

if (!fs.existsSync(inputFile)) {
  console.error(`❌ Plik nie istnieje: ${inputFile}`);
  process.exit(1);
}

console.log(`🔍 Wykryte kodowanie: ${sourceEncoding}`);
convertCsvEncoding(inputFile, outputFile, sourceEncoding, targetEncoding);
