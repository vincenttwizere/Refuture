const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  nationality: {
    type: String,
    trim: true
  },
  currentLocation: {
    type: String,
    trim: true
  },
  option: {
    type: String,
    trim: true
  },
  highSchoolSubjects: {
    type: String,
    trim: true
  },
  desiredField: {
    type: String,
    trim: true
  },
  talentCategory: {
    type: String,
    trim: true
  },
  talentExperience: {
    type: String,
    trim: true
  },
  talentDescription: {
    type: String,
    trim: true
  },
  language: [{
    type: String,
    trim: true,
    index: false // Explicitly prevent indexing
  }],
  tags: [{
    type: String,
    trim: true,
    index: false // Explicitly prevent indexing
  }],
  // Education schema - EXACTLY matching frontend structure
  education: [{
    school: {
      type: String,
      trim: true
    },
    degree: {
      type: String,
      trim: true
    },
    field: {
      type: String,
      trim: true
    },
    start: {
      type: String,
      trim: true
    },
    end: {
      type: String,
      trim: true
    },
    duration: {
      type: String,
      trim: true
    }
  }],
  // Experience schema - EXACTLY matching frontend structure
  experience: [{
    company: {
      type: String,
      trim: true
    },
    title: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      trim: true
    },
    start: {
      type: String,
      trim: true
    },
    end: {
      type: String,
      trim: true
    },
    duration: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  // Academic records schema - EXACTLY matching frontend structure
  academicRecords: [{
    level: {
      type: String,
      trim: true
    },
    year: {
      type: String,
      trim: true
    },
    school: {
      type: String,
      trim: true
    },
    percentage: {
      type: String,
      trim: true
    },
    subjectGrades: {
      type: String,
      trim: true
    },
    certificate: {
      type: String,
      trim: true
    },
    supportingDocuments: [{
      path: {
        type: String,
        trim: true
      },
      originalname: {
        type: String,
        trim: true
      }
    }]
  }],
  // Portfolio schema - EXACTLY matching frontend structure
  portfolio: [{
    title: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      trim: true
    },
    year: {
      type: String,
      trim: true
    },
    media: {
      type: String,
      trim: true
    },
    link: {
      type: String,
      trim: true
    }
  }],
  supportingDocuments: [{
    path: {
      type: String,
      trim: true
    },
    originalname: {
      type: String,
      trim: true
    }
  }],
  skills: [{
      type: String,
    trim: true,
    index: false // Explicitly prevent indexing
  }],
  certifications: [{
    name: {
      type: String,
      required: true
    },
    issuingOrganization: {
      type: String,
      required: true
    },
    issueDate: {
      type: Date
    },
    expiryDate: {
      type: Date
    },
    credentialId: {
      type: String
    }
  }],
  photoUrl: {
    type: String
  },
  resumeUrl: {
    type: String
  },
  coverLetter: {
    type: String,
    maxlength: 2000
  },
  availability: {
    type: String,
    enum: ['immediately', '2_weeks', '1_month', '3_months', 'flexible'],
    default: 'flexible'
  },
  preferredWorkType: [{
    type: String,
    enum: ['full_time', 'part_time', 'contract', 'internship', 'volunteer']
  }],
  salaryExpectation: {
    min: {
      type: Number
    },
    max: {
      type: Number
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries - only on non-array fields
profileSchema.index({ user: 1 });
profileSchema.index({ isPublic: 1 });
profileSchema.index({ option: 1 });
profileSchema.index({ email: 1 }); // Index on email for queries, but not unique
profileSchema.index({ user: 1, isPublic: 1 }); // Compound index for user queries
profileSchema.index({ user: 1 }, { unique: true }); // Ensure one profile per user

// Method to check if profile is complete
profileSchema.methods.isProfileComplete = function() {
  return this.firstName && this.lastName && this.email && this.language.length > 0;
};

module.exports = mongoose.model('Profile', profileSchema); 