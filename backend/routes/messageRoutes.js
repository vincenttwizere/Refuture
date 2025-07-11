import express from 'express';
import { getAllMessages, sendMessage, markMessageAsRead, deleteMessage, testMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllMessages);
router.post('/', protect, sendMessage);
router.put('/:id/read', protect, markMessageAsRead);
router.delete('/:id', protect, deleteMessage);
router.get('/test', protect, testMessage);

export default router; 