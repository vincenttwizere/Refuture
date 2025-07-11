import Message from '../models/MessageModel.js';
import User from '../models/UserModel.js';
import mongoose from 'mongoose';

// Helper function to verify recipient exists
const verifyRecipient = async (recipientId) => {
  try {
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      throw new Error('Recipient user not found');
    }
    return recipient;
  } catch (error) {
    throw new Error(`Invalid recipient ID: ${recipientId}`);
  }
};

// Helper function to verify recipient exists (by ID or email)
const verifyRecipientFlexible = async (recipient) => {
  if (!recipient) throw new Error('Recipient is required');
  console.log('Verifying recipient:', recipient, 'Type:', typeof recipient);
  
  // If recipient looks like an email, find by email
  if (typeof recipient === 'string' && recipient.includes('@')) {
    console.log('Looking up user by email:', recipient);
    const user = await User.findOne({ email: recipient });
    if (!user) {
      console.log('User not found by email:', recipient);
      throw new Error('Recipient user not found by email');
    }
    console.log('User found by email:', user._id, user.email);
    return user;
  } else {
    // Otherwise, treat as user ID
    console.log('Looking up user by ID:', recipient);
    return verifyRecipient(recipient);
  }
};

// Get all messages for a user (sent or received), allow email as query param
export const getAllMessages = async (req, res) => {
  try {
    console.log('=== GET MESSAGES DEBUG ===');
    const queryEmail = req.query.email;
    let userId = req.user._id;
    let userEmail = req.user.email;
    if (queryEmail) {
      const user = await User.findOne({ email: queryEmail });
      if (!user) return res.status(404).json({ success: false, message: 'User not found for email' });
      userId = user._id;
      userEmail = user.email;
    }
    console.log('User ID requesting messages:', userId);
    console.log('User email:', userEmail);
    
    const messages = await Message.find({
      $or: [
        { sender: userId },
        { recipient: userId }
      ]
    })
    .populate('sender', 'firstName lastName email')
    .populate('recipient', 'firstName lastName email')
    .sort({ createdAt: -1 });

    console.log('Raw messages found:', messages.length);
    console.log('Messages details:', messages.map(m => ({
      id: m._id,
      sender: m.sender ? `${m.sender.firstName} ${m.sender.lastName} (${m.sender.email})` : 'Unknown',
      recipient: m.recipient ? `${m.recipient.firstName} ${m.recipient.lastName} (${m.recipient.email})` : 'Unknown',
      content: m.content.substring(0, 50) + '...',
      createdAt: m.createdAt
    })));

    // Add sender and recipient names to messages
    const messagesWithNames = messages.map(message => {
      const messageObj = message.toObject();
      messageObj.senderName = message.sender ? `${message.sender.firstName} ${message.sender.lastName}` : 'Unknown';
      messageObj.recipientName = message.recipient ? `${message.recipient.firstName} ${message.recipient.lastName}` : 'Unknown';
      return messageObj;
    });

    console.log('Messages with names:', messagesWithNames.length);
    console.log('=== END GET MESSAGES DEBUG ===');
    res.json({ success: true, messages: messagesWithNames });
  } catch (error) {
    console.error('Error in getAllMessages:', error);
    res.status(500).json({ success: false, message: 'Error fetching messages', error: error.message });
  }
};

// Send a message (allow recipient to be email or user ID)
export const sendMessage = async (req, res) => {
  try {
    let { recipient, content, metadata } = req.body;
    console.log('=== SEND MESSAGE DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Sender ID:', req.user._id);
    console.log('Sender email:', req.user.email);
    console.log('Recipient (ID or email):', recipient);
    console.log('Message content:', content);
    console.log('Metadata:', metadata);
    
    if (!content) {
      console.log('Error: Content is required');
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }
    
    if (!recipient) {
      console.log('Error: Recipient is required');
      return res.status(400).json({ success: false, message: 'Recipient is required' });
    }
    
    try {
      // Verify recipient exists (by ID or email)
      const recipientUser = await verifyRecipientFlexible(recipient);
      console.log('Recipient verified:', {
        id: recipientUser._id,
        email: recipientUser.email,
        firstName: recipientUser.firstName,
        lastName: recipientUser.lastName
      });
      
      // Prevent sending message to self
      if (recipientUser._id.toString() === req.user._id.toString()) {
        console.log('Error: Cannot send message to self');
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot send message to yourself' 
        });
      }
      
      // Create message object
      const message = new Message({
        sender: req.user._id,
        recipient: recipientUser._id,
        recipientEmail: recipientUser.email,
        content,
        metadata
      });
      
      console.log('Message object before save:', {
        sender: message.sender,
        recipient: message.recipient,
        content: message.content,
        metadata: message.metadata
      });
      
      await message.save();
      console.log('Message saved successfully with ID:', message._id);
      console.log('=== END SEND MESSAGE DEBUG ===');
      res.status(201).json({ success: true, message });
    } catch (verifyError) {
      console.error('Error verifying recipient:', verifyError);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid recipient', 
        error: verifyError.message 
      });
    }
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Error sending message', error: error.message });
  }
};

// Mark message as read
export const markMessageAsRead = async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating message', error: error.message });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting message', error: error.message });
  }
};

// Test endpoint to check if database is working
export const testMessage = async (req, res) => {
  try {
    console.log('Testing message endpoint');
    console.log('User:', req.user);
    console.log('Database connection status:', mongoose.connection.readyState);
    
    // Test User model
    const userCount = await User.countDocuments();
    console.log('Total users in database:', userCount);
    
    // Test Message model
    const messageCount = await Message.countDocuments();
    console.log('Total messages in database:', messageCount);
    
    res.json({ 
      success: true, 
      message: 'Database connection working',
      userCount,
      messageCount,
      userId: req.user._id
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database test failed', 
      error: error.message 
    });
  }
}; 