import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientEmail: { type: String },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

// Add indexes for better query performance
MessageSchema.index({ sender: 1, createdAt: -1 });
MessageSchema.index({ recipient: 1, createdAt: -1 });
MessageSchema.index({ recipient: 1, isRead: 1 });
MessageSchema.index({ createdAt: -1 });
MessageSchema.index({ sender: 1, recipient: 1 }); // For conversation queries

const Message = mongoose.model('Message', MessageSchema);
export default Message; 