const express = require('express');
const { body, validationResult } = require('express-validator');
const Interview = require('../models/Interview');
const Application = require('../models/Application');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get provider interviews
// @route   GET /api/interviews/provider
// @access  Private (Providers only)
router.get('/provider', protect, authorize('provider', 'admin'), async (req, res) => {
  try {
    const interviews = await Interview.find({ provider: req.user._id })
      .populate('opportunity', 'title company')
      .populate('application', 'status')
      .populate('talent', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      interviews
    });
  } catch (error) {
    console.error('Get provider interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching interviews'
    });
  }
});

// @desc    Get talent interviews
// @route   GET /api/interviews/talent
// @access  Private (Refugees only)
router.get('/talent', protect, authorize('refugee'), async (req, res) => {
  try {
    const interviews = await Interview.find({ talent: req.user._id })
      .populate('opportunity', 'title company')
      .populate('application', 'status')
      .populate('provider', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      interviews
    });
  } catch (error) {
    console.error('Get talent interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching interviews'
    });
  }
});

// @desc    Send interview invitation
// @route   POST /api/interviews/invite
// @access  Private (Providers only)
router.post('/invite', protect, authorize('provider', 'admin'), [
  body('applicationId').isMongoId().withMessage('Valid application ID is required'),
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('type').isIn(['phone', 'video', 'in_person', 'technical', 'behavioral']).withMessage('Invalid interview type'),
  body('duration').optional().isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { applicationId, title, description, type, duration = 60 } = req.body;

    // Get application
    const application = await Application.findById(applicationId)
      .populate('opportunity')
      .populate('applicant');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if provider owns the opportunity
    if (req.user.role !== 'admin' && application.opportunity.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to invite for this application'
      });
    }

    // Create interview
    const interview = await Interview.create({
      opportunity: application.opportunity._id,
      application: applicationId,
      provider: req.user._id,
      talent: application.applicant._id,
      title,
      description,
      type,
      duration
    });

    res.status(201).json({
      success: true,
      interview
    });
  } catch (error) {
    console.error('Send interview invite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending interview invitation'
    });
  }
});

// @desc    Respond to interview invitation
// @route   PUT /api/interviews/:id/respond
// @access  Private (Talent only)
router.put('/:id/respond', protect, authorize('refugee'), [
  body('response').isIn(['accept', 'decline']).withMessage('Response must be accept or decline'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { response, notes } = req.body;

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check if user is the talent
    if (interview.talent.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this interview'
      });
    }

    // Update interview status
    if (response === 'accept') {
      interview.status = 'accepted';
    } else {
      interview.status = 'declined';
    }

    if (notes) {
      interview.notes.talent = notes;
    }

    await interview.save();

    res.json({
      success: true,
      interview
    });
  } catch (error) {
    console.error('Respond to interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while responding to interview'
    });
  }
});

// @desc    Send interview invitation directly to profile (without application)
// @route   POST /api/interviews/profile-invite
// @access  Private (Providers only)
router.post('/profile-invite', protect, authorize('provider', 'admin'), [
  body('talentId').isMongoId().withMessage('Valid talent ID is required'),
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('type').isIn(['job', 'internship', 'volunteer', 'mentorship']).withMessage('Invalid interview type'),
  body('format').isIn(['video', 'in-person', 'phone']).withMessage('Invalid interview format'),
  body('availabilitySlots').isArray().withMessage('Availability slots must be an array'),
  body('availabilitySlots.*.date').notEmpty().withMessage('Date is required for each availability slot'),
  body('availabilitySlots.*.timeSlots').isArray().withMessage('Time slots must be an array'),
  body('availabilitySlots.*.timeSlots.*.startTime').notEmpty().withMessage('Start time is required'),
  body('availabilitySlots.*.timeSlots.*.endTime').notEmpty().withMessage('End time is required'),
  body('duration').optional().custom((value) => {
    const parsed = parseInt(value);
    if (isNaN(parsed) || parsed < 15 || parsed > 480) {
      throw new Error('Duration must be between 15 and 480 minutes');
    }
    return parsed;
  })
], async (req, res) => {
  try {
    console.log('=== PROFILE INVITE REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const {
      talentId,
      type,
      title,
      description,
      organization,
      position,
      location,
      address,
      availabilitySlots,
      providerNotes,
      format,
      meetingPlatform,
      customGoogleMeetLink,
      materials,
      instructions,
      reminderSettings,
      duration = 60
    } = req.body;

    // Create interview with profile-based data
    const interview = new Interview({
      provider: req.user._id,
      talent: talentId,
      interviewType: 'profile', // Indicates this is a profile-based interview
      type: type,
      title: title.trim(),
      description: description || `${type.charAt(0).toUpperCase() + type.slice(1)} interview invitation`,
      status: 'invited',
      format: format,
      duration: duration,
      location: location || 'remote',
      address: address || '',
      availabilitySlots: availabilitySlots.map(slot => ({
        date: new Date(slot.date + 'T00:00:00.000Z'),
        timeSlots: slot.timeSlots.map(timeSlot => ({
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime
        }))
      })),
      metadata: {
        organization: organization || `${req.user.firstName} ${req.user.lastName}`,
        position: position || '',
        format: format,
        meetingPlatform: meetingPlatform,
        customGoogleMeetLink: customGoogleMeetLink,
        materials: materials,
        instructions: instructions,
        reminderSettings: reminderSettings
      },
      notes: {
        provider: providerNotes || ''
      }
    });

    await interview.save();

    console.log('Interview created successfully:', interview._id);

    res.status(201).json({
      success: true,
      message: 'Interview invitation sent successfully',
      interview
    });
  } catch (error) {
    console.error('Profile invite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending interview invitation'
    });
  }
});

// @desc    Get interview by ID
// @route   GET /api/interviews/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('opportunity', 'title company')
      .populate('application', 'status')
      .populate('provider', 'firstName lastName email')
      .populate('talent', 'firstName lastName email');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check if user is authorized to view this interview
    const isProvider = interview.provider._id.toString() === req.user._id.toString();
    const isTalent = interview.talent._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isProvider && !isTalent && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this interview'
      });
    }

    res.json({
      success: true,
      interview
    });
  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching interview'
    });
  }
});

module.exports = router; 