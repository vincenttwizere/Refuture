import express from 'express';
import { getAllMessages, sendMessage, markMessageAsRead, deleteMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllMessages);
router.post('/', protect, sendMessage);
router.put('/:id/read', protect, markMessageAsRead);
router.delete('/:id', protect, deleteMessage);

export default router; 