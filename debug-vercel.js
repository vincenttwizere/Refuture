import axios from 'axios';

console.log('🧪 Debugging Vercel Environment Variables...');

// Test different possible API URLs
const possibleUrls = [
  'https://refuture-backend-1.onrender.com/api',
  'http://localhost:5001/api',
  'https://refuture-backend-1.onrender.com/api/health'
];

async function testUrls() {
  for (const url of possibleUrls) {
    try {
      console.log(`\n🔍 Testing: ${url}`);
      const response = await axios.get(url);
      console.log(`✅ Success: ${response.status} - ${response.data.message || 'OK'}`);
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
}

// Test CORS specifically
async function testCORS() {
  console.log('\n🌐 Testing CORS...');
  try {
    const response = await axios.get('https://refuture-backend-1.onrender.com/api/health', {
      headers: {
        'Origin': 'https://refuture-two.vercel.app'
      }
    });
    console.log('✅ CORS test passed for Vercel domain');
  } catch (error) {
    console.log('❌ CORS test failed:', error.message);
  }
}

testUrls().then(() => {
  return testCORS();
}).then(() => {
  console.log('\n🎉 Debug complete!');
}); 