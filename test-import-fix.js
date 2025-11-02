const fs = require("fs");
const path = require("path");

// Test script to verify the CSV import fix
async function testImportFix() {
  console.log(
    "🧪 Testing CSV Import Fix - Multiple Age Categories in Single Event"
  );

  // Read the CSV file
  const csvPath = path.join(__dirname, "2025-07-19_WARS.csv");
  const csvContent = fs.readFileSync(csvPath, "utf-8");

  // Parse first few lines to show the issue
  const lines = csvContent.split("\n").slice(0, 10);

  console.log("\n📊 Sample data from CSV:");
  console.log("Event: K100 m (100 metrów kobiet)");
  console.log(
    "Athletes with different birth years (different age categories):"
  );

  lines.forEach((line, index) => {
    if (index === 0) {
      console.log("Headers:", line.split(";").slice(0, 12).join(" | "));
      return;
    }

    const fields = line.split(";");
    if (fields.length > 11) {
      const eventCode = fields[1];
      const eventName = fields[3];
      const lastName = fields[9];
      const firstName = fields[10];
      const birthDate = fields[11];

      if (eventCode === "2" && lastName && firstName) {
        const birthYear = birthDate ? birthDate.split("-")[0] : "N/A";
        const age = birthYear !== "N/A" ? 2025 - parseInt(birthYear) : "N/A";

        console.log(
          `${firstName} ${lastName} | Born: ${birthYear} | Age: ${age}`
        );
      }
    }
  });

  console.log("\n✅ Expected behavior after fix:");
  console.log(
    '- All athletes should be imported into ONE event: "100 metrów kobiet"'
  );
  console.log(
    '- Event category should be set to "WIELE" (multiple categories)'
  );
  console.log("- Individual athlete categories determined by birth date");
  console.log("- No separate events created for each age category");

  console.log("\n🔧 Changes made:");
  console.log(
    "1. Modified findOrCreateEvent() to NOT include category in search criteria"
  );
  console.log("2. Set default event category to Category.WIELE");
  console.log("3. Athletes keep their individual categories based on age");

  console.log("\n📝 To test this fix:");
  console.log("1. Start the backend server: npm run start:dev");
  console.log("2. Create a competition");
  console.log("3. Import the CSV file");
  console.log('4. Verify only ONE "100 metrów kobiet" event is created');
  console.log("5. Check that all athletes are registered to the same event");
}

testImportFix().catch(console.error);
