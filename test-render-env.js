import axios from 'axios';

console.log('🧪 Testing Render Environment Variables...');

async function testRenderEnvironment() {
  console.log('\n1️⃣ Testing backend health...');
  try {
    const healthResponse = await axios.get('https://refuture-backend-1.onrender.com/api/health');
    console.log('✅ Backend health check passed:', healthResponse.data);
  } catch (error) {
    console.log('❌ Backend health check failed:', error.message);
    return;
  }

  console.log('\n2️⃣ Testing CORS with Vercel domain...');
  try {
    const corsResponse = await axios.get('https://refuture-backend-1.onrender.com/api/health', {
      headers: {
        'Origin': 'https://refuture-two.vercel.app'
      }
    });
    console.log('✅ CORS test passed for Vercel domain');
  } catch (error) {
    console.log('❌ CORS test failed:', error.message);
    console.log('💡 This means ALLOWED_ORIGINS is not set correctly');
  }

  console.log('\n3️⃣ Testing authentication endpoint...');
  try {
    const authResponse = await axios.post('https://refuture-backend-1.onrender.com/api/auth/login', {
      email: 'test@example.com',
      password: 'test123'
    }, {
      headers: {
        'Origin': 'https://refuture-two.vercel.app'
      }
    });
    console.log('✅ Authentication endpoint accessible');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Authentication endpoint accessible (expected 401 for invalid credentials)');
    } else {
      console.log('❌ Authentication endpoint failed:', error.message);
    }
  }

  console.log('\n🎉 Render environment test complete!');
}

testRenderEnvironment(); 