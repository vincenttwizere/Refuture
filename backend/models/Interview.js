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
  
  // Enhanced interview flow fields
  format: {
    type: String,
    enum: ['in-person', 'phone', 'video', 'hybrid'],
    default: 'video'
  },
  meetingLink: String,
  customGoogleMeetLink: String, // Custom Google Meet link field
  meetingPlatform: {
    type: String,
    enum: ['zoom', 'teams', 'google-meet', 'skype', 'other'],
    default: 'zoom'
  },
  materials: {
    type: String,
    default: ''
  },
  instructions: {
    type: String,
    default: ''
  },
  
  // Availability slots for scheduling
  availabilitySlots: [{
    date: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  
  // Enhanced status tracking
  status: {
    type: String,
    enum: ['invited', 'confirmed', 'scheduled', 'completed', 'cancelled', 'declined'],
    default: 'invited'
  },
  
  // Provider notes and talent response
  providerNotes: String,
  talentResponse: {
    message: String,
    respondedAt: Date,
    preferredTimes: [Date], // For scheduling flexibility
    selectedSlot: {
      date: Date,
      startTime: String,
      endTime: String
    },
    availability: {
      type: String,
      enum: ['available', 'unavailable', 'needs-reschedule'],
      default: 'available'
    }
  },
  
  // Confirmation details
  confirmation: {
    confirmedDate: Date,
    confirmedTime: String,
    meetingDetails: String,
    finalInstructions: String,
    sentAt: Date
  },
  
  // Reminders and notifications
  reminders: [{
    type: {
      type: String,
      enum: ['24h', '1h', '15min'],
      required: true
    },
    sentAt: Date,
    scheduledFor: Date
  }],
  
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
  return this.scheduledDate && this.scheduledDate > new Date() && this.status === 'scheduled';
};

// Method to check if interview is past due
interviewSchema.methods.isPastDue = function() {
  return this.scheduledDate && this.scheduledDate < new Date() && this.status === 'scheduled';
};

// Method to generate meeting link based on platform
interviewSchema.methods.generateMeetingLink = function() {
  if (this.meetingPlatform === 'zoom') {
    return `https://zoom.us/j/${Math.random().toString(36).substr(2, 9)}`;
  } else if (this.meetingPlatform === 'teams') {
    return `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substr(2, 9)}`;
  } else if (this.meetingPlatform === 'google-meet') {
    // Use custom link if provided, otherwise generate one
    return this.customGoogleMeetLink || `https://meet.google.com/${Math.random().toString(36).substr(2, 9)}`;
  }
  return this.meetingLink || '';
};

// Method to get status display name
interviewSchema.methods.getStatusDisplayName = function() {
  const statusMap = {
    'invited': 'Invitation Sent',
    'confirmed': 'Confirmed',
    'scheduled': 'Scheduled',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'declined': 'Declined'
  };
  return statusMap[this.status] || this.status;
};

// Method to get available slots
interviewSchema.methods.getAvailableSlots = function() {
  return this.availabilitySlots.filter(slot => slot.isAvailable);
};

// Method to select a slot
interviewSchema.methods.selectSlot = function(slotIndex) {
  if (this.availabilitySlots[slotIndex] && this.availabilitySlots[slotIndex].isAvailable) {
    const selectedSlot = this.availabilitySlots[slotIndex];
    this.scheduledDate = selectedSlot.date;
    this.talentResponse.selectedSlot = {
      date: selectedSlot.date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime
    };
    return true;
  }
  return false;
};

export default mongoose.model('Interview', interviewSchema); 