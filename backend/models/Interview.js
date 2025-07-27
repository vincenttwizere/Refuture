const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: function() {
      return this.interviewType !== 'profile';
    }
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: function() {
      return this.interviewType !== 'profile';
    }
  },
  interviewType: {
    type: String,
    enum: ['application', 'profile'],
    default: 'application'
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  talent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['phone', 'video', 'in_person', 'technical', 'behavioral'],
    required: true
  },
  status: {
    type: String,
    enum: ['invited', 'accepted', 'declined', 'scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'invited'
  },
  scheduledDate: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  location: {
    type: String
  },
  meetingLink: {
    type: String
  },
  meetingId: {
    type: String
  },
  meetingPassword: {
    type: String
  },
  availabilitySlots: [{
    date: {
      type: Date,
      required: true
    },
    timeSlots: [{
      startTime: {
        type: String,
        required: true
      },
      endTime: {
        type: String,
        required: true
      },
      isSelected: {
        type: Boolean,
        default: false
      }
    }]
  }],
  selectedSlot: {
    date: {
      type: Date
    },
    startTime: {
      type: String
    },
    endTime: {
      type: String
    }
  },
  notes: {
    provider: {
      type: String,
      maxlength: [1000, 'Provider notes cannot exceed 1000 characters']
    },
    talent: {
      type: String,
      maxlength: [1000, 'Talent notes cannot exceed 1000 characters']
    }
  },
  feedback: {
    provider: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: {
        type: String,
        maxlength: [1000, 'Provider feedback cannot exceed 1000 characters']
      },
      submittedAt: {
        type: Date
      }
    },
    talent: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: {
        type: String,
        maxlength: [1000, 'Talent feedback cannot exceed 1000 characters']
      },
      submittedAt: {
        type: Date
      }
    }
  },
  outcome: {
    type: String,
    enum: ['hired', 'rejected', 'pending', 'next_round'],
    default: 'pending'
  },
  nextSteps: {
    type: String,
    maxlength: [500, 'Next steps cannot exceed 500 characters']
  },
  reminders: [{
    sentAt: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['invitation', 'reminder_24h', 'reminder_1h', 'follow_up']
    },
    sentTo: {
      type: String,
      enum: ['provider', 'talent', 'both']
    }
  }],
  isUrgent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
interviewSchema.index({ provider: 1 });
interviewSchema.index({ talent: 1 });
interviewSchema.index({ opportunity: 1 });
interviewSchema.index({ application: 1 });
interviewSchema.index({ status: 1 });
interviewSchema.index({ scheduledDate: 1 });

// Virtual for interview status
interviewSchema.virtual('isUpcoming').get(function() {
  if (!this.scheduledDate) return false;
  return this.scheduledDate > new Date() && this.status === 'scheduled';
});

// Virtual for interview duration in hours
interviewSchema.virtual('durationHours').get(function() {
  return this.duration / 60;
});

// Method to accept interview
interviewSchema.methods.accept = function() {
  this.status = 'accepted';
  return this.save();
};

// Method to decline interview
interviewSchema.methods.decline = function() {
  this.status = 'declined';
  return this.save();
};

// Method to schedule interview
interviewSchema.methods.schedule = function(date, location = '', meetingLink = '') {
  this.status = 'scheduled';
  this.scheduledDate = date;
  this.location = location;
  this.meetingLink = meetingLink;
  return this.save();
};

// Method to complete interview
interviewSchema.methods.complete = function() {
  this.status = 'completed';
  return this.save();
};

// Method to add reminder
interviewSchema.methods.addReminder = function(type, sentTo) {
  this.reminders.push({
    type,
    sentTo,
    sentAt: new Date()
  });
  return this.save();
};

module.exports = mongoose.model('Interview', interviewSchema); 