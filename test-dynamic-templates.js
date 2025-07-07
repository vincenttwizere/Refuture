import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api';

async function testDynamicTemplates() {
  console.log('🧪 Testing Dynamic Profile Templates...\n');

  try {
    // Test 1: Student Template
    console.log('1. Testing Student Template...');
    const studentUser = await axios.post(`${BASE_URL}/auth/signup`, {
      email: `student-test-${Date.now()}@example.com`,
      password: 'testpass123',
      firstName: 'Student',
      lastName: 'Test',
      role: 'refugee'
    });

    const studentToken = studentUser.data.token;
    
    const studentProfileData = new FormData();
    studentProfileData.append('option', 'student');
    studentProfileData.append('fullName', 'Student Test User');
    studentProfileData.append('age', '18');
    studentProfileData.append('gender', 'male');
    studentProfileData.append('nationality', 'Syrian');
    studentProfileData.append('currentLocation', 'Berlin, Germany');
    studentProfileData.append('email', studentUser.data.user.email);
    studentProfileData.append('skills', JSON.stringify(['Mathematics', 'Physics']));
    studentProfileData.append('language', JSON.stringify(['Arabic', 'English']));
    studentProfileData.append('highSchoolSubjects', 'Mathematics, Physics, Chemistry, Biology');
    studentProfileData.append('desiredField', 'Computer Science');
    studentProfileData.append('academicRecords', JSON.stringify([
      {
        level: 'senior_four',
        year: '2023',
        subjects: 'Math: A, Physics: A, Chemistry: B',
        grades: 'A',
        school: 'Test High School'
      }
    ]));
    studentProfileData.append('education', JSON.stringify([]));
    studentProfileData.append('experience', JSON.stringify([]));
    studentProfileData.append('portfolio', JSON.stringify([]));
    studentProfileData.append('isPublic', 'true');

    const studentProfile = await axios.post(`${BASE_URL}/profiles`, studentProfileData, {
      headers: { 
        Authorization: `Bearer ${studentToken}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('✅ Student profile created successfully');
    console.log('   High School Subjects:', studentProfile.data.profile.highSchoolSubjects);
    console.log('   Desired Field:', studentProfile.data.profile.desiredField);
    console.log('   Academic Records:', studentProfile.data.profile.academicRecords.length);

    // Test 2: Job Seeker Template
    console.log('\n2. Testing Job Seeker Template...');
    const jobSeekerUser = await axios.post(`${BASE_URL}/auth/signup`, {
      email: `jobseeker-test-${Date.now()}@example.com`,
      password: 'testpass123',
      firstName: 'Job',
      lastName: 'Seeker',
      role: 'refugee'
    });

    const jobSeekerToken = jobSeekerUser.data.token;
    
    const jobSeekerProfileData = new FormData();
    jobSeekerProfileData.append('option', 'job seeker');
    jobSeekerProfileData.append('fullName', 'Job Seeker Test User');
    jobSeekerProfileData.append('age', '25');
    jobSeekerProfileData.append('gender', 'female');
    jobSeekerProfileData.append('nationality', 'Ukrainian');
    jobSeekerProfileData.append('currentLocation', 'Warsaw, Poland');
    jobSeekerProfileData.append('email', jobSeekerUser.data.user.email);
    jobSeekerProfileData.append('skills', JSON.stringify(['JavaScript', 'React', 'Node.js']));
    jobSeekerProfileData.append('language', JSON.stringify(['Ukrainian', 'English', 'Polish']));
    jobSeekerProfileData.append('experience', JSON.stringify([
      {
        company: 'Tech Company',
        title: 'Software Developer',
        start: '2022',
        end: '2023',
        description: 'Developed web applications using React and Node.js'
      }
    ]));
    jobSeekerProfileData.append('education', JSON.stringify([]));
    jobSeekerProfileData.append('academicRecords', JSON.stringify([]));
    jobSeekerProfileData.append('portfolio', JSON.stringify([]));
    jobSeekerProfileData.append('isPublic', 'true');

    const jobSeekerProfile = await axios.post(`${BASE_URL}/profiles`, jobSeekerProfileData, {
      headers: { 
        Authorization: `Bearer ${jobSeekerToken}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('✅ Job Seeker profile created successfully');
    console.log('   Experience:', jobSeekerProfile.data.profile.experience.length);
    console.log('   Skills:', jobSeekerProfile.data.profile.skills);

    // Test 3: Undocumented Talent Template
    console.log('\n3. Testing Undocumented Talent Template...');
    const talentUser = await axios.post(`${BASE_URL}/auth/signup`, {
      email: `talent-test-${Date.now()}@example.com`,
      password: 'testpass123',
      firstName: 'Talent',
      lastName: 'Artist',
      role: 'refugee'
    });

    const talentToken = talentUser.data.token;
    
    const talentProfileData = new FormData();
    talentProfileData.append('option', 'undocumented_talent');
    talentProfileData.append('fullName', 'Talent Artist Test User');
    talentProfileData.append('age', '22');
    talentProfileData.append('gender', 'other');
    talentProfileData.append('nationality', 'Afghan');
    talentProfileData.append('currentLocation', 'Paris, France');
    talentProfileData.append('email', talentUser.data.user.email);
    talentProfileData.append('skills', JSON.stringify(['Painting', 'Digital Art', 'Portrait']));
    talentProfileData.append('language', JSON.stringify(['Dari', 'English', 'French']));
    talentProfileData.append('talentCategory', 'artist');
    talentProfileData.append('talentExperience', '5 years');
    talentProfileData.append('talentDescription', 'Passionate artist specializing in portrait painting and digital art');
    talentProfileData.append('portfolio', JSON.stringify([
      {
        title: 'Portrait Series',
        description: 'A collection of portraits showcasing cultural diversity',
        category: 'artist',
        year: '2023',
        link: 'https://example.com/portfolio'
      }
    ]));
    talentProfileData.append('education', JSON.stringify([]));
    talentProfileData.append('experience', JSON.stringify([]));
    talentProfileData.append('academicRecords', JSON.stringify([]));
    talentProfileData.append('isPublic', 'true');

    const talentProfile = await axios.post(`${BASE_URL}/profiles`, talentProfileData, {
      headers: { 
        Authorization: `Bearer ${talentToken}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('✅ Undocumented Talent profile created successfully');
    console.log('   Talent Category:', talentProfile.data.profile.talentCategory);
    console.log('   Talent Experience:', talentProfile.data.profile.talentExperience);
    console.log('   Portfolio Items:', talentProfile.data.profile.portfolio.length);

    // Summary
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Student template - Academic fields and records');
    console.log('   ✅ Job Seeker template - Work experience and skills');
    console.log('   ✅ Undocumented Talent template - Portfolio and talent info');
    console.log('\n🎉 SUCCESS: All dynamic templates work correctly!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testDynamicTemplates(); 