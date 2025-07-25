const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Notification Settings
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    types: {
      opportunities: {
        type: Boolean,
        default: true
      },
      interviews: {
        type: Boolean,
        default: true
      },
      messages: {
        type: Boolean,
        default: true
      },
      applications: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Privacy Settings
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'hidden'],
      default: 'public'
    },
    showContactInfo: {
      type: Boolean,
      default: true
    },
    allowMessages: {
      type: Boolean,
      default: true
    }
  },
  
  // Display Preferences
  preferences: {
    language: {
      type: String,
      enum: ['en', 'fr', 'es', 'ar'],
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    darkMode: {
      type: Boolean,
      default: false
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    }
  },
  
  // Application Settings
  application: {
    autoSave: {
      type: Boolean,
      default: true
    },
    defaultCoverLetter: {
      type: String,
      default: ''
    },
    preferredOpportunityTypes: [{
      type: String,
      enum: ['scholarship', 'job', 'internship', 'mentorship', 'funding']
    }]
  }
}, {
  timestamps: true
});

// Index for faster queries
userSettingsSchema.index({ user: 1 });

// Method to get default settings
userSettingsSchema.statics.getDefaultSettings = function() {
  return {
    notifications: {
      email: true,
      push: true,
      types: {
        opportunities: true,
        interviews: true,
        messages: true,
        applications: true
      }
    },
    privacy: {
      profileVisibility: 'public',
      showContactInfo: true,
      allowMessages: true
    },
    preferences: {
      language: 'en',
      timezone: 'UTC',
      darkMode: false,
      theme: 'light'
    },
    application: {
      autoSave: true,
      defaultCoverLetter: '',
      preferredOpportunityTypes: []
    }
  };
};

// Method to update settings
userSettingsSchema.methods.updateSettings = function(updates) {
  Object.keys(updates).forEach(key => {
    if (this[key] && typeof this[key] === 'object' && !Array.isArray(this[key])) {
      Object.assign(this[key], updates[key]);
    } else {
      this[key] = updates[key];
    }
  });
  return this.save();
};

module.exports = mongoose.model('UserSettings', userSettingsSchema); 