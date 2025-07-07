const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testAdminProfiles() {
  try {
    console.log('🧪 Testing Admin Dashboard Profiles Functionality...\n');

    // 1. Test fetching all profiles
    console.log('1. Fetching all profiles...');
    const profilesResponse = await axios.get(`${API_BASE}/profiles`);
    const profiles = profilesResponse.data.profiles;
    
    console.log(`✅ Found ${profiles.length} profiles\n`);

    if (profiles.length > 0) {
      console.log('📋 Sample Profile Data:');
      const sampleProfile = profiles[0];
      console.log(`   - Name: ${sampleProfile.fullName}`);
      console.log(`   - Email: ${sampleProfile.email}`);
      console.log(`   - Type: ${sampleProfile.option}`);
      console.log(`   - Age: ${sampleProfile.age}`);
      console.log(`   - Location: ${sampleProfile.currentLocation}`);
      console.log(`   - Public: ${sampleProfile.isPublic ? 'Yes' : 'No'}`);
      console.log(`   - Created: ${new Date(sampleProfile.createdAt).toLocaleDateString()}`);
    }

    // 2. Test filtering profiles by type
    console.log('\n2. Testing profile filtering...');
    const studentProfiles = profiles.filter(p => p.option === 'student');
    const jobSeekerProfiles = profiles.filter(p => p.option === 'job seeker');
    const undocumentedProfiles = profiles.filter(p => p.option === 'undocumented talent');
    
    console.log(`   - Students: ${studentProfiles.length}`);
    console.log(`   - Job Seekers: ${jobSeekerProfiles.length}`);
    console.log(`   - Undocumented Talents: ${undocumentedProfiles.length}`);

    // 3. Test public vs private profiles
    console.log('\n3. Testing profile visibility...');
    const publicProfiles = profiles.filter(p => p.isPublic);
    const privateProfiles = profiles.filter(p => !p.isPublic);
    
    console.log(`   - Public Profiles: ${publicProfiles.length}`);
    console.log(`   - Private Profiles: ${privateProfiles.length}`);

    console.log('\n🎉 Admin Dashboard Profiles Test Completed Successfully!');
    console.log('\n📝 Next Steps:');
    console.log('1. Start the frontend: npm run dev');
    console.log('2. Navigate to Admin Dashboard');
    console.log('3. Click on "Profiles" in the sidebar');
    console.log('4. You should see:');
    console.log('   - Search and filter options');
    console.log('   - Grid of profile cards');
    console.log('   - Profile information (name, type, age, location, status)');
    console.log('   - View and Delete buttons for each profile');
    console.log('5. Test the search and filter functionality');
    console.log('6. Test viewing individual profiles');
    console.log('7. Test deleting profiles (be careful!)');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Make sure the backend server is running on port 5001');
    }
  }
}

// Run the test
testAdminProfiles(); 