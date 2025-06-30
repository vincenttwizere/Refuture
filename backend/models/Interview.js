import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  talentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['scholarship', 'internship', 'job', 'mentorship', 'other'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  organization: {
    type: String,
    required: true
  },
  position: String,
  location: {
    type: String,
    enum: ['remote', 'onsite', 'hybrid']
  },
  address: String,
  scheduledDate: Date,
  duration: Number, // in minutes
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'],
    default: 'pending'
  },
  providerNotes: String,
  talentResponse: {
    message: String,
    respondedAt: Date
  },
  meetingLink: String,
  attachments: [{
    name: String,
    url: String,
    uploadedBy: {
      type: String,
      enum: ['provider', 'talent']
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
interviewSchema.index({ providerId: 1, status: 1 });
interviewSchema.index({ talentId: 1, status: 1 });
interviewSchema.index({ scheduledDate: 1 });

// Method to check if interview is upcoming
interviewSchema.methods.isUpcoming = function() {
  return this.scheduledDate && this.scheduledDate > new Date() && this.status === 'accepted';
};

// Method to check if interview is past due
interviewSchema.methods.isPastDue = function() {
  return this.scheduledDate && this.scheduledDate < new Date() && this.status === 'accepted';
};

export default mongoose.model('Interview', interviewSchema); 