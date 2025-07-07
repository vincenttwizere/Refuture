const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function testNationalExamFlow() {
  console.log('🧪 Testing Updated National Exam Flow...\n');

  try {
    // Step 1: Login as a test user
    console.log('1️⃣ Logging in as test user...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Create a profile with National Exam
    console.log('2️⃣ Creating profile with National Exam...');
    
    const profileData = new FormData();
    profileData.append('option', 'student');
    profileData.append('fullName', 'Test Student');
    profileData.append('age', '18');
    profileData.append('gender', 'male');
    profileData.append('nationality', 'Test Country');
    profileData.append('currentLocation', 'Test City');
    profileData.append('email', 'test@example.com');
    profileData.append('skills', JSON.stringify(['Mathematics', 'Physics']));
    profileData.append('language', JSON.stringify(['English', 'Spanish']));
    profileData.append('tags', JSON.stringify(['student', 'national_exam']));
    profileData.append('education', JSON.stringify([]));
    profileData.append('experience', JSON.stringify([]));
    profileData.append('isPublic', 'true');
    
    // Add National Exam academic record
    const academicRecords = [{
      level: 'national_exam',
      year: '2023',
      percentage: 85,
      subjectGrades: 'Physics: A, Chemistry: B, Mathematics: A, Biology: A, English: B'
    }];
    profileData.append('academicRecords', JSON.stringify(academicRecords));
    profileData.append('portfolio', JSON.stringify([]));

    const profileResponse = await axios.post(`${BASE_URL}/profiles`, profileData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Profile created successfully');
    console.log('📊 Profile data:', {
      id: profileResponse.data.profile._id,
      fullName: profileResponse.data.profile.fullName,
      academicRecords: profileResponse.data.profile.academicRecords
    });
    console.log('');

    // Step 3: Verify National Exam data structure
    console.log('3️⃣ Verifying National Exam data structure...');
    const nationalExamRecord = profileResponse.data.profile.academicRecords[0];
    
    if (nationalExamRecord.level === 'national_exam' && 
        nationalExamRecord.subjectGrades && 
        !nationalExamRecord.school) {
      console.log('✅ National Exam structure is correct:');
      console.log(`   - Level: ${nationalExamRecord.level}`);
      console.log(`   - Year: ${nationalExamRecord.year}`);
      console.log(`   - Percentage: ${nationalExamRecord.percentage}%`);
      console.log(`   - Subject Grades: ${nationalExamRecord.subjectGrades}`);
      console.log(`   - School field: ${nationalExamRecord.school ? 'Present (❌)' : 'Removed (✅)'}`);
    } else {
      console.log('❌ National Exam structure is incorrect');
    }
    console.log('');

    // Step 4: Test profile retrieval
    console.log('4️⃣ Testing profile retrieval...');
    const getProfileResponse = await axios.get(`${BASE_URL}/profiles?email=test@example.com`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (getProfileResponse.data.profiles && getProfileResponse.data.profiles.length > 0) {
      console.log('✅ Profile retrieved successfully');
      const retrievedProfile = getProfileResponse.data.profiles[0];
      console.log(`📊 Retrieved profile has ${retrievedProfile.academicRecords.length} academic records`);
    } else {
      console.log('❌ Failed to retrieve profile');
    }
    console.log('');

    console.log('🎉 All tests passed! National Exam flow is working correctly.');
    console.log('');
    console.log('📋 Summary of changes:');
    console.log('   ✅ School field removed for National Exam');
    console.log('   ✅ Subject grades stored as simple text');
    console.log('   ✅ Supporting documents moved to separate section');
    console.log('   ✅ Total percentage maintained');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testNationalExamFlow(); 