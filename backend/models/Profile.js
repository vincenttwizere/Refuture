import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  personalInfo: {
    dateOfBirth: Date,
    countryOfOrigin: {
      type: String,
      required: true
    },
    currentLocation: {
      city: String,
      country: String
    },
    phone: String,
    bio: {
      type: String,
      maxlength: 500
    },
    profilePicture: String
  },
  education: {
    highestLevel: {
      type: String,
      enum: ['primary', 'secondary', 'bachelor', 'master', 'phd', 'other']
    },
    fieldOfStudy: String,
    institution: String,
    graduationYear: Number,
    gpa: Number,
    certificates: [{
      name: String,
      issuer: String,
      date: Date,
      url: String
    }]
  },
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    category: {
      type: String,
      enum: ['technical', 'language', 'soft', 'other']
    }
  }],
  languages: [{
    name: String,
    proficiency: {
      type: String,
      enum: ['basic', 'conversational', 'fluent', 'native']
    }
  }],
  experience: [{
    title: String,
    company: String,
    description: String,
    startDate: Date,
    endDate: Date,
    current: {
      type: Boolean,
      default: false
    }
  }],
  achievements: [{
    title: String,
    description: String,
    date: Date,
    category: String
  }],
  interests: [String],
  availability: {
    type: String,
    enum: ['immediately', 'within_3_months', 'within_6_months', 'flexible']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for searching talents
profileSchema.index({ 
  'personalInfo.countryOfOrigin': 1, 
  'education.fieldOfStudy': 1, 
  'skills.name': 1 
});

// Method to check if profile is complete
profileSchema.methods.checkCompleteness = function() {
  const requiredFields = [
    'personalInfo.countryOfOrigin',
    'education.highestLevel',
    'education.fieldOfStudy',
    'skills'
  ];
  
  return requiredFields.every(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], this);
    return value && (Array.isArray(value) ? value.length > 0 : true);
  });
};

export default mongoose.model('Profile', profileSchema); 