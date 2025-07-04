import express from 'express';
import { getAllNotifications, createNotification, markNotificationAsRead, deleteNotification } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllNotifications);
router.post('/', protect, createNotification);
router.put('/:id/read', protect, markNotificationAsRead);
router.delete('/:id', protect, deleteNotification);

export default router; 