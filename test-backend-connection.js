// Test script to check backend connection and profile endpoints
import axios from 'axios';

async function testBackendConnection() {
  try {
    console.log('Testing backend connection...\n');

    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:5001/api/health');
    console.log('✅ Health check passed:', healthResponse.data);

    // Test profiles endpoint
    console.log('\n2. Testing profiles endpoint...');
    const profilesResponse = await axios.get('http://localhost:5001/api/profiles');
    console.log('✅ Profiles endpoint accessible:', profilesResponse.status);
    console.log('Profiles found:', profilesResponse.data.profiles?.length || 0);

    // Test with a sample profile ID (this will fail but shows the endpoint is working)
    console.log('\n3. Testing profile by ID endpoint...');
    try {
      await axios.get('http://localhost:5001/api/profiles/test-id');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Profile by ID endpoint working (404 expected for invalid ID)');
      } else {
        console.log('❌ Profile by ID endpoint error:', error.response?.status);
      }
    }

    console.log('\n✅ Backend connection test completed successfully!');
    console.log('The backend is running and profile endpoints are accessible.');

  } catch (error) {
    console.error('❌ Backend connection test failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n🔧 Troubleshooting:');
      console.error('1. Make sure the backend server is running');
      console.error('2. Check if the server is running on port 5001');
      console.error('3. Run: cd backend && node server.js');
    }
  }
}

// Run the test
testBackendConnection(); 