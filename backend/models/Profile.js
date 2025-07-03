import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  option: {
    type: String,
    enum: ['student', 'job seeker', 'undocumented_talent'],
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  nationality: {
    type: String,
    required: true
  },
  currentLocation: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  skills: {
    type: [String],
    default: []
  },
  language: {
    type: [String],
    default: []
  },
  tags: {
    type: [String],
    default: []
  },
  document: {
    type: String 
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('ProfileModel', ProfileSchema);
