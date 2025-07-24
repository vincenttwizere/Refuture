const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'shortlisted', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  coverLetter: {
    type: String,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  resumeUrl: {
    type: String
  },
  additionalDocuments: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reviewNotes: {
    type: String,
    maxlength: [1000, 'Review notes cannot exceed 1000 characters']
  },
  reviewDate: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  interviewScheduled: {
    type: Boolean,
    default: false
  },
  interviewDate: {
    type: Date
  },
  interviewLocation: {
    type: String
  },
  interviewNotes: {
    type: String
  },
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
  availability: {
    type: String,
    enum: ['immediately', '2_weeks', '1_month', '3_months', 'flexible'],
    default: 'flexible'
  },
  isWithdrawn: {
    type: Boolean,
    default: false
  },
  withdrawnAt: {
    type: Date
  },
  withdrawnReason: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
applicationSchema.index({ opportunity: 1 });
applicationSchema.index({ applicant: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });

// Compound index to prevent duplicate applications
applicationSchema.index({ opportunity: 1, applicant: 1 }, { unique: true });

// Virtual for application age
applicationSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to update status
applicationSchema.methods.updateStatus = function(newStatus, notes = '', reviewer = null) {
  this.status = newStatus;
  this.reviewNotes = notes;
  this.reviewedBy = reviewer;
  this.reviewDate = new Date();
  return this.save();
};

// Method to schedule interview
applicationSchema.methods.scheduleInterview = function(date, location, notes = '') {
  this.interviewScheduled = true;
  this.interviewDate = date;
  this.interviewLocation = location;
  this.interviewNotes = notes;
  return this.save();
};

// Method to withdraw application
applicationSchema.methods.withdraw = function(reason = '') {
  this.isWithdrawn = true;
  this.withdrawnAt = new Date();
  this.withdrawnReason = reason;
  this.status = 'withdrawn';
  return this.save();
};

module.exports = mongoose.model('Application', applicationSchema); 