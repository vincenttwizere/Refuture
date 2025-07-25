const express = require('express');
const { body, validationResult, query } = require('express-validator');
const mongoose = require('mongoose');
const Opportunity = require('../models/Opportunity');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all opportunities (with filtering and pagination)
// @route   GET /api/opportunities
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isIn([
    'technology', 'healthcare', 'education', 'finance', 'marketing', 
    'sales', 'customer_service', 'manufacturing', 'logistics', 
    'hospitality', 'retail', 'construction', 'other'
  ]).withMessage('Invalid category'),
  query('jobType').optional().isIn(['full_time', 'part_time', 'contract', 'internship', 'volunteer']).withMessage('Invalid job type'),
  query('location').optional().trim(),
  query('experienceLevel').optional().isIn(['entry', 'junior', 'mid', 'senior', 'executive']).withMessage('Invalid experience level'),
  query('isRemote').optional().isBoolean().withMessage('isRemote must be boolean'),
  query('search').optional().trim()
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

    const {
      page = 1,
      limit = 10,
      category,
      jobType,
      location,
      experienceLevel,
      isRemote,
      search
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    // Filter out expired opportunities (deadline has passed)
    filter.$or = [
      { applicationDeadline: { $exists: false } }, // No deadline set
      { applicationDeadline: { $gt: new Date() } } // Deadline is in the future
    ];

    if (category) filter.category = category;
    if (jobType) filter.jobType = jobType;
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (isRemote !== undefined) filter.isRemote = isRemote === 'true';
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    if (search) {
      // Combine search with deadline filter
      const searchFilter = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { requirements: { $regex: search, $options: 'i' } }
        ]
      };
      filter.$and = [filter.$or, searchFilter];
      delete filter.$or; // Remove the original $or since we're using $and now
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Opportunity.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Get opportunities
    const opportunities = await Opportunity.find(filter)
      .populate('provider', 'firstName lastName email company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: opportunities,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get opportunities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching opportunities'
    });
  }
});

// @desc    Get opportunity by ID
// @route   GET /api/opportunities/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid opportunity ID format'
      });
    }

    const opportunity = await Opportunity.findById(req.params.id)
      .populate('provider', 'firstName lastName email company');

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    // Increment views
    try {
      await opportunity.incrementViews();
    } catch (incrementError) {
      console.error('Error incrementing views:', incrementError);
      // Continue without incrementing views if it fails
    }

    res.json({
      success: true,
      opportunity
    });
  } catch (error) {
    console.error('Get opportunity error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      params: req.params
    });
    res.status(500).json({
      success: false,
      message: 'Server error while fetching opportunity'
    });
  }
});

// @desc    Create new opportunity
// @route   POST /api/opportunities
// @access  Private (Providers only)
router.post('/', protect, authorize('provider', 'admin'), [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').isLength({ min: 20, max: 5000 }).withMessage('Description must be between 20 and 5000 characters'),
  body('company').trim().isLength({ min: 2, max: 100 }).withMessage('Company name must be between 2 and 100 characters'),
  body('location').trim().isLength({ min: 2, max: 100 }).withMessage('Location must be between 2 and 100 characters'),
  body('jobType').isIn(['full_time', 'part_time', 'contract', 'internship', 'volunteer']).withMessage('Invalid job type'),
  body('category').isIn([
    'technology', 'healthcare', 'education', 'finance', 'marketing', 
    'sales', 'customer_service', 'manufacturing', 'logistics', 
    'hospitality', 'retail', 'construction', 'other'
  ]).withMessage('Invalid category'),
  body('salary.min').isNumeric().withMessage('Minimum salary must be a number'),
  body('salary.max').isNumeric().withMessage('Maximum salary must be a number'),
  body('experienceLevel').isIn(['entry', 'junior', 'mid', 'senior', 'executive']).withMessage('Invalid experience level'),
  body('contactEmail').isEmail().withMessage('Please provide a valid contact email')
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

    const opportunityData = {
      ...req.body,
      provider: req.user._id
    };

    const opportunity = await Opportunity.create(opportunityData);

    // Create notifications for all refugee users
    try {
      const refugeeUsers = await User.find({ role: 'refugee' });
      
      const notificationPromises = refugeeUsers.map(user => {
        return Notification.create({
          recipient: user._id,
          title: 'New Opportunity Available',
          message: `A new ${opportunityData.jobType} opportunity "${opportunityData.title}" has been posted by ${opportunityData.company}`,
          type: 'opportunity_posted',
          relatedOpportunity: opportunity._id,
          metadata: {
            opportunityId: opportunity._id,
            opportunityTitle: opportunityData.title,
            company: opportunityData.company,
            jobType: opportunityData.jobType
          }
        });
      });

      await Promise.all(notificationPromises);
      console.log(`Created notifications for ${refugeeUsers.length} refugee users`);
    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError);
      // Don't fail the opportunity creation if notification creation fails
    }

    res.status(201).json({
      success: true,
      opportunity
    });
  } catch (error) {
    console.error('Create opportunity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating opportunity'
    });
  }
});

