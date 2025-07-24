const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all messages for current user
// @route   GET /api/messages
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id }
      ],
      isDeleted: false,
      $nor: [
        { deletedBy: { $elemMatch: { user: req.user._id } } }
      ]
    })
    .populate('sender', 'firstName lastName email')
    .populate('recipient', 'firstName lastName email')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages'
    });
  }
});

// @desc    Send message
// @route   POST /api/messages
// @access  Private
router.post('/', protect, [
  body('recipient').isMongoId().withMessage('Valid recipient ID is required'),
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Message content must be between 1 and 2000 characters'),
  body('subject').optional().trim().isLength({ max: 200 }).withMessage('Subject cannot exceed 200 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { recipient, content, subject } = req.body;

    // Don't allow sending message to self
    if (recipient === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to yourself'
      });
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient,
      content,
      subject
    });

    // Populate sender and recipient info
    await message.populate('sender', 'firstName lastName email');
    await message.populate('recipient', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message'
    });
  }
});

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the recipient
    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this message as read'
      });
    }

    await message.markAsRead();

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking message as read'
    });
  }
});

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is sender or recipient
    const isSender = message.sender.toString() === req.user._id.toString();
    const isRecipient = message.recipient.toString() === req.user._id.toString();

    if (!isSender && !isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await message.deleteForUser(req.user._id);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting message'
    });
  }
});

module.exports = router; 