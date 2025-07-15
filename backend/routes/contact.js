import express from 'express';
import User from '../models/UserModel.js';
import Message from '../models/MessageModel.js';

const router = express.Router();

// POST /api/contact - Send contact form message to all admins
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Find all admins
    const admins = await User.find({ role: 'admin' });
    if (!admins.length) {
      return res.status(500).json({ success: false, message: 'No admin users found.' });
    }

    // Create a message for each admin
    const content = `Contact Form Message\nFrom: ${name} <${email}>\n\n${message}`;
    const messageDocs = admins.map(admin => ({
      sender: null, // or a special system user ID if you want
      recipient: admin._id,
      recipientEmail: admin.email,
      content,
      metadata: { fromContactForm: true, senderName: name, senderEmail: email }
    }));

    await Message.insertMany(messageDocs);

    res.json({ success: true, message: 'Your message has been sent to the admin team.' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message.', error: error.message });
  }
});

export default router; 