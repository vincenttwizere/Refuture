import express from 'express';
import Profile from '../models/Profile.js';
import User from '../models/User.js';
import { authenticateToken, requireProvider, requireRefugee } from '../middleware/auth.js';

const router = express.Router();

// GET /api/profiles/talents - Get all refugee profiles (provider only)
router.get('/talents', authenticateToken, requireProvider, async (req, res) => {
  try {
    const { 
      search, 
      country, 
      fieldOfStudy, 
      skill, 
      availability,
      page = 1, 
      limit = 10 
    } = req.query;

    // Build query
    const query = {
      isPublic: true,
      isComplete: true
    };

    // Add search filters
    if (search) {
      query.$or = [
        { 'personalInfo.bio': { $regex: search, $options: 'i' } },
        { 'education.fieldOfStudy': { $regex: search, $options: 'i' } },
        { 'skills.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (country) {
      query['personalInfo.countryOfOrigin'] = { $regex: country, $options: 'i' };
    }

    if (fieldOfStudy) {
      query['education.fieldOfStudy'] = { $regex: fieldOfStudy, $options: 'i' };
    }

    if (skill) {
      query['skills.name'] = { $regex: skill, $options: 'i' };
    }

    if (availability) {
      query.availability = availability;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with population
    const profiles = await Profile.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ lastUpdated: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Profile.countDocuments(query);

    res.json({
      profiles,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + profiles.length < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get talents error:', error);
    res.status(500).json({ 
      message: 'Error fetching talent profiles',
      error: error.message 
    });
  }
});

// GET /api/profiles/:id - Get specific profile
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id)
      .populate('userId', 'firstName lastName email');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Check if user can view this profile
    if (!profile.isPublic && req.user.role !== 'admin' && 
        req.user._id.toString() !== profile.userId._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ profile });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      message: 'Error fetching profile',
      error: error.message 
    });
  }
});

// POST /api/profiles - Create profile (refugee only)
router.post('/', authenticateToken, requireRefugee, async (req, res) => {
  try {
    // Check if profile already exists
    const existingProfile = await Profile.findOne({ userId: req.user._id });
    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already exists' });
    }

    const profileData = req.body;
    profileData.userId = req.user._id;

    const profile = new Profile(profileData);
    
    // Check completeness
    profile.isComplete = profile.checkCompleteness();
    
    await profile.save();

    // Update user hasProfile status
    await User.findByIdAndUpdate(req.user._id, { hasProfile: true });

    res.status(201).json({
      message: 'Profile created successfully',
      profile
    });

  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ 
      message: 'Error creating profile',
      error: error.message 
    });
  }
});

// PUT /api/profiles/:id - Update profile
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Check if user can update this profile
    if (req.user.role !== 'admin' && 
        req.user._id.toString() !== profile.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update profile
    Object.assign(profile, req.body);
    profile.isComplete = profile.checkCompleteness();
    profile.lastUpdated = new Date();

    await profile.save();

    res.json({
      message: 'Profile updated successfully',
      profile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Error updating profile',
      error: error.message 
    });
  }
});

// GET /api/profiles/me/my-profile - Get current user's profile
router.get('/me/my-profile', authenticateToken, requireRefugee, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({ profile });

  } catch (error) {
    console.error('Get my profile error:', error);
    res.status(500).json({ 
      message: 'Error fetching profile',
      error: error.message 
    });
  }
});

export default router; 