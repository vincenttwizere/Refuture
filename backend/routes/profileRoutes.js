import express from 'express';
import Profile from '../models/Profile.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create profile
router.post('/me', authenticateToken, async (req, res) => {
  try {
    const existing = await Profile.findOne({ user: req.user._id });
    if (existing) return res.status(400).json({ message: 'Profile already exists' });
    const profile = new Profile({ ...req.body, user: req.user._id });
    await profile.save();
    await User.findByIdAndUpdate(req.user._id, { hasProfile: true });
    res.status(201).json({ profile });
  } catch (err) {
    res.status(500).json({ message: 'Error creating profile', error: err.message });
  }
});

// Update profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true }
    );
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
});

// Get own profile
router.get('/me/my-profile', authenticateToken, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
});

// Public profile view
router.get('/:id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).populate('user', 'firstName lastName');
    if (!profile || !profile.isPublic) return res.status(404).json({ message: 'Profile not found or not public' });
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
});

export default router; 