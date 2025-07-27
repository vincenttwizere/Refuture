const express = require('express');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let notifications;
    
    // Admin users can see all notifications, other users see only their own
    if (req.user.role === 'admin') {
      notifications = await Notification.find({
        isDeleted: false
      })
      .populate('recipient', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(100); // More notifications for admin
    } else {
      notifications = await Notification.find({
        recipient: req.user._id,
        isDeleted: false
      })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 notifications
    }

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications'
    });
  }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Admin users can mark any notification as read, other users can only mark their own
    if (req.user.role !== 'admin' && notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this notification as read'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking notification as read'
    });
  }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', protect, async (req, res) => {
  try {
    // Admin users can mark all notifications as read, other users can only mark their own
    const filter = req.user.role === 'admin' 
      ? { isRead: false, isDeleted: false }
      : { recipient: req.user._id, isRead: false, isDeleted: false };

    const result = await Notification.updateMany(
      filter,
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      message: `All notifications marked as read (${result.modifiedCount} notifications updated)`
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking notifications as read'
    });
  }
});

// @desc    Create system notification (Admin only)
// @route   POST /api/notifications/system
// @access  Private (Admin only)
router.post('/system', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { title, message, type, priority = 'medium', recipients = 'all' } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    let notificationData = {
      title,
      message,
      type: type || 'system',
      priority,
      isSystemNotification: true,
      createdBy: req.user._id
    };

    // If recipients is 'all', send to all users
    if (recipients === 'all') {
      const User = require('../models/User');
      const allUsers = await User.find({ isActive: true });
      
      const notifications = allUsers.map(user => ({
        ...notificationData,
        recipient: user._id
      }));

      await Notification.insertMany(notifications);

      res.json({
        success: true,
        message: `System notification sent to ${allUsers.length} users`,
        notificationsCreated: allUsers.length
      });
    } else {
      // Send to specific recipients
      notificationData.recipient = recipients;
      const notification = new Notification(notificationData);
      await notification.save();

      res.json({
        success: true,
        message: 'System notification created',
        notification
      });
    }
  } catch (error) {
    console.error('Create system notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating system notification'
    });
  }
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user is the recipient
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notification'
      });
    }

    notification.isDeleted = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting notification'
    });
  }
});

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread-count
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
      isDeleted: false
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting unread count'
    });
  }
});

module.exports = router; 