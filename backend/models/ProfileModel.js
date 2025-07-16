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
  photoUrl: {
    type: String
  },
  supportingDocuments: {
    type: [{
      path: String,
      originalname: String
    }],
    default: []
  },
  education: {
    type: [{
      school: String,
      degree: String,
      field: String,
      start: String,
      end: String,
      duration: String
    }],
    default: []
  },
  experience: {
    type: [{
      company: String,
      title: String,
      type: String,
      start: String,
      end: String,
      duration: String,
      description: String
    }],
    default: []
  },
  // Student-specific fields
  highSchoolSubjects: {
    type: String
  },
  desiredField: {
    type: String
  },
  academicRecords: {
    type: [{
      level: String,
      year: String,
      school: String,
      percentage: Number,
      // Special fields for National Exam
      subjectGrades: String,
      certificate: String,
      supportingDocuments: [String]
    }],
    default: []
  },
  // Undocumented talent-specific fields
  talentCategory: {
    type: String,
    enum: ['artist', 'musician', 'programmer', 'writer', 'designer', 'other']
  },
  talentExperience: {
    type: String
  },
  talentDescription: {
    type: String
  },
  portfolio: {
    type: [{
      title: String,
      description: String,
      category: String,
      year: String,
      media: String,
      link: String
    }],
    default: []
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Add index for performance
ProfileSchema.index({ email: 1 });
ProfileSchema.index({ option: 1 });
ProfileSchema.index({ isPublic: 1 });
ProfileSchema.index({ createdAt: -1 });
ProfileSchema.index({ skills: 1 }); // For skill-based searches
ProfileSchema.index({ currentLocation: 1 }); // For location-based searches

export default mongoose.model('ProfileModel', ProfileSchema); 