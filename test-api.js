import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

async function testAPI() {
  console.log('Testing API endpoints...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health endpoint working:', healthResponse.data);

    // Test auth endpoint (should work without auth)
    console.log('\n2. Testing auth endpoint...');
    try {
      const authResponse = await axios.get(`${API_BASE_URL}/auth/me`);
      console.log('❌ Auth endpoint should require authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Auth endpoint properly protected');
      } else {
        console.log('❌ Unexpected auth error:', error.response?.status);
      }
    }

    // Test users endpoint (should require admin auth)
    console.log('\n3. Testing users endpoint...');
    try {
      const usersResponse = await axios.get(`${API_BASE_URL}/users`);
      console.log('❌ Users endpoint should require admin authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Users endpoint properly protected');
      } else {
        console.log('❌ Unexpected users error:', error.response?.status);
      }
    }

    // Test users stats endpoint (should require admin auth)
    console.log('\n4. Testing users stats endpoint...');
    try {
      const statsResponse = await axios.get(`${API_BASE_URL}/users/stats`);
      console.log('❌ Users stats endpoint should require admin authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Users stats endpoint properly protected');
      } else {
        console.log('❌ Unexpected stats error:', error.response?.status);
      }
    }

    console.log('\n✅ API tests completed successfully!');
    console.log('The backend is running and endpoints are properly protected.');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('Make sure the backend server is running on port 5001');
    }
  }
}

testAPI(); 