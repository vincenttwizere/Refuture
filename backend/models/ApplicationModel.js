import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true
  },
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate applications
ApplicationSchema.index({ opportunityId: 1, applicantId: 1 }, { unique: true });
// Add indexes for performance
ApplicationSchema.index({ applicantId: 1 });
ApplicationSchema.index({ opportunityId: 1 });
ApplicationSchema.index({ appliedAt: -1 });

const Application = mongoose.model('Application', ApplicationSchema);
export default Application; 