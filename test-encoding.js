const fs = require("fs");

// Test kodowania pliku CSV
function testFileEncoding() {
  const filePath = "c:/nowa platforma/2025-07-19_WARS.csv";

  console.log("🔍 Testing file encoding...");

  // Sprawdź czy plik istnieje
  if (!fs.existsSync(filePath)) {
    console.log("❌ File does not exist:", filePath);
    return;
  }

  // Odczytaj plik jako buffer
  const buffer = fs.readFileSync(filePath);
  console.log(`📁 File size: ${buffer.length} bytes`);

  // Sprawdź BOM
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xef &&
    buffer[1] === 0xbb &&
    buffer[2] === 0xbf
  ) {
    console.log("✅ File has UTF-8 BOM");
  } else {
    console.log("❌ File does not have UTF-8 BOM");
  }

  // Spróbuj różnych kodowań
  console.log("\n🔤 Testing different encodings:");

  // UTF-8
  try {
    const utf8Content = buffer.toString("utf-8");
    const firstLine = utf8Content.split("\n")[0];
    console.log(`UTF-8: ${firstLine.substring(0, 100)}...`);
    console.log(`UTF-8 has replacement chars: ${utf8Content.includes("�")}`);
  } catch (e) {
    console.log("UTF-8: Error -", e.message);
  }

  // Windows-1250
  try {
    const iconv = require("iconv-lite");
    const win1250Content = iconv.decode(buffer, "windows-1250");
    const firstLine = win1250Content.split("\n")[0];
    console.log(`Windows-1250: ${firstLine.substring(0, 100)}...`);
    console.log(
      `Windows-1250 has replacement chars: ${win1250Content.includes("�")}`
    );
  } catch (e) {
    console.log("Windows-1250: Error -", e.message);
  }

  // Test konkretnej linii z Anną LOZOVYTSKĄ
  console.log("\n🔍 Looking for Anna LOZOVYTSKA line...");
  const utf8Content = buffer.toString("utf-8");
  const lines = utf8Content.split("\n");
  const annaLine = lines.find(
    (line) => line.includes("LOZOVYTSKA") && line.includes("100 m p")
  );
  if (annaLine) {
    console.log("Found Anna line (UTF-8):");
    console.log(annaLine);

    // Sprawdź czy zawiera zniekształcone znaki
    if (annaLine.includes("p�")) {
      console.log("⚠️  Line contains corrupted characters (p� instead of pł)");
    }
  }
}

testFileEncoding();
