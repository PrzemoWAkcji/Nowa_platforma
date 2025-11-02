// Test funkcji getEventNameForRecords
function getEventNameForRecords(event) {
  const eventName = event.name.toUpperCase();
  console.log(`Testing event: "${event.name}" -> "${eventName}"`);

  // Biegi
  if (eventName.includes("60")) {
    return "60M";
  }
  if (
    eventName.includes("100") &&
    eventName.includes("M") &&
    !eventName.includes("H")
  )
    return "100M";
  if (eventName.includes("200") && eventName.includes("M")) return "200M";
  if (
    eventName.includes("400") &&
    eventName.includes("M") &&
    !eventName.includes("H")
  )
    return "400M";
  if (eventName.includes("800") && eventName.includes("M")) return "800M";
  if (eventName.includes("1500") && eventName.includes("M")) return "1500M";
  if (
    eventName.includes("3000") &&
    eventName.includes("M") &&
    !eventName.includes("SC")
  )
    return "3000M";
  if (eventName.includes("5000") && eventName.includes("M")) return "5000M";
  if (eventName.includes("10000") && eventName.includes("M")) return "10000M";

  // Płotki (obsługa polskich i angielskich nazw)
  if (
    eventName.includes("110") &&
    (eventName.includes("H") ||
      eventName.includes("PŁ") ||
      eventName.includes("PŁOT"))
  )
    return "110MH";
  if (
    eventName.includes("100") &&
    (eventName.includes("H") ||
      eventName.includes("PŁ") ||
      eventName.includes("PŁOT"))
  )
    return "100MH";
  if (
    eventName.includes("400") &&
    (eventName.includes("H") ||
      eventName.includes("PŁ") ||
      eventName.includes("PŁOT"))
  )
    return "400MH";
  if (
    eventName.includes("80") &&
    (eventName.includes("H") ||
      eventName.includes("PŁ") ||
      eventName.includes("PŁOT"))
  )
    return "80MH";

  // Biegi specjalne
  if (eventName.includes("600") && eventName.includes("M")) return "600M";
  if (eventName.includes("1000") && eventName.includes("M")) return "1000M";
  if (eventName.includes("3000") && eventName.includes("SC")) return "3000MSC";

  // Skoki
  if (eventName.includes("LONG") || eventName.includes("SKOK W DAL"))
    return "LJ";
  if (eventName.includes("HIGH") || eventName.includes("SKOK WZWYŻ"))
    return "HJ";
  if (eventName.includes("POLE") || eventName.includes("SKOK O TYCZCE"))
    return "PV";
  if (eventName.includes("TRIPLE") || eventName.includes("TRÓJSKOK"))
    return "TJ";

  // Rzuty
  if (eventName.includes("SHOT") || eventName.includes("PCHNIĘCIE KULĄ")) {
    if (eventName.includes("3KG") || eventName.includes("3 KG")) return "SP3";
    if (eventName.includes("5KG") || eventName.includes("5 KG")) return "SP5";
    return "SP";
  }
  if (eventName.includes("DISCUS") || eventName.includes("RZUT DYSKIEM"))
    return "DT";
  if (eventName.includes("HAMMER") || eventName.includes("RZUT MŁOTEM"))
    return "HT";
  if (eventName.includes("JAVELIN") || eventName.includes("RZUT OSZCZEPEM"))
    return "JT";

  // Wieloboje
  if (eventName.includes("PENTATHLON") || eventName.includes("PIĘCIOBÓJ"))
    return "PEN";
  if (eventName.includes("HEPTATHLON") || eventName.includes("SIEDMIOBÓJ"))
    return "HEP";
  if (eventName.includes("DECATHLON") || eventName.includes("DZIESIĘCIOBÓJ"))
    return "DEC";

  // Fallback - zwróć oryginalną nazwę
  console.log(`⚠️  No mapping found for: ${eventName}`);
  return eventName;
}

// Test cases
const testEvents = [
  { name: "100 m pł kobiet" },
  { name: "100 m płotki kobiet" },
  { name: "100m hurdles women" },
  { name: "110 m pł mężczyzn" },
  { name: "100 m kobiet" },
  { name: "200 m kobiet" },
];

console.log("🧪 Testing getEventNameForRecords function:");
testEvents.forEach((event) => {
  const result = getEventNameForRecords(event);
  console.log(`   "${event.name}" -> "${result}"`);
});

// Test specific case
console.log("\n🎯 Specific test for Anna LOZOVYTSKA event:");
const annaEvent = { name: "100 m pł kobiet" };
const annaResult = getEventNameForRecords(annaEvent);
console.log(`   "${annaEvent.name}" -> "${annaResult}"`);

// Check what's in the name
const eventName = annaEvent.name.toUpperCase();
console.log(`\n🔍 Detailed analysis:`);
console.log(`   Original: "${annaEvent.name}"`);
console.log(`   Uppercase: "${eventName}"`);
console.log(`   Contains '100': ${eventName.includes("100")}`);
console.log(`   Contains 'M': ${eventName.includes("M")}`);
console.log(`   Contains 'H': ${eventName.includes("H")}`);
console.log(`   Contains 'PŁ': ${eventName.includes("PŁ")}`);
console.log(`   Contains 'PŁOT': ${eventName.includes("PŁOT")}`);

// Test the condition
const condition100MH =
  eventName.includes("100") &&
  (eventName.includes("H") ||
    eventName.includes("PŁ") ||
    eventName.includes("PŁOT"));
console.log(`   100MH condition: ${condition100MH}`);

const condition100M =
  eventName.includes("100") &&
  eventName.includes("M") &&
  !eventName.includes("H");
console.log(`   100M condition: ${condition100M}`);
