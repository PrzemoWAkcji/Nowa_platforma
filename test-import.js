const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function testImport() {
  try {
    // Read the CSV file
    const csvContent = fs.readFileSync("2025-07-19_WARS.csv");

    // Create form data
    const formData = new FormData();
    formData.append("file", csvContent, {
      filename: "2025-07-19_WARS.csv",
      contentType: "text/csv",
    });
    formData.append("format", "pzla");
    formData.append("updateExisting", "false");
    formData.append("createMissingAthletes", "true");

    // Make the request
    const response = await axios.post(
      "http://localhost:3001/competitions/test-competition-id/import-startlist",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: "Bearer test-token", // You'll need a real token
        },
      }
    );

    console.log("✅ Import successful:", response.data);
  } catch (error) {
    console.error("❌ Import failed:", error.response?.data || error.message);
  }
}

testImport();
