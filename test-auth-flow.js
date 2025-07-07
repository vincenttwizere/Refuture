// Test script to verify authentication flow
// This script tests the login flow for users with and without profiles

const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function testAuthFlow() {
  console.log('Testing authentication flow...\n');

  try {
    // Test 1: Login with a refugee user who has a profile
    console.log('Test 1: Refugee user with profile');
    const loginResponse1 = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'refugee@test.com',
      password: 'password123'
    });
    
    console.log('Login response:', {
      success: loginResponse1.data.success,
      redirectTo: loginResponse1.data.redirectTo,
      hasProfile: loginResponse1.data.user.hasProfile
    });

    // Test 2: Login with a refugee user who doesn't have a profile
    console.log('\nTest 2: Refugee user without profile');
    const loginResponse2 = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'newrefugee@test.com',
      password: 'password123'
    });
    
    console.log('Login response:', {
      success: loginResponse2.data.success,
      redirectTo: loginResponse2.data.redirectTo,
      hasProfile: loginResponse2.data.user.hasProfile
    });

  } catch (error) {
    console.error('Error testing auth flow:', error.response?.data || error.message);
  }
}

// Run the test
testAuthFlow(); 