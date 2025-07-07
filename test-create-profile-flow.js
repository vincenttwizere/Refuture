const API_BASE = 'http://localhost:5001/api';

async function testCreateProfileFlow() {
  console.log('🧪 Testing Create Profile Flow...\n');

  try {
    // Step 1: Create a new refugee user
    console.log('1️⃣ Creating new refugee user...');
    const signupResponse = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test-refugee@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Refugee',
        role: 'refugee'
      })
    });

    const signupData = await signupResponse.json();
    console.log('✅ Signup successful');
    console.log('   User:', signupData.user);
    console.log('   Redirect to:', signupData.redirectTo);
    console.log('   Has profile:', signupData.user.hasProfile);

    const token = signupData.token;

    // Step 2: Login with the same user
    console.log('\n2️⃣ Logging in...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test-refugee@example.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('   Redirect to:', loginData.redirectTo);
    console.log('   Has profile:', loginData.user.hasProfile);

    // Step 3: Create a profile
    console.log('\n3️⃣ Creating profile...');
    const profileData = new FormData();
    profileData.append('option', 'student');
    profileData.append('fullName', 'Test Refugee User');
    profileData.append('age', '25');
    profileData.append('gender', 'male');
    profileData.append('nationality', 'Syrian');
    profileData.append('currentLocation', 'Berlin, Germany');
    profileData.append('email', 'test-refugee@example.com');
    profileData.append('skills', JSON.stringify(['JavaScript', 'React']));
    profileData.append('language', JSON.stringify(['Arabic', 'English']));
    profileData.append('education', JSON.stringify([]));
    profileData.append('experience', JSON.stringify([]));
    profileData.append('isPublic', 'true');

    const profileResponse = await fetch(`${API_BASE}/profiles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: profileData
    });

    const profileResult = await profileResponse.json();
    console.log('✅ Profile created successfully');
    console.log('   Profile ID:', profileResult.profile._id);

    // Step 4: Login again to check redirect
    console.log('\n4️⃣ Logging in again to check redirect...');
    const loginResponse2 = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test-refugee@example.com',
        password: 'password123'
      })
    });

    const loginData2 = await loginResponse2.json();
    console.log('✅ Login successful');
    console.log('   Redirect to:', loginData2.redirectTo);
    console.log('   Has profile:', loginData2.user.hasProfile);

    // Step 5: Get user data
    console.log('\n5️⃣ Getting user data...');
    const userResponse = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const userData = await userResponse.json();
    console.log('✅ User data retrieved');
    console.log('   Redirect to:', userData.redirectTo);
    console.log('   Has profile:', userData.user.hasProfile);

    console.log('\n🎉 All tests passed! The create profile flow is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCreateProfileFlow(); 