import express from 'express';
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

// All routes require admin access
router.use(protect, admin);

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