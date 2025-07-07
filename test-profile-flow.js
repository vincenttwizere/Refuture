// Test script to check profile flow
import mongoose from 'mongoose';
import User from './backend/models/UserModel.js';
import Profile from './backend/models/ProfileModel.js';

async function testProfileFlow() {
  try {
    console.log('Testing profile flow...\n');

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/refuture', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Get all users
    const users = await User.find({ role: 'refugee' });
    console.log(`Found ${users.length} refugee users`);

    // Get all profiles
    const profiles = await Profile.find();
    console.log(`Found ${profiles.length} profiles`);

    // Check each refugee user
    for (const user of users) {
      const hasProfile = profiles.some(profile => profile.email === user.email);
      console.log(`User ${user.email}: hasProfile=${user.hasProfile}, actual profile=${hasProfile}`);
      
      if (hasProfile !== user.hasProfile) {
        console.log(`  ⚠️  Inconsistency detected!`);
      }
    }

    // Show some sample profiles
    if (profiles.length > 0) {
      console.log('\nSample profiles:');
      profiles.slice(0, 3).forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.fullName} (${profile.email}) - ${profile.option}`);
      });
    }

    console.log('\nProfile flow test completed!');
    process.exit(0);

  } catch (error) {
    console.error('Error testing profile flow:', error);
    process.exit(1);
  }
}

// Run the test
testProfileFlow(); 