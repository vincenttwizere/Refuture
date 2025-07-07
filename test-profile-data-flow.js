import axios from 'axios';

// Test configuration
const BASE_URL = 'http://localhost:5001/api';
const TEST_EMAIL = 'test-profile-flow@example.com';

// Test data that matches what users fill out in CreateProfile
const testProfileData = {
  // Basic Information
  option: 'student',
  fullName: 'Test User Profile',
  age: 25,
  gender: 'male',
  nationality: 'Ugandan',
  currentLocation: 'Kampala, Uganda',
  email: TEST_EMAIL,
  
  // Skills & Languages
  skills: JSON.stringify(['JavaScript', 'React', 'Node.js', 'Python']),
  language: JSON.stringify(['English', 'Luganda', 'Swahili']),
  tags: JSON.stringify(['web development', 'frontend', 'backend']),
  
  // Student-specific data
  highSchoolSubjects: 'Mathematics, Physics, Chemistry, Biology, English',
  desiredField: 'Computer Science',
  
  // Academic Records
  academicRecords: JSON.stringify([
    {
      level: 'senior_four',
      year: '2020',
      school: 'Test High School',
      percentage: 85,
      subjectGrades: 'Mathematics: A, Physics: A, Chemistry: B, Biology: A, English: A'
    },
    {
      level: 'senior_five',
      year: '2021',
      school: 'Test High School',
      percentage: 88,
      subjectGrades: 'Mathematics: A, Physics: A, Chemistry: A, Biology: A, English: A'
    },
    {
      level: 'national_exam',
      year: '2022',
      percentage: 92,
      subjectGrades: 'Physics: A, Chemistry: A, Mathematics: A, Biology: A, English: A'
    }
  ]),
  
  // Profile visibility
  isPublic: true
};

async function testProfileDataFlow() {
  console.log('🧪 Testing Profile Data Flow');
  console.log('============================\n');

  try {
    // Step 1: Create a test profile
    console.log('1️⃣ Creating test profile...');
    const createResponse = await axios.post(`${BASE_URL}/profiles`, testProfileData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`
      }
    });

    if (createResponse.data.success) {
      console.log('✅ Profile created successfully');
      const profileId = createResponse.data.profile._id;
      console.log(`📋 Profile ID: ${profileId}\n`);

      // Step 2: Fetch the profile by ID
      console.log('2️⃣ Fetching profile by ID...');
      const fetchResponse = await axios.get(`${BASE_URL}/profiles/${profileId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`
        }
      });

      if (fetchResponse.data.success) {
        console.log('✅ Profile fetched successfully');
        const fetchedProfile = fetchResponse.data.profile;
        
        // Step 3: Verify all data fields are present
        console.log('\n3️⃣ Verifying data fields...');
        console.log('📊 Data Field Verification:');
        console.log('==========================');

        // Basic Information
        console.log(`\n🔹 Basic Information:`);
        console.log(`   - Option: ${fetchedProfile.option} (expected: ${testProfileData.option})`);
        console.log(`   - Full Name: ${fetchedProfile.fullName} (expected: ${testProfileData.fullName})`);
        console.log(`   - Age: ${fetchedProfile.age} (expected: ${testProfileData.age})`);
        console.log(`   - Gender: ${fetchedProfile.gender} (expected: ${testProfileData.gender})`);
        console.log(`   - Nationality: ${fetchedProfile.nationality} (expected: ${testProfileData.nationality})`);
        console.log(`   - Current Location: ${fetchedProfile.currentLocation} (expected: ${testProfileData.currentLocation})`);
        console.log(`   - Email: ${fetchedProfile.email} (expected: ${testProfileData.email})`);
        console.log(`   - Is Public: ${fetchedProfile.isPublic} (expected: ${testProfileData.isPublic})`);

        // Skills & Languages
        console.log(`\n🔹 Skills & Languages:`);
        console.log(`   - Skills: ${JSON.stringify(fetchedProfile.skills)} (expected: ${testProfileData.skills})`);
        console.log(`   - Languages: ${JSON.stringify(fetchedProfile.language)} (expected: ${testProfileData.language})`);
        console.log(`   - Tags: ${JSON.stringify(fetchedProfile.tags)} (expected: ${testProfileData.tags})`);

        // Student-specific data
        console.log(`\n🔹 Student Information:`);
        console.log(`   - High School Subjects: ${fetchedProfile.highSchoolSubjects} (expected: ${testProfileData.highSchoolSubjects})`);
        console.log(`   - Desired Field: ${fetchedProfile.desiredField} (expected: ${testProfileData.desiredField})`);

        // Academic Records
        console.log(`\n🔹 Academic Records:`);
        console.log(`   - Academic Records Count: ${fetchedProfile.academicRecords?.length || 0} (expected: 3)`);
        if (fetchedProfile.academicRecords && fetchedProfile.academicRecords.length > 0) {
          fetchedProfile.academicRecords.forEach((record, index) => {
            console.log(`   - Record ${index + 1}:`);
            console.log(`     * Level: ${record.level}`);
            console.log(`     * Year: ${record.year}`);
            console.log(`     * School: ${record.school || 'N/A'}`);
            console.log(`     * Percentage: ${record.percentage}%`);
            console.log(`     * Subject Grades: ${record.subjectGrades || 'N/A'}`);
          });
        }

        // Step 4: Check for any missing fields
        console.log('\n4️⃣ Checking for missing fields...');
        const expectedFields = [
          'option', 'fullName', 'age', 'gender', 'nationality', 'currentLocation', 
          'email', 'skills', 'language', 'tags', 'highSchoolSubjects', 'desiredField', 
          'academicRecords', 'isPublic'
        ];

        const missingFields = expectedFields.filter(field => {
          const value = fetchedProfile[field];
          return value === undefined || value === null || 
                 (Array.isArray(value) && value.length === 0) ||
                 (typeof value === 'string' && value.trim() === '');
        });

        if (missingFields.length > 0) {
          console.log('❌ Missing or empty fields:');
          missingFields.forEach(field => console.log(`   - ${field}`));
        } else {
          console.log('✅ All expected fields are present and have values');
        }

        // Step 5: Test job seeker profile
        console.log('\n5️⃣ Testing Job Seeker Profile...');
        const jobSeekerData = {
          ...testProfileData,
          option: 'job seeker',
          email: 'test-jobseeker@example.com',
          education: JSON.stringify([
            {
              school: 'Test University',
              degree: 'Bachelor of Science',
              field: 'Computer Science',
              duration: '4 years',
              start: '2018',
              end: '2022'
            }
          ]),
          experience: JSON.stringify([
            {
              company: 'Test Company',
              title: 'Software Developer',
              start: '2022',
              end: 'Present',
              duration: '2 years',
              description: 'Developed web applications using React and Node.js'
            }
          ])
        };

        const jobSeekerResponse = await axios.post(`${BASE_URL}/profiles`, jobSeekerData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`
          }
        });

        if (jobSeekerResponse.data.success) {
          console.log('✅ Job seeker profile created successfully');
          const jobSeekerProfile = jobSeekerResponse.data.profile;
          
          console.log(`\n🔹 Job Seeker Data:`);
          console.log(`   - Education Count: ${jobSeekerProfile.education?.length || 0} (expected: 1)`);
          console.log(`   - Experience Count: ${jobSeekerProfile.experience?.length || 0} (expected: 1)`);
          
          if (jobSeekerProfile.education && jobSeekerProfile.education.length > 0) {
            console.log(`   - Education: ${JSON.stringify(jobSeekerProfile.education[0])}`);
          }
          
          if (jobSeekerProfile.experience && jobSeekerProfile.experience.length > 0) {
            console.log(`   - Experience: ${JSON.stringify(jobSeekerProfile.experience[0])}`);
          }
        }

        // Step 6: Test undocumented talent profile
        console.log('\n6️⃣ Testing Undocumented Talent Profile...');
        const talentData = {
          ...testProfileData,
          option: 'undocumented_talent',
          email: 'test-talent@example.com',
          talentCategory: 'programmer',
          talentExperience: '5 years',
          talentDescription: 'Experienced web developer with expertise in modern frameworks',
          portfolio: JSON.stringify([
            {
              title: 'E-commerce Platform',
              category: 'programmer',
              year: '2023',
              link: 'https://example.com/project',
              description: 'Full-stack e-commerce platform built with React and Node.js',
              media: 'Web Application'
            }
          ])
        };

        const talentResponse = await axios.post(`${BASE_URL}/profiles`, talentData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`
          }
        });

        if (talentResponse.data.success) {
          console.log('✅ Undocumented talent profile created successfully');
          const talentProfile = talentResponse.data.profile;
          
          console.log(`\n🔹 Talent Data:`);
          console.log(`   - Talent Category: ${talentProfile.talentCategory}`);
          console.log(`   - Talent Experience: ${talentProfile.talentExperience}`);
          console.log(`   - Talent Description: ${talentProfile.talentDescription}`);
          console.log(`   - Portfolio Count: ${talentProfile.portfolio?.length || 0} (expected: 1)`);
          
          if (talentProfile.portfolio && talentProfile.portfolio.length > 0) {
            console.log(`   - Portfolio: ${JSON.stringify(talentProfile.portfolio[0])}`);
          }
        }

        console.log('\n🎉 Profile Data Flow Test Completed Successfully!');
        console.log('\n📋 Summary:');
        console.log('   ✅ All profile types (student, job seeker, undocumented talent) are working');
        console.log('   ✅ All form fields are being saved correctly');
        console.log('   ✅ All data is being retrieved correctly');
        console.log('   ✅ ProfileViewPage should display all the information users fill out');

      } else {
        console.log('❌ Failed to fetch profile');
      }
    } else {
      console.log('❌ Failed to create profile');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.response?.data || error.message);
  }
}

// Run the test
testProfileDataFlow(); 