const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'system'],
    default: 'text'
  },
  attachments: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    size: {
      type: Number
    },
    type: {
      type: String
    }
  }],
  relatedOpportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity'
  },
  relatedApplication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  relatedInterview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deletedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ recipient: 1, isRead: 1 });
messageSchema.index({ createdAt: -1 });

// Method to mark as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to mark as unread
messageSchema.methods.markAsUnread = function() {
  this.isRead = false;
  this.readAt = null;
  return this.save();
};

// Method to soft delete for a user
messageSchema.methods.deleteForUser = function(userId) {
  const existingDeletion = this.deletedBy.find(d => d.user.toString() === userId.toString());
  if (!existingDeletion) {
    this.deletedBy.push({
      user: userId,
      deletedAt: new Date()
    });
  }
  return this.save();
};

module.exports = mongoose.model('Message', messageSchema); 