console.log("🔍 Testing cleanResultValue function");

function cleanResultValue(value) {
  if (!value) return undefined;

  const cleaned = value
    .trim()
    .replace(/^'/, "") // Usuń apostrof na początku
    .replace(/'$/, "") // Usuń apostrof na końcu
    .trim();

  // Jeśli po wyczyszczeniu jest puste, zwróć undefined
  return cleaned === "" ? undefined : cleaned;
}

// Test values from CSV
const sbValue = "'4:31.19'";
const pbValue = "4:31.19/25";

console.log("📊 Testing values:");
console.log(`   SB input: "${sbValue}"`);
console.log(`   SB cleaned: "${cleanResultValue(sbValue)}"`);
console.log(`   PB input: "${pbValue}"`);
console.log(`   PB cleaned: "${cleanResultValue(pbValue)}"`);

// Test edge cases
console.log("\n🧪 Testing edge cases:");
console.log(`   Empty string: "${cleanResultValue("")}"`);
console.log(`   Undefined: "${cleanResultValue(undefined)}"`);
console.log(`   Null: "${cleanResultValue(null)}"`);
console.log(`   Only apostrophes: "${cleanResultValue("''")}"`);
