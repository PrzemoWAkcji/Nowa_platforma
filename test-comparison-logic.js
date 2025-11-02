// Test logiki porównywania wyników

function parseTimeToSeconds(timeStr) {
  const cleaned = timeStr.trim().replace(/['"]/g, "");

  if (cleaned.includes(":")) {
    const parts = cleaned.split(":");
    if (parts.length === 2) {
      const minutes = parseFloat(parts[0]);
      const seconds = parseFloat(parts[1]);
      return minutes * 60 + seconds;
    }
  }

  return parseFloat(cleaned);
}

function isResultBetter(newResult, currentResult) {
  console.log(`🔍 Comparing times:`);
  console.log(`   New: "${newResult}"`);
  console.log(`   Current: "${currentResult}"`);

  const newTime = parseTimeToSeconds(newResult);
  const currentTime = parseTimeToSeconds(currentResult);
  const isBetter = newTime < currentTime;

  console.log(
    `   Parsed times: new=${newTime}s, current=${currentTime}s, better=${isBetter}`
  );
  return isBetter;
}

console.log("🧪 Testing comparison logic...\n");

// Test 1: Lepszy PB
console.log("Test 1: PB comparison");
const result1 = isResultBetter("1:48.50", "1:50.25");
console.log(`Result: ${result1} (should be true)\n`);

// Test 2: Lepszy SB
console.log("Test 2: SB comparison");
const result2 = isResultBetter("1:49.00", "1:52.10");
console.log(`Result: ${result2} (should be true)\n`);

// Test 3: Gorszy wynik
console.log("Test 3: Worse result");
const result3 = isResultBetter("1:55.00", "1:50.25");
console.log(`Result: ${result3} (should be false)\n`);

console.log("🎉 Comparison logic test completed!");
