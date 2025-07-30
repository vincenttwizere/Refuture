console.log('🧪 Testing Vercel Environment Variables...');

// Simulate what happens in the browser
const mockEnv = {
  VITE_API_URL: undefined,
  VITE_API_BASE_URL: undefined
};

// This is what your code does
const API_BASE_URL = mockEnv.VITE_API_URL || mockEnv.VITE_API_BASE_URL || 'http://localhost:5001/api';

console.log('🔧 Environment Variables Debug:');
console.log('VITE_API_URL:', mockEnv.VITE_API_URL);
console.log('VITE_API_BASE_URL:', mockEnv.VITE_API_BASE_URL);
console.log('Final API_BASE_URL:', API_BASE_URL);

console.log('\n💡 This shows why it falls back to localhost:5001');
console.log('💡 The environment variables are undefined in Vercel deployment'); 