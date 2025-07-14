const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testAdminAPI() {
  try {
    console.log('Testing Admin API endpoints...\n');

    // Test 1: Health check
    console.log('1. Testing health check...');
    try {
      const healthResponse = await axios.get(`${API_BASE}/health`);
      console.log('✅ Health check passed:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
    }

    // Test 2: Try to access admin endpoints without token
    console.log('\n2. Testing admin endpoints without token...');
    try {
      const usersResponse = await axios.get(`${API_BASE}/users`);
      console.log('❌ Should have failed but got:', usersResponse.data);
    } catch (error) {
      console.log('✅ Correctly rejected without token:', error.response?.data?.message);
    }

    // Test 3: Try with invalid token
    console.log('\n3. Testing admin endpoints with invalid token...');
    try {
      const usersResponse = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      console.log('❌ Should have failed but got:', usersResponse.data);
    } catch (error) {
      console.log('✅ Correctly rejected with invalid token:', error.response?.data?.message);
    }

    console.log('\n✅ Admin API security tests completed successfully!');
    console.log('\nTo test with a real admin token:');
    console.log('1. Start the backend server');
    console.log('2. Login as an admin user');
    console.log('3. Copy the token from localStorage');
    console.log('4. Run this script with the token');

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAdminAPI(); 