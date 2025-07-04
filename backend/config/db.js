import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/refuture';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Please make sure MongoDB is installed and running');
    console.log('You can download MongoDB from: https://www.mongodb.com/try/download/community');
    process.exit(1);
  }
};

export default connectDB; 