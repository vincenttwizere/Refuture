import mongoose from 'mongoose';
import User from './backend/models/UserModel.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/refuture';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const checkAdminUser = async () => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    if (admins.length === 0) {
      console.log('No admin users found!');
    } else {
      console.log('Admin users:');
      admins.forEach(user => {
        console.log(`- ${user.email} (${user.role})`);
      });
    }
    const allUsers = await User.find({}).select('-password');
    console.log('\nAll users:');
    allUsers.forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
    });
  } catch (err) {
    console.error('Error checking users:', err);
  } finally {
    mongoose.connection.close();
  }
};

checkAdminUser(); 