import express from 'express';
import User from '../models/UserModel.js';
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getPlatformStats,
  getPendingApprovals
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get user by email (for interview booking) - accessible to all authenticated users
router.get('/by-email/:email', protect, async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user: { _id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Error finding user by email:', error);
    res.status(500).json({ message: 'Error finding user' });
  }
});

// All other routes require admin access
router.use(admin);

// Get all users with filtering and pagination
router.get('/', getAllUsers);

// Get platform statistics
router.get('/stats', getPlatformStats);

// Get pending approvals
router.get('/pending', getPendingApprovals);

// Get user by ID
router.get('/:id', getUserById);

// Update user status
router.put('/:id/status', updateUserStatus);

// Delete user
router.delete('/:id', deleteUser);

export default router; 