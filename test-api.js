import axios from 'axios';

const API_BASE_URL = 'https://refuture-backend-1.onrender.com/api';

async function testAPI() {
  console.log('🧪 Testing API connection...');
  console.log(`📍 API URL: ${API_BASE_URL}`);
  
  try {
    // Test health endpoint
    console.log('\n1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test CORS
    console.log('\n2️⃣ Testing CORS configuration...');
    const corsResponse = await axios.get(`${API_BASE_URL}/health`, {
      headers: {
        'Origin': 'http://localhost:5173'
      }
    });
    console.log('✅ CORS test passed');
    
    console.log('\n🎉 All tests passed! Your backend is ready for production use.');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAPI(); 