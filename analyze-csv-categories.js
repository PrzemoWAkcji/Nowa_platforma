const fs = require("fs");

function analyzeCsvCategories() {
  console.log("📊 Analyzing CSV file for age categories in events");

  const csvContent = fs.readFileSync("2025-07-19_WARS.csv", "utf-8");
  const lines = csvContent.split("\n");

  // Skip header
  const dataLines = lines.slice(1).filter((line) => line.trim());

  const eventStats = {};

  dataLines.forEach((line) => {
    const fields = line.split(";");
    if (fields.length > 11) {
      const eventName = fields[3]?.trim();
      const firstName = fields[10]?.trim();
      const lastName = fields[9]?.trim();
      const birthDate = fields[11]?.trim();

      if (eventName && firstName && lastName && birthDate) {
        if (!eventStats[eventName]) {
          eventStats[eventName] = {
            athletes: [],
            ageGroups: new Set(),
          };
        }

        const birthYear = parseInt(birthDate.split("-")[0]);
        const age = 2025 - birthYear;

        // Determine age category
        let category = "SENIOR";
        if (age <= 14) category = "U14";
        else if (age <= 16) category = "U16";
        else if (age <= 18) category = "U18";
        else if (age <= 20) category = "U20";
        else if (age <= 23) category = "U23";
        else if (age >= 35 && age < 40) category = "M35";
        else if (age >= 40 && age < 45) category = "M40";
        else if (age >= 45 && age < 50) category = "M45";
        else if (age >= 50 && age < 55) category = "M50";
        else if (age >= 55) category = "M55+";

        eventStats[eventName].athletes.push({
          name: `${firstName} ${lastName}`,
          birthYear,
          age,
          category,
        });

        eventStats[eventName].ageGroups.add(category);
      }
    }
  });

  console.log("\n🏃‍♀️ Events and their age category distribution:");

  Object.entries(eventStats).forEach(([eventName, stats]) => {
    console.log(`\n📍 ${eventName}`);
    console.log(`   Total athletes: ${stats.athletes.length}`);
    console.log(`   Age categories: ${Array.from(stats.ageGroups).join(", ")}`);

    // Show age distribution
    const categoryCount = {};
    stats.athletes.forEach((athlete) => {
      categoryCount[athlete.category] =
        (categoryCount[athlete.category] || 0) + 1;
    });

    console.log("   Distribution:");
    Object.entries(categoryCount).forEach(([cat, count]) => {
      console.log(`     ${cat}: ${count} athletes`);
    });

    // Show some examples
    console.log("   Examples:");
    stats.athletes.slice(0, 3).forEach((athlete) => {
      console.log(
        `     ${athlete.name} (${athlete.birthYear}, age ${athlete.age}, ${athlete.category})`
      );
    });
  });

  console.log("\n🔧 PROBLEM BEFORE FIX:");
  console.log("- Each age category would create a SEPARATE event");
  console.log("- '100 metrów kobiet' would become multiple events:");
  Object.entries(eventStats).forEach(([eventName, stats]) => {
    if (stats.ageGroups.size > 1) {
      console.log(`  - ${eventName}:`);
      Array.from(stats.ageGroups).forEach((cat) => {
        console.log(`    * ${eventName} (${cat})`);
      });
    }
  });

  console.log("\n✅ SOLUTION AFTER FIX:");
  console.log("- All athletes in same event name go to ONE event");
  console.log("- Event category set to 'WIELE' (multiple categories)");
  console.log("- Individual athlete categories preserved");
  console.log("- Results can be filtered/grouped by category when displayed");
}

analyzeCsvCategories();
