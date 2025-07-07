import mongoose from 'mongoose';

const SavedOpportunitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure a user can only save an opportunity once
SavedOpportunitySchema.index({ user: 1, opportunity: 1 }, { unique: true });

export default mongoose.model('SavedOpportunity', SavedOpportunitySchema); 