import Message from '../models/MessageModel.js';

// Get all messages for a user (sent or received)
export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id }
      ]
    }).sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching messages', error: error.message });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { recipient, content, metadata } = req.body;
    const message = new Message({
      sender: req.user._id,
      recipient,
      content,
      metadata
    });
    await message.save();
    res.status(201).json({ success: true, message });
  } catch (error) {
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