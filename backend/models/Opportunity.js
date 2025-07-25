const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  jobType: {
    type: String,
    enum: ['full_time', 'part_time', 'contract', 'internship', 'volunteer'],
    required: true
  },
  category: {
    type: String,
    required: [true, 'Job category is required'],
    enum: [
      'technology', 'healthcare', 'education', 'finance', 'marketing', 
      'sales', 'customer_service', 'manufacturing', 'logistics', 
      'hospitality', 'retail', 'construction', 'other'
    ]
  },
  requirements: [{
    type: String,
    trim: true
  }],
  responsibilities: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  salary: {
    min: {
      type: Number,
      required: [true, 'Minimum salary is required']
    },
    max: {
      type: Number,
      required: [true, 'Maximum salary is required']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    period: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'],
      default: 'yearly'
    }
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'junior', 'mid', 'senior', 'executive'],
    required: true
  },
  educationLevel: {
    type: String,
    enum: ['high_school', 'associate', 'bachelor', 'master', 'phd', 'none'],
    default: 'none'
  },
  languages: [{
    language: {
      type: String,
      required: true
    },
    proficiency: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'native'],
      default: 'intermediate'
    }
  }],
  skills: [{
    type: String,
    trim: true
  }],
  applicationDeadline: {
    type: Date
  },
  startDate: {
    type: Date
  },
  isRemote: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  applicationCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  contactEmail: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String
  },
  applicationInstructions: {
    type: String,
    maxlength: [1000, 'Application instructions cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
opportunitySchema.index({ provider: 1 });
opportunitySchema.index({ isActive: 1 });
opportunitySchema.index({ category: 1 });
opportunitySchema.index({ location: 1 });
opportunitySchema.index({ jobType: 1 });
opportunitySchema.index({ experienceLevel: 1 });
opportunitySchema.index({ createdAt: -1 });

// Virtual for salary range
opportunitySchema.virtual('salaryRange').get(function() {
  return `${this.salary.currency} ${this.salary.min.toLocaleString()} - ${this.salary.max.toLocaleString()} ${this.salary.period}`;
});

// Method to increment application count
opportunitySchema.methods.incrementApplicationCount = function() {
  this.applicationCount += 1;
  return this.save();
};

// Method to increment views
opportunitySchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to check if opportunity is expired
opportunitySchema.methods.isExpired = function() {
  if (!this.applicationDeadline) return false;
  return new Date() > this.applicationDeadline;
};

// Static method to deactivate expired opportunities
opportunitySchema.statics.deactivateExpiredOpportunities = async function() {
  try {
    const result = await this.updateMany(
      {
        isActive: true,
        applicationDeadline: { $exists: true, $lt: new Date() }
      },
      {
        $set: { isActive: false }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`Deactivated ${result.modifiedCount} expired opportunities`);
    }
    
    return result.modifiedCount;
  } catch (error) {
    console.error('Error deactivating expired opportunities:', error);
    throw error;
  }
};

// Static method to get active and non-expired opportunities
opportunitySchema.statics.getActiveOpportunities = function(filter = {}) {
  const baseFilter = {
    isActive: true,
    $or: [
      { applicationDeadline: { $exists: false } }, // No deadline set
      { applicationDeadline: { $gt: new Date() } } // Deadline is in the future
    ]
  };
  
  return this.find({ ...baseFilter, ...filter });
};

module.exports = mongoose.model('Opportunity', opportunitySchema); 