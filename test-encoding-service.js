const fs = require("fs");
const iconv = require("iconv-lite");

// Symulacja EncodingService
class EncodingService {
  decodeCsvBuffer(buffer) {
    try {
      // 1. Sprawdź czy plik ma BOM UTF-8
      if (this.hasUtf8Bom(buffer)) {
        return buffer.toString("utf-8");
      }

      // 2. Spróbuj UTF-8 (coraz częściej używane)
      const utf8Result = buffer.toString("utf-8");
      if (!utf8Result.includes("�") && this.isValidPolishText(utf8Result)) {
        return utf8Result;
      }

      // 3. Spróbuj Windows-1250 (domyślne dla starszych polskich systemów)
      const windows1250Result = iconv.decode(buffer, "windows-1250");
      if (this.isValidPolishText(windows1250Result)) {
        return windows1250Result;
      }

      // 4. Spróbuj ISO-8859-2
      const iso88592Result = iconv.decode(buffer, "iso-8859-2");
      if (this.isValidPolishText(iso88592Result)) {
        return iso88592Result;
      }

      // 5. Ostatnia próba - CP852 (DOS)
      const cp852Result = iconv.decode(buffer, "cp852");
      if (this.isValidPolishText(cp852Result)) {
        return cp852Result;
      }

      // 6. Fallback do Windows-1250 (najczęstsze)
      return windows1250Result;
    } catch (error) {
      // Ostateczny fallback do UTF-8
      return buffer.toString("utf-8");
    }
  }

  hasUtf8Bom(buffer) {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xef &&
      buffer[1] === 0xbb &&
      buffer[2] === 0xbf
    );
  }

  isValidPolishText(text) {
    // Sprawdź polskie znaki
    const hasPolishChars = /[ąćęłńóśźż]/i.test(text);

    // Sprawdź typowe nagłówki z polskich plików CSV
    const hasValidHeaders =
      text.includes("Pełna nazwa") ||
      text.includes("metrów") ||
      text.includes("Imię") ||
      text.includes("Nazwisko") ||
      text.includes("Data") ||
      text.includes("Klub");

    // Sprawdź czy nie ma znaków zastępczych
    const hasNoReplacementChars = !text.includes("�");

    return (hasPolishChars || hasValidHeaders) && hasNoReplacementChars;
  }
}

// Test EncodingService
function testEncodingService() {
  const filePath = "c:/nowa platforma/2025-07-19_WARS.csv";

  console.log("🔍 Testing EncodingService...");

  if (!fs.existsSync(filePath)) {
    console.log("❌ File does not exist:", filePath);
    return;
  }

  const buffer = fs.readFileSync(filePath);
  const encodingService = new EncodingService();

  console.log("📋 Testing EncodingService.decodeCsvBuffer()...");
  const decodedContent = encodingService.decodeCsvBuffer(buffer);

  // Sprawdź pierwszą linię
  const firstLine = decodedContent.split("\n")[0];
  console.log(`First line: ${firstLine.substring(0, 100)}...`);
  console.log(`Has replacement chars: ${decodedContent.includes("�")}`);

  // Znajdź linię z Anną LOZOVYTSKĄ
  const lines = decodedContent.split("\n");
  const annaLine = lines.find(
    (line) => line.includes("LOZOVYTSKA") && line.includes("100 m p")
  );

  if (annaLine) {
    console.log("\n🏃‍♀️ Anna LOZOVYTSKA line:");
    console.log(annaLine);

    // Sprawdź czy zawiera poprawne polskie znaki
    if (annaLine.includes("pł")) {
      console.log("✅ Line contains correct Polish characters (pł)");
    } else if (annaLine.includes("p�")) {
      console.log("❌ Line still contains corrupted characters (p�)");
    }

    // Sprawdź PB i SB
    const parts = annaLine.split(";");
    const pb = parts[20]; // kolumna PB
    const sb = parts[19]; // kolumna SB
    console.log(`PB: "${pb}"`);
    console.log(`SB: "${sb}"`);
  }
}

testEncodingService();
