const mongoose = require('mongoose');

console.log('🧪 Testing MongoDB Connection...');

const MONGODB_URI = 'mongodb+srv://vtwizere:U4MzDRudwqbATncy@cluster0.rqkr9tc.mongodb.net/refuture?retryWrites=true&w=majority&appName=Cluster0';

async function testMongoDBConnection() {
  try {
    console.log('🔗 Attempting to connect to MongoDB...');
    console.log('📍 Connection string:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
    });
    
    console.log('✅ MongoDB connection successful!');
    console.log('📊 Database name:', mongoose.connection.db.databaseName);
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Collections found:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.name === 'MongooseServerSelectionError') {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check MongoDB Atlas IP whitelist');
      console.log('2. Verify connection string');
      console.log('3. Check network connectivity');
    }
  }
}

testMongoDBConnection(); 