// Utility script to check and fix inconsistent hasProfile data
// This script ensures that users with profiles have hasProfile: true

import mongoose from 'mongoose';
import User from './backend/models/UserModel.js';
import Profile from './backend/models/ProfileModel.js';

async function fixUserProfiles() {
  try {
    console.log('Checking for inconsistent hasProfile data...\n');

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

    // Check each user
    for (const user of users) {
      const hasProfile = profiles.some(profile => profile.email === user.email);
      
      if (hasProfile && !user.hasProfile) {
        console.log(`Fixing user ${user.email}: hasProfile should be true`);
        await User.findByIdAndUpdate(user._id, { hasProfile: true });
      } else if (!hasProfile && user.hasProfile) {
        console.log(`Fixing user ${user.email}: hasProfile should be false`);
        await User.findByIdAndUpdate(user._id, { hasProfile: false });
      } else {
        console.log(`User ${user.email}: hasProfile is correct (${user.hasProfile})`);
      }
    }

    console.log('\nProfile consistency check completed!');
    process.exit(0);

  } catch (error) {
    console.error('Error fixing user profiles:', error);
    process.exit(1);
  }
}

// Run the fix
fixUserProfiles(); 