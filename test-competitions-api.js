const axios = require("axios");

async function testCompetitionsAPI() {
  try {
    console.log("🔍 Testing competitions API...");

    const response = await axios.get(
      "http://localhost:3001/competitions/public"
    );

    console.log("✅ API Response Status:", response.status);
    console.log("📊 Number of competitions:", response.data.length);
    console.log("📋 Competitions data:");

    response.data.forEach((comp, index) => {
      console.log(`\n${index + 1}. ${comp.name}`);
      console.log(`   ID: ${comp.id}`);
      console.log(`   Location: ${comp.location}`);
      console.log(`   Status: ${comp.status}`);
      console.log(`   Start Date: ${comp.startDate}`);
      console.log(`   Public: ${comp.isPublic}`);
      console.log(`   Registrations: ${comp._count?.registrations || 0}`);
    });
  } catch (error) {
    console.error("❌ Error testing API:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

testCompetitionsAPI();
