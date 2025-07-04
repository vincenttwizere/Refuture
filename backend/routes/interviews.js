import express from 'express';
import Interview from '../models/Interview.js';
import User from '../models/UserModel.js';
import Profile from '../models/ProfileModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/interviews/invite - Send interview invitation (provider only)
router.post('/invite', protect, async (req, res) => {
  try {
    const { 
      talentId, 
      type, 
      title, 
      description, 
      organization, 
      position, 
      location, 
      address, 
      scheduledDate, 
      duration, 
      providerNotes 
    } = req.body;

    // Validate required fields
    if (!talentId || !type || !title || !description || !organization) {
      return res.status(400).json({ 
        message: 'Missing required fields' 
      });
    }

    // Check if talent exists and has a profile
    const talent = await User.findById(talentId);
    if (!talent || talent.role !== 'refugee') {
      return res.status(404).json({ 
        message: 'Talent not found' 
      });
    }

    if (!talent.hasProfile) {
      return res.status(400).json({ 
        message: 'Talent has not completed their profile' 
      });
    }

    // Check if interview already exists
    const existingInterview = await Interview.findOne({
      providerId: req.user._id,
      talentId: talentId,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingInterview) {
      return res.status(400).json({ 
        message: 'Interview invitation already sent to this talent' 
      });
    }

    // Create interview invitation
    const interview = new Interview({
      providerId: req.user._id,
      talentId: talentId,
      type,
      title,
      description,
      organization,
      position,
      location,
      address,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      duration,
      providerNotes,
      status: 'pending'
    });

    await interview.save();

    res.status(201).json({
      message: 'Interview invitation sent successfully',
      interview
    });

  } catch (error) {
    console.error('Send interview invitation error:', error);
    res.status(500).json({ 
      message: 'Error sending interview invitation',
      error: error.message 
    });
  }
});

// GET /api/interviews/provider - Get provider's sent invitations
router.get('/provider', protect, async (req, res) => {
  try {
    // Check if user is a provider or admin
    if (req.user.role !== 'provider' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Provider role required.' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { providerId: req.user._id };
    if (status) {
      query.status = status;
    }

    const interviews = await Interview.find(query)
      .populate('talentId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Interview.countDocuments(query);

    res.json({
      interviews,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + interviews.length < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get provider interviews error:', error);
    res.status(500).json({ 
      message: 'Error fetching interviews',
      error: error.message 
    });
  }
});

// GET /api/interviews/talent - Get talent's received invitations
router.get('/talent', protect, async (req, res) => {
  try {
    // Check if user is a refugee or admin
    if (req.user.role !== 'refugee' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Refugee role required.' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { talentId: req.user._id };
    if (status) {
      query.status = status;
    }

    const interviews = await Interview.find(query)
      .populate('providerId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Interview.countDocuments(query);

    res.json({
      interviews,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + interviews.length < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get talent interviews error:', error);
    res.status(500).json({ 
      message: 'Error fetching interviews',
      error: error.message 
    });
  }
});

// PUT /api/interviews/:id/respond - Respond to interview invitation (talent only)
router.put('/:id/respond', protect, async (req, res) => {
  try {
    const { status, message } = req.body;

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be accepted or declined' 
      });
    }

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.talentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (interview.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Interview has already been responded to' 
      });
    }

    interview.status = status;
    interview.talentResponse = {
      message: message || '',
      respondedAt: new Date()
    };

    await interview.save();

    res.json({
      message: `Interview ${status} successfully`,
      interview
    });

  } catch (error) {
    console.error('Respond to interview error:', error);
    res.status(500).json({ 
      message: 'Error responding to interview',
      error: error.message 
    });
  }
});

// GET /api/interviews/:id - Get specific interview
router.get('/:id', protect, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('providerId', 'firstName lastName email')
      .populate('talentId', 'firstName lastName email');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Check if user can view this interview
    if (req.user.role !== 'admin' && 
        req.user._id.toString() !== interview.providerId._id.toString() &&
        req.user._id.toString() !== interview.talentId._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ interview });

  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({ 
      message: 'Error fetching interview',
      error: error.message 
    });
  }
});

// PUT /api/interviews/:id - Update interview (provider only)
router.put('/:id', protect, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow updates if interview is still pending
    if (interview.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot update interview that has been responded to' 
      });
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'scheduledDate', 'duration', 'providerNotes'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        interview[field] = req.body[field];
      }
    });

    await interview.save();

    res.json({
      message: 'Interview updated successfully',
      interview
    });

  } catch (error) {
    console.error('Update interview error:', error);
    res.status(500).json({ 
      message: 'Error updating interview',
      error: error.message 
    });
  }
});

export default router; 