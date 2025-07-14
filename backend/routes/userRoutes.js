import express from 'express';
import User from '../models/UserModel.js';
import Opportunity from '../models/OpportunityModel.js';
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

// Get all mentors (active providers who have created a mentorship opportunity)
router.get('/mentors', async (req, res) => {
  try {
    // Find all provider IDs who have at least one active mentorship opportunity
    const mentorshipOpportunities = await Opportunity.find({ type: 'mentorship', isActive: true }).select('provider');
    const providerIds = mentorshipOpportunities.map(opp => opp.provider.toString());
    // Find providers who are active and in the above list
    const mentors = await User.find({
      _id: { $in: providerIds },
      role: 'provider',
      status: 'active',
      isActive: true
    }).select('-password');
    res.json({ success: true, mentors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching mentors', error: error.message });
  }
});

// Get all investors (active providers who have created a funding opportunity)
router.get('/investors', async (req, res) => {
  try {
    // Find all provider IDs who have at least one active funding opportunity
    const fundingOpportunities = await Opportunity.find({ type: 'funding', isActive: true }).select('provider');
    const providerIds = fundingOpportunities.map(opp => opp.provider.toString());
    // Find providers who are active and in the above list
    const investors = await User.find({
      _id: { $in: providerIds },
      role: 'provider',
      status: 'active',
      isActive: true
    }).select('-password');
    res.json({ success: true, investors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching investors', error: error.message });
  }
});

// All other routes require admin access
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