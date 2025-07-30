console.log('🧪 Testing Environment Variables...');

// Test what environment variables are available
console.log('VITE_API_URL:', process.env.VITE_API_URL);
console.log('VITE_API_BASE_URL:', process.env.VITE_API_BASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Test the actual API base URL that would be used
const API_BASE_URL = process.env.VITE_API_URL || process.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
console.log('Final API_BASE_URL:', API_BASE_URL);

console.log('✅ Environment test completed'); 