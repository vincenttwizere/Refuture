// Test script to verify profile creation flow
import mongoose from 'mongoose';
import User from './backend/models/UserModel.js';
import Profile from './backend/models/ProfileModel.js';

async function testProfileCreation() {
  try {
    console.log('Testing profile creation flow...\n');

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/refuture', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Find a refugee user without a profile
    const userWithoutProfile = await User.findOne({ 
      role: 'refugee', 
      hasProfile: false 
    });

    if (!userWithoutProfile) {
      console.log('No refugee user without profile found. Creating a test user...');
      
      // Create a test user
      const testUser = new User({
        email: 'test-refugee@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Refugee',
        role: 'refugee',
        hasProfile: false
      });
      
      await testUser.save();
      console.log('Created test user:', testUser.email);
    } else {
      console.log('Found user without profile:', userWithoutProfile.email);
    }

    // Check current state
    const users = await User.find({ role: 'refugee' });
    const profiles = await Profile.find();
    
    console.log(`\nCurrent state:`);
    console.log(`- Refugee users: ${users.length}`);
    console.log(`- Profiles: ${profiles.length}`);
    
    users.forEach(user => {
      const hasProfile = profiles.some(p => p.email === user.email);
      console.log(`  ${user.email}: hasProfile=${user.hasProfile}, actual profile=${hasProfile}`);
    });

    console.log('\nProfile creation test completed!');
    process.exit(0);

  } catch (error) {
    console.error('Error testing profile creation:', error);
    process.exit(1);
  }
}

// Run the test
testProfileCreation(); 