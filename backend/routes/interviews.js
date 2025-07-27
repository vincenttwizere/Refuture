const express = require('express');
const { body, validationResult } = require('express-validator');
const Interview = require('../models/Interview');
const Application = require('../models/Application');
const User = require('../models/User');
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
    console.log('Fetching interviews for talent:', req.user._id);
    const interviews = await Interview.find({ talent: req.user._id })
      .populate('opportunity', 'title company')
      .populate('application', 'status')
      .populate('provider', 'firstName lastName email')
      .sort({ createdAt: -1 });

    console.log('Found interviews:', interviews.length);
    console.log('Sample interview provider data:', interviews[0]?.provider);

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

    // Create notification for the provider about the response
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        recipient: interview.provider,
        title: `Interview ${response === 'accept' ? 'Accepted' : 'Declined'}`,
        message: `The candidate has ${response === 'accept' ? 'accepted' : 'declined'} the interview invitation for "${interview.title}"`,
        type: response === 'accept' ? 'interview_confirmed' : 'interview_cancelled',
        priority: 'medium',
        relatedInterview: interview._id,
        actionUrl: `/provider-dashboard?tab=interviews`,
        actionText: 'View Interview',
        metadata: {
          interviewId: interview._id,
          interviewTitle: interview.title,
          talentId: req.user._id,
          response: response,
          notes: notes
        }
      });
      console.log('Notification created for provider about interview response');
    } catch (notificationError) {
      console.error('Error creating notification for provider:', notificationError);
      // Don't fail the interview response if notification creation fails
    }

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

// @desc    Select availability slot for interview
// @route   PUT /api/interviews/:id/select-slot
// @access  Private (Talent only)
router.put('/:id/select-slot', protect, authorize('refugee'), [
  body('dateIndex').isInt({ min: 0 }).withMessage('Valid date index is required'),
  body('timeSlotIndex').isInt({ min: 0 }).withMessage('Valid time slot index is required')
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

    const { dateIndex, timeSlotIndex } = req.body;

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
        message: 'Not authorized to select slot for this interview'
      });
    }

    // Check if interview is in invited status
    if (interview.status !== 'invited') {
      return res.status(400).json({
        success: false,
        message: 'Interview is not in invited status'
      });
    }

    // Validate indices
    if (!interview.availabilitySlots[dateIndex]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date index'
      });
    }

    if (!interview.availabilitySlots[dateIndex].timeSlots[timeSlotIndex]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time slot index'
      });
    }

    // Clear previous selections
    interview.availabilitySlots.forEach(slot => {
      slot.timeSlots.forEach(timeSlot => {
        timeSlot.isSelected = false;
      });
    });

    // Select the new slot
    interview.availabilitySlots[dateIndex].timeSlots[timeSlotIndex].isSelected = true;

    // Set the selected slot
    const selectedSlot = interview.availabilitySlots[dateIndex];
    const selectedTimeSlot = selectedSlot.timeSlots[timeSlotIndex];
    
    interview.selectedSlot = {
      date: selectedSlot.date,
      startTime: selectedTimeSlot.startTime,
      endTime: selectedTimeSlot.endTime
    };

    // Update status to scheduled
    interview.status = 'scheduled';

    await interview.save();

    // Create notification for the provider about the time slot selection
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        recipient: interview.provider,
        title: 'Interview Time Slot Selected',
        message: `The candidate has selected a time slot for the interview "${interview.title}" on ${new Date(interview.selectedSlot.date).toLocaleDateString()} at ${interview.selectedSlot.startTime}`,
        type: 'interview_confirmed',
        priority: 'high',
        relatedInterview: interview._id,
        actionUrl: `/provider-dashboard?tab=interviews`,
        actionText: 'View Interview',
        metadata: {
          interviewId: interview._id,
          interviewTitle: interview.title,
          talentId: req.user._id,
          selectedDate: interview.selectedSlot.date,
          selectedTime: interview.selectedSlot.startTime
        }
      });
      console.log('Notification created for provider about time slot selection');
    } catch (notificationError) {
      console.error('Error creating notification for provider:', notificationError);
      // Don't fail the slot selection if notification creation fails
    }

    res.json({
      success: true,
      interview
    });
  } catch (error) {
    console.error('Select slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while selecting slot'
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
  body('type').isIn(['phone', 'video', 'in_person', 'technical', 'behavioral']).withMessage('Invalid interview type'),

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
      location,
      availabilitySlots,
      providerNotes,
      meetingLink,
      duration = 60
    } = req.body;

    console.log('Creating interview with provider ID:', req.user._id);
    console.log('Provider user data:', req.user);

    // Create interview with profile-based data
    const interview = new Interview({
      provider: req.user._id,
      talent: talentId,
      interviewType: 'profile', // Indicates this is a profile-based interview
      type: type,
      title: title.trim(),
      description: description || `${type.charAt(0).toUpperCase() + type.slice(1)} interview invitation`,
      status: 'invited',
      duration: duration,
      location: location || 'remote',
      meetingLink: meetingLink || '',
      availabilitySlots: availabilitySlots.map(slot => ({
        date: new Date(slot.date + 'T00:00:00.000Z'),
        timeSlots: slot.timeSlots.map(timeSlot => ({
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime
        }))
      })),
      notes: {
        provider: providerNotes || ''
      }
    });

    await interview.save();

    console.log('Interview created successfully:', interview._id);

    // Populate the interview with provider data before sending response
    const populatedInterview = await Interview.findById(interview._id)
      .populate('provider', 'firstName lastName email')
      .populate('talent', 'firstName lastName email');
    
    console.log('Populated interview provider data:', populatedInterview.provider);

    // Create notification for the talent
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        recipient: talentId,
        title: 'Interview Invitation Received',
        message: `You have received an interview invitation for "${title.trim()}"`,
        type: 'interview_invitation',
        priority: 'high',
        relatedInterview: interview._id,
        actionUrl: `/refugee-dashboard?tab=interviews`,
        actionText: 'View Interview',
        metadata: {
          interviewId: interview._id,
          interviewTitle: title.trim(),
          providerId: req.user._id,
          interviewType: type
        }
      });
      console.log('Notification created for talent:', talentId);
    } catch (notificationError) {
      console.error('Error creating notification for talent:', notificationError);
      // Don't fail the interview creation if notification creation fails
    }

    res.status(201).json({
      success: true,
      message: 'Interview invitation sent successfully',
      interview: populatedInterview
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