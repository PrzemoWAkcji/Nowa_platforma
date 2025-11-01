const axios = require('axios');

async function testEventCreation() {
  const baseURL = 'http://localhost:3002';
  
  // First, let's get a competition ID
  try {
    console.log('🔍 Getting competitions...');
    const competitionsResponse = await axios.get(`${baseURL}/competitions`);
    const competitions = competitionsResponse.data;
    
    if (competitions.length === 0) {
      console.log('❌ No competitions found. Please create a competition first.');
      return;
    }
    
    const competitionId = competitions[0].id;
    console.log('✅ Using competition:', competitions[0].name, 'ID:', competitionId);
    
    // Test event creation with scheduledTime
    const eventData = {
      name: "Test Event with Scheduled Time",
      type: "TRACK",
      gender: "MALE",
      category: "SENIOR",
      unit: "TIME",
      competitionId: competitionId,
      maxParticipants: 50,
      seedTimeRequired: false,
      discipline: "sprint",
      distance: "100m",
      scheduledTime: "2025-07-12T15:30" // This should now work with our fix
    };
    
    console.log('📝 Creating event with data:', JSON.stringify(eventData, null, 2));
    
    const response = await axios.post(`${baseURL}/events`, eventData);
    console.log('✅ Event created successfully!');
    console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    
    // Test with full ISO format as well
    const eventData2 = {
      name: "Test Event with Full ISO Time",
      type: "FIELD",
      gender: "FEMALE",
      category: "U18",
      unit: "DISTANCE",
      competitionId: competitionId,
      maxParticipants: 30,
      seedTimeRequired: false,
      discipline: "jump",
      distance: "long jump",
      scheduledTime: "2025-07-12T16:45:00" // Full format
    };
    
    console.log('📝 Creating second event with full ISO format...');
    const response2 = await axios.post(`${baseURL}/events`, eventData2);
    console.log('✅ Second event created successfully!');
    console.log('📊 Response:', JSON.stringify(response2.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📋 Response data:', error.response.data);
    }
    if (error.code) {
      console.error('📋 Error code:', error.code);
    }
  }
}

testEventCreation();