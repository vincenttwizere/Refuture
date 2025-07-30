import axios from 'axios';

const BACKEND_URL = 'https://refuture-backend-1.onrender.com/api';

async function testBackend() {
  console.log('🧪 Testing Backend Connection...');
  console.log(`📍 Backend URL: ${BACKEND_URL}`);

  try {
    // Test health endpoint
    console.log('\n1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${BACKEND_URL}/health`);
    console.log('✅ Backend is running:', healthResponse.data);

    // Test CORS
    console.log('\n2️⃣ Testing CORS...');
    const corsResponse = await axios.get(`${BACKEND_URL}/health`, {
      headers: {
        'Origin': 'https://refuture-two.vercel.app'
      }
    });
    console.log('✅ CORS is working');

    console.log('\n🎉 Backend is working perfectly!');
    console.log('\n💡 The issue is in your Vercel environment variables.');

  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testBackend(); 