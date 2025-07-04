import Notification from '../models/NotificationModel.js';

// Get all notifications for a user
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching notifications', error: error.message });
  }
};

// Create a notification
export const createNotification = async (req, res) => {
  try {
    const { type, message, metadata } = req.body;
    const notification = new Notification({
      user: req.user._id,
      type,
      message,
      metadata
    });
    await notification.save();
    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating notification', error: error.message });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating notification', error: error.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting notification', error: error.message });
  }
}; 