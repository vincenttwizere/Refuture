const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testOpportunityDetails() {
  try {
    console.log('🧪 Testing Opportunity Details Functionality...\n');

    // 1. Get all opportunities to find one to test with
    console.log('1. Fetching all opportunities...');
    const opportunitiesResponse = await axios.get(`${API_BASE}/opportunities`);
    const opportunities = opportunitiesResponse.data.opportunities;
    
    if (opportunities.length === 0) {
      console.log('❌ No opportunities found. Please create some opportunities first.');
      return;
    }

    const testOpportunity = opportunities[0];
    console.log(`✅ Found opportunity: "${testOpportunity.title}" (ID: ${testOpportunity._id})\n`);

    // 2. Test getting individual opportunity details
    console.log('2. Testing individual opportunity details...');
    const detailsResponse = await axios.get(`${API_BASE}/opportunities/${testOpportunity._id}`);
    const opportunityDetails = detailsResponse.data.opportunity;
    
    console.log('✅ Opportunity details retrieved successfully!');
    console.log('📋 Details:');
    console.log(`   - Title: ${opportunityDetails.title}`);
    console.log(`   - Provider: ${opportunityDetails.providerName}`);
    console.log(`   - Type: ${opportunityDetails.type}`);
    console.log(`   - Location: ${opportunityDetails.location}`);
    console.log(`   - Category: ${opportunityDetails.category}`);
    console.log(`   - Description: ${opportunityDetails.description.substring(0, 100)}...`);
    console.log(`   - Application Deadline: ${new Date(opportunityDetails.applicationDeadline).toLocaleDateString()}`);
    
    if (opportunityDetails.salary) {
      console.log(`   - Salary: ${opportunityDetails.salary.min || 'N/A'} - ${opportunityDetails.salary.max || 'N/A'} ${opportunityDetails.salary.currency || 'USD'}`);
    }
    
    if (opportunityDetails.requirements) {
      console.log(`   - Skills: ${opportunityDetails.requirements.skills?.join(', ') || 'None specified'}`);
      console.log(`   - Experience: ${opportunityDetails.requirements.experience || 'None specified'}`);
      console.log(`   - Education: ${opportunityDetails.requirements.education || 'None specified'}`);
      console.log(`   - Languages: ${opportunityDetails.requirements.languages?.join(', ') || 'None specified'}`);
    }
    
    if (opportunityDetails.benefits && opportunityDetails.benefits.length > 0) {
      console.log(`   - Benefits: ${opportunityDetails.benefits.join(', ')}`);
    }
    
    if (opportunityDetails.tags && opportunityDetails.tags.length > 0) {
      console.log(`   - Tags: ${opportunityDetails.tags.join(', ')}`);
    }
    
    console.log(`   - Remote: ${opportunityDetails.isRemote ? 'Yes' : 'No'}`);
    console.log(`   - Active: ${opportunityDetails.isActive ? 'Yes' : 'No'}`);
    console.log(`   - Created: ${new Date(opportunityDetails.createdAt).toLocaleDateString()}`);

    console.log('\n🎉 Opportunity Details Test Completed Successfully!');
    console.log('\n📝 Next Steps:');
    console.log('1. Start the frontend: npm run dev');
    console.log('2. Navigate to the Refugee Dashboard');
    console.log('3. Go to Opportunities section');
    console.log('4. Click "View Details" on any opportunity');
    console.log('5. You should see the full opportunity details page');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Make sure the backend server is running on port 5001');
    }
  }
}

// Run the test
testOpportunityDetails(); 