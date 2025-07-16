import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/refuture';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Ensure all indexes are created for optimal performance
    await ensureIndexes();
    
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Please make sure MongoDB is installed and running');
    console.log('You can download MongoDB from: https://www.mongodb.com/try/download/community');
    process.exit(1);
  }
};

// Function to ensure all indexes are created
const ensureIndexes = async () => {
  try {
    console.log('Creating database indexes for optimal performance...');
    
    // Get all models
    const models = mongoose.models;
    
    // Create indexes for each model
    for (const [modelName, model] of Object.entries(models)) {
      try {
        await model.createIndexes();
        console.log(`✓ Indexes created for ${modelName}`);
      } catch (error) {
        console.log(`⚠ Warning: Could not create indexes for ${modelName}:`, error.message);
      }
    }
    
    console.log('Database indexes setup complete');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

export default connectDB; 