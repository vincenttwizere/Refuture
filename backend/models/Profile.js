import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fullName: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  nationality: { type: String },
  currentLocation: { type: String },
  contactEmail: { type: String, required: true },
  academic: {
    highestLevel: String,
    institution: String,
    yearOfCompletion: String,
    performance: String,
    certificates: [String],
  },
  skills: [String],
  languages: [String],
  technicalSkills: [String],
  experience: [
    {
      role: String,
      project: String,
      organization: String,
      duration: String,
      portfolio: String,
    }
  ],
  personalStatement: {
    bio: String,
    vision: String,
    motivation: String,
  },
  tags: [String],
  isPublic: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Profile', ProfileSchema); 