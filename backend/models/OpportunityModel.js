import mongoose from 'mongoose';

const OpportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['job', 'scholarship', 'mentorship', 'funding', 'internship'],
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  requirements: {
    skills: [String],
    experience: String,
    education: String,
    languages: [String]
  },
  benefits: [String],
  applicationDeadline: {
    type: Date,
    required: true
  },
  startDate: Date,
  duration: String,
  isRemote: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxApplicants: Number,
  currentApplicants: {
    type: Number,
    default: 0
  },
  tags: [String],
  attachments: [String], // File paths
  contactEmail: String,
  contactPhone: String,
  website: String
}, {
  timestamps: true
});

// Index for better search performance
OpportunitySchema.index({ title: 'text', description: 'text', category: 'text' });
OpportunitySchema.index({ type: 1, isActive: 1 });
OpportunitySchema.index({ applicationDeadline: 1 });
OpportunitySchema.index({ createdAt: -1 });
OpportunitySchema.index({ isActive: 1 });
OpportunitySchema.index({ provider: 1 });

export default mongoose.model('Opportunity', OpportunitySchema); 