import axios from 'axios';

async function testProfileView() {
  try {
    console.log('Testing profile view functionality...');
    
    // First, get all profiles to see what IDs are available
    console.log('\n1. Fetching all profiles...');
    const profilesResponse = await axios.get('http://localhost:5001/api/profiles');
    console.log('Profiles response status:', profilesResponse.status);
    console.log('Number of profiles found:', profilesResponse.data.profiles?.length || 0);
    
    if (profilesResponse.data.profiles && profilesResponse.data.profiles.length > 0) {
      const firstProfile = profilesResponse.data.profiles[0];
      console.log('First profile ID:', firstProfile._id);
      console.log('First profile name:', firstProfile.fullName);
      
      // Now test getting a specific profile by ID
      console.log('\n2. Testing getProfileById...');
      const profileResponse = await axios.get(`http://localhost:5001/api/profiles/${firstProfile._id}`);
      console.log('Profile response status:', profileResponse.status);
      console.log('Profile data:', JSON.stringify(profileResponse.data, null, 2));
    } else {
      console.log('No profiles found to test with');
    }
    
  } catch (error) {
    console.error('Error testing profile view:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

testProfileView(); 