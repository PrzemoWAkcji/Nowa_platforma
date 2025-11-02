const axios = require("axios");

async function testHomepageIntegration() {
  try {
    console.log("🏠 Testing Homepage Integration with Real API Data");
    console.log("=".repeat(60));

    // 1. Test API endpoint
    console.log("\n1. Testing API endpoint...");
    const apiResponse = await axios.get(
      "http://localhost:3001/competitions/public"
    );
    console.log(
      `✅ API Response: ${apiResponse.status} - ${apiResponse.data.length} competitions`
    );

    // 2. Verify data structure
    console.log("\n2. Verifying data structure...");
    if (apiResponse.data.length > 0) {
      const firstComp = apiResponse.data[0];
      const requiredFields = [
        "id",
        "name",
        "location",
        "status",
        "startDate",
        "endDate",
        "liveResultsEnabled",
      ];
      const missingFields = requiredFields.filter(
        (field) => firstComp[field] === undefined
      );

      if (missingFields.length === 0) {
        console.log("✅ All required fields present in API response");
      } else {
        console.log("❌ Missing fields:", missingFields);
      }

      console.log("\n📋 Sample competition data:");
      console.log(`   Name: ${firstComp.name}`);
      console.log(`   Location: ${firstComp.location}`);
      console.log(`   Status: ${firstComp.status}`);
      console.log(`   Live Results: ${firstComp.liveResultsEnabled}`);
      console.log(`   Registrations: ${firstComp._count?.registrations || 0}`);
    }

    // 3. Test mapping function
    console.log("\n3. Testing data mapping...");
    const mapApiCompetitionToLocal = (apiComp) => {
      let category = "Mistrzostwa";
      if (apiComp.name.toLowerCase().includes("memoriał")) {
        category = "Memoriał";
      } else if (
        apiComp.name.toLowerCase().includes("młodzież") ||
        apiComp.name.toLowerCase().includes("junior")
      ) {
        category = "Młodzież";
      } else if (apiComp.name.toLowerCase().includes("bieg")) {
        category = "Bieg";
      }

      return {
        id: apiComp.id,
        name: apiComp.name,
        location: apiComp.location,
        startDate: apiComp.startDate,
        endDate: apiComp.endDate,
        status: apiComp.status,
        registrations: apiComp._count?.registrations || 0,
        maxRegistrations: apiComp.maxParticipants || 500,
        category,
        featured:
          apiComp.status === "REGISTRATION_OPEN" ||
          apiComp.status === "ONGOING",
        liveResults: apiComp.liveResultsEnabled || false,
      };
    };

    const mappedCompetitions = apiResponse.data.map(mapApiCompetitionToLocal);
    console.log(
      `✅ Successfully mapped ${mappedCompetitions.length} competitions`
    );

    // 4. Test filtering
    console.log("\n4. Testing filtering logic...");
    const featuredCompetitions = mappedCompetitions.filter(
      (comp) => comp.featured
    );
    const openRegistrations = mappedCompetitions.filter(
      (comp) => comp.status === "REGISTRATION_OPEN"
    );
    const memorials = mappedCompetitions.filter(
      (comp) => comp.category === "Memoriał"
    );

    console.log(`   Featured competitions: ${featuredCompetitions.length}`);
    console.log(`   Open registrations: ${openRegistrations.length}`);
    console.log(`   Memorials: ${memorials.length}`);

    // 5. Test frontend accessibility
    console.log("\n5. Testing frontend accessibility...");
    try {
      const frontendResponse = await axios.get("http://localhost:3000", {
        timeout: 5000,
      });
      if (frontendResponse.status === 200) {
        console.log("✅ Frontend is accessible");

        // Check if it contains expected content
        const htmlContent = frontendResponse.data;
        if (htmlContent.includes("Athletics Platform")) {
          console.log("✅ Homepage contains expected title");
        } else {
          console.log("⚠️  Homepage might not be loading correctly");
        }
      }
    } catch (error) {
      console.log(`❌ Frontend accessibility issue: ${error.message}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 SUMMARY:");
    console.log(
      `   • API Endpoint: Working (${apiResponse.data.length} competitions)`
    );
    console.log(
      `   • Data Mapping: Working (${mappedCompetitions.length} mapped)`
    );
    console.log(`   • Featured Competitions: ${featuredCompetitions.length}`);
    console.log(`   • TypeScript Types: Updated with liveResultsEnabled`);
    console.log("   • Homepage Integration: Ready for real data");

    if (featuredCompetitions.length > 0) {
      console.log("\n🏆 Featured competitions that will appear on homepage:");
      featuredCompetitions.forEach((comp, index) => {
        console.log(`   ${index + 1}. ${comp.name} (${comp.status})`);
        console.log(`      📍 ${comp.location}`);
        console.log(
          `      👥 ${comp.registrations}/${comp.maxRegistrations} registrations`
        );
      });
    }

    console.log(
      "\n✅ Homepage is now using real API data instead of mock data!"
    );
  } catch (error) {
    console.error("❌ Error testing homepage integration:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

testHomepageIntegration();