// @desc    Update opportunity
// @route   PUT /api/opportunities/:id
// @access  Private (Provider who created it or admin)
router.put('/:id', protect, authorize('provider', 'admin'), [
  body('title').optional().trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').optional().isLength({ min: 20, max: 5000 }).withMessage('Description must be between 20 and 5000 characters'),
  body('company').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Company name must be between 2 and 100 characters'),
  body('location').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Location must be between 2 and 100 characters'),
  body('jobType').optional().isIn(['full_time', 'part_time', 'contract', 'internship', 'volunteer']).withMessage('Invalid job type'),
  body('category').optional().isIn([
    'technology', 'healthcare', 'education', 'finance', 'marketing', 
    'sales', 'customer_service', 'manufacturing', 'logistics', 
    'hospitality', 'retail', 'construction', 'other'
  ]).withMessage('Invalid category'),
  body('salary.min').optional().isNumeric().withMessage('Minimum salary must be a number'),
  body('salary.max').optional().isNumeric().withMessage('Maximum salary must be a number'),
  body('experienceLevel').optional().isIn(['entry', 'junior', 'mid', 'senior', 'executive']).withMessage('Invalid experience level'),
  body('contactEmail').optional().isEmail().withMessage('Please provide a valid contact email')
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

    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    // Check if user is authorized to update this opportunity
    if (req.user.role !== 'admin' && opportunity.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this opportunity'
      });
    }

    // Update opportunity
    Object.keys(req.body).forEach(key => {
      opportunity[key] = req.body[key];
    });

    await opportunity.save();

    res.json({
      success: true,
      opportunity
    });
  } catch (error) {
    console.error('Update opportunity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating opportunity'
    });
  }
});

// @desc    Delete opportunity
// @route   DELETE /api/opportunities/:id
// @access  Private (Provider who created it or admin)
router.delete('/:id', protect, authorize('provider', 'admin'), async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    // Check if user is authorized to delete this opportunity
    if (req.user.role !== 'admin' && opportunity.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this opportunity'
      });
    }

    await opportunity.remove();

    res.json({
      success: true,
      message: 'Opportunity deleted successfully'
    });
  } catch (error) {
    console.error('Delete opportunity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting opportunity'
    });
  }
});

// @desc    Get opportunities by provider
// @route   GET /api/opportunities/provider/:providerId
// @access  Public
router.get('/provider/:providerId', async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ 
      provider: req.params.providerId,
      isActive: true 
    })
    .populate('provider', 'firstName lastName email company')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      opportunities
    });
  } catch (error) {
    console.error('Get provider opportunities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching provider opportunities'
    });
  }
});

// @desc    Save/unsave opportunity
// @route   POST /api/opportunities/:id/save
// @access  Private
router.post('/:id/save', protect, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    const isSaved = opportunity.savedBy.includes(req.user._id);

    if (isSaved) {
      // Remove from saved
      opportunity.savedBy = opportunity.savedBy.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Add to saved
      opportunity.savedBy.push(req.user._id);
    }

    await opportunity.save();

    res.json({
      success: true,
      isSaved: !isSaved,
      message: isSaved ? 'Opportunity removed from saved' : 'Opportunity saved successfully'
    });
  } catch (error) {
    console.error('Save opportunity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving opportunity'
    });
  }
});

// @desc    Get saved opportunities
// @route   GET /api/opportunities/saved
// @access  Private
router.get('/saved', protect, async (req, res) => {
  try {
    const opportunities = await Opportunity.find({
      savedBy: req.user._id,
      isActive: true
    })
    .populate('provider', 'firstName lastName email company')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      opportunities
    });
  } catch (error) {
    console.error('Get saved opportunities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching saved opportunities'
    });
  }
});

// @desc    Check if opportunity is saved
// @route   GET /api/opportunities/:id/saved
// @access  Private
router.get('/:id/saved', protect, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    const isSaved = opportunity.savedBy.includes(req.user._id);

    res.json({
      success: true,
      isSaved
    });
  } catch (error) {
    console.error('Check saved opportunity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking saved status'
    });
  }
});

module.exports = router; 