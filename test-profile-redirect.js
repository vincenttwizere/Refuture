import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api';

async function testProfileRedirectFlow() {
  console.log('🧪 Testing Profile Creation and Redirect Flow...\n');

  try {
    // Step 1: Create a test user
    console.log('1. Creating test user...');
    const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, {
      email: `test-redirect-${Date.now()}@example.com`,
      password: 'testpass123',
      firstName: 'Test',
      lastName: 'User',
      role: 'refugee'
    });

    const { token, user } = signupResponse.data;
    console.log('✅ User created successfully');
    console.log('   User ID:', user._id);
    console.log('   Has Profile:', user.hasProfile);
    console.log('   Redirect To:', signupResponse.data.redirectTo);

    // Step 2: Check user data via /me endpoint
    console.log('\n2. Checking user data via /me endpoint...');
    const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ User data retrieved');
    console.log('   Has Profile:', meResponse.data.user.hasProfile);
    console.log('   Redirect To:', meResponse.data.redirectTo);

    // Step 3: Create a profile
    console.log('\n3. Creating profile...');
    const profileData = new FormData();
    profileData.append('option', 'student');
    profileData.append('fullName', 'Test User');
    profileData.append('age', '25');
    profileData.append('gender', 'male');
    profileData.append('nationality', 'Syrian');
    profileData.append('currentLocation', 'Berlin, Germany');
    profileData.append('email', user.email);
    profileData.append('skills', JSON.stringify(['JavaScript', 'React']));
    profileData.append('language', JSON.stringify(['Arabic', 'English']));
    profileData.append('education', JSON.stringify([]));
    profileData.append('experience', JSON.stringify([]));
    profileData.append('isPublic', 'true');

    const profileResponse = await axios.post(`${BASE_URL}/profiles`, profileData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('✅ Profile created successfully');
    console.log('   Profile ID:', profileResponse.data.profile._id);

    // Step 4: Check user data again after profile creation
    console.log('\n4. Checking user data after profile creation...');
    const meResponse2 = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ User data updated');
    console.log('   Has Profile:', meResponse2.data.user.hasProfile);
    console.log('   Redirect To:', meResponse2.data.redirectTo);

    // Step 5: Verify the profile exists
    console.log('\n5. Verifying profile exists...');
    const profilesResponse = await axios.get(`${BASE_URL}/profiles?email=${user.email}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Profile verification complete');
    console.log('   Profiles found:', profilesResponse.data.profiles.length);
    console.log('   Profile email:', profilesResponse.data.profiles[0]?.email);

    // Summary
    console.log('\n📋 Test Summary:');
    console.log('   Initial hasProfile:', user.hasProfile);
    console.log('   Initial redirect:', signupResponse.data.redirectTo);
    console.log('   Final hasProfile:', meResponse2.data.user.hasProfile);
    console.log('   Final redirect:', meResponse2.data.redirectTo);
    console.log('   Profile created:', !!profileResponse.data.profile);
    console.log('   Profile in database:', profilesResponse.data.profiles.length > 0);

    if (meResponse2.data.user.hasProfile && meResponse2.data.redirectTo === '/refugee-dashboard') {
      console.log('\n🎉 SUCCESS: Profile creation and redirect flow works correctly!');
    } else {
      console.log('\n❌ FAILURE: Profile creation or redirect flow has issues');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testProfileRedirectFlow(); 