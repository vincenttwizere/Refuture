const express = require('express');
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const Profile = require('../models/Profile');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get applications for an opportunity (Provider only)
// @route   GET /api/applications/opportunity/:opportunityId
// @access  Private (Provider who created the opportunity)
router.get('/opportunity/:opportunityId', protect, authorize('provider', 'admin'), async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.opportunityId);
    
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    // Check if user is authorized to view applications for this opportunity
    if (req.user.role !== 'admin' && opportunity.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications for this opportunity'
      });
    }

    const applications = await Application.find({ opportunity: req.params.opportunityId })
      .populate('applicant', 'firstName lastName email')
      .populate('profile', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Get opportunity applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications'
    });
  }
});

// @desc    Get applications for a provider
// @route   GET /api/applications/provider
// @access  Private (Providers only)
router.get('/provider', protect, authorize('provider', 'admin'), async (req, res) => {
  try {
    const applications = await Application.find()
      .populate({
        path: 'opportunity',
        match: { provider: req.user._id }
      })
      .populate('applicant', 'firstName lastName email')
      .populate('profile', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    // Filter out applications where opportunity is null (not found or not owned by provider)
    const filteredApplications = applications.filter(app => app.opportunity);

    res.json({
      success: true,
      applications: filteredApplications
    });
  } catch (error) {
    console.error('Get provider applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications'
    });
  }
});

// @desc    Get applications for current user (Refugee)
// @route   GET /api/applications/user
// @access  Private (Refugees only)
router.get('/user', protect, authorize('refugee'), async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('opportunity', 'title company location jobType category')
      .populate('profile', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications'
    });
  }
});

// @desc    Create application
// @route   POST /api/applications
// @access  Private (Refugees only)
router.post('/', protect, authorize('refugee'), [
  body('opportunity').isMongoId().withMessage('Valid opportunity ID is required'),
  body('coverLetter').optional().isLength({ max: 2000 }).withMessage('Cover letter cannot exceed 2000 characters')
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

    const { opportunity: opportunityId, coverLetter } = req.body;

    // Check if opportunity exists and is active
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    if (!opportunity.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This opportunity is no longer active'
      });
    }

    // Check if opportunity deadline has passed
    if (opportunity.applicationDeadline && new Date() > opportunity.applicationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'The application deadline for this opportunity has passed'
      });
    }

    // Check if user has a profile
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'You must create a profile before applying'
      });
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      opportunity: opportunityId,
      applicant: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this opportunity'
      });
    }

    // Create application
    const application = await Application.create({
      opportunity: opportunityId,
      applicant: req.user._id,
      profile: profile._id,
      coverLetter
    });

    // Increment application count on opportunity
    await opportunity.incrementApplicationCount();

    // Create notification for the provider
    try {
      await Notification.create({
        recipient: opportunity.provider,
        title: 'New Application Received',
        message: `A refugee has applied for your opportunity "${opportunity.title}"`,
        type: 'application_received',
        priority: 'medium',
        relatedOpportunity: opportunity._id,
        relatedApplication: application._id,
        actionUrl: `/provider-dashboard?tab=applications`,
        actionText: 'View Application',
        metadata: {
          opportunityId: opportunity._id,
          opportunityTitle: opportunity.title,
          applicantId: req.user._id,
          applicationId: application._id
        }
      });
      console.log('Notification created for provider:', opportunity.provider);
    } catch (notificationError) {
      console.error('Error creating notification for provider:', notificationError);
      // Don't fail the application creation if notification creation fails
    }

    res.status(201).json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Create application error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Server error while creating application';
    
    if (error.name === 'MongoNetworkError' || error.message.includes('ECONNREFUSED')) {
      errorMessage = 'Database connection failed. Please check if MongoDB is running.';
    } else if (error.name === 'ValidationError') {
      errorMessage = 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ');
    } else if (error.name === 'CastError') {
      errorMessage = 'Invalid ID format provided.';
    } else if (error.code === 11000) {
      errorMessage = 'You have already applied for this opportunity.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Provider who created the opportunity or admin)
router.put('/:id/status', protect, authorize('provider', 'admin'), [
  body('status').isIn(['pending', 'under_review', 'shortlisted', 'accepted', 'rejected', 'withdrawn']).withMessage('Invalid status'),
  body('reviewNotes').optional().isLength({ max: 1000 }).withMessage('Review notes cannot exceed 1000 characters')
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

    const { status, reviewNotes } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('opportunity');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is authorized to update this application
    if (req.user.role !== 'admin' && application.opportunity.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    // Update application status
    await application.updateStatus(status, reviewNotes, req.user._id);

    res.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating application status'
    });
  }
});

// @desc    Get application by ID
// @route   GET /api/applications/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('opportunity', 'title company location jobType category')
      .populate('applicant', 'firstName lastName email')
      .populate('profile', 'firstName lastName email phone')
      .populate('reviewedBy', 'firstName lastName');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is authorized to view this application
    const isOwner = application.applicant._id.toString() === req.user._id.toString();
    const isProvider = req.user.role === 'provider' && application.opportunity.provider.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching application'
    });
  }
});

module.exports = router; 