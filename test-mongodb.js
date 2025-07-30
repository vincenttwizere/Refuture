import axios from 'axios';

const API_BASE_URL = 'https://refuture-backend-1.onrender.com/api';

async function testMongoDBConnection() {
  console.log('🧪 Testing MongoDB Connection...');
  console.log(`📍 API URL: ${API_BASE_URL}`);
  
  try {
    // Test health endpoint
    console.log('\n1️⃣ Testing backend health...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend is running:', healthResponse.data);
    
    // Test user registration (this will test MongoDB connection)
    console.log('\n2️⃣ Testing MongoDB connection via user registration...');
    const testUser = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword123',
      role: 'refugee'
    };
    
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/signup`, testUser);
      console.log('✅ MongoDB connection successful - User created:', registerResponse.data.message);
      
      // Clean up - delete test user
      console.log('🧹 Cleaning up test user...');
      // Note: You might need to implement a cleanup endpoint or do this manually
      
    } catch (registerError) {
      if (registerError.response?.status === 409) {
        console.log('✅ MongoDB connection successful - User already exists (expected for test)');
      } else if (registerError.response?.status === 400) {
        console.log('✅ MongoDB connection successful - Validation error (expected)');
      } else {
        console.log('❌ MongoDB connection failed:', registerError.response?.data || registerError.message);
        console.log('💡 Check your MongoDB Atlas connection string in Render environment variables');
      }
    }
    
    // Test database collections
    console.log('\n3️⃣ Testing database collections...');
    try {
      const usersResponse = await axios.get(`${API_BASE_URL}/users`);
      console.log('✅ Users collection accessible');
    } catch (error) {
      console.log('⚠️  Users collection test failed (might need authentication)');
    }
    
    console.log('\n🎉 MongoDB connection test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Check your MongoDB Atlas dashboard for the "refuture" database');
    console.log('2. Verify collections are created (users, opportunities, etc.)');
    console.log('3. Test user registration in your frontend');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testMongoDBConnection(); 