import Opportunity from '../models/OpportunityModel.js';
import SavedOpportunity from '../models/SavedOpportunityModel.js';
import Notification from '../models/NotificationModel.js';
import User from '../models/UserModel.js';
import { sendOpportunityUpdate } from '../utils/sendEmail.js';

// @desc    Create new opportunity
// @route   POST /api/opportunities
// @access  Private (Providers & Admins)
const createOpportunity = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      category,
      location,
      salary,
      requirements,
      benefits,
      applicationDeadline,
      startDate,
      duration,
      isRemote,
      maxApplicants,
      tags,
      contactEmail,
      contactPhone,
      website
    } = req.body;

    const opportunity = new Opportunity({
      title,
      description,
      type,
      category,
      provider: req.user._id,
      providerName: `${req.user.firstName} ${req.user.lastName}`,
      location,
      salary,
      requirements,
      benefits,
      applicationDeadline,
      startDate,
      duration,
      isRemote,
      maxApplicants,
      tags,
      contactEmail,
      contactPhone,
      website
    });

    const savedOpportunity = await opportunity.save();

    // Create notifications for all refugee users
    try {
      const refugeeUsers = await User.find({ role: 'refugee' });
      
      const notificationPromises = refugeeUsers.map(user => {
        const notification = new Notification({
          user: user._id,
          type: 'new_opportunity',
          message: `New ${type} opportunity: ${title}`,
          metadata: {
            opportunityId: savedOpportunity._id,
            opportunityTitle: title,
            opportunityType: type,
            providerName: `${req.user.firstName} ${req.user.lastName}`
          }
        });
        return notification.save();
      });

      await Promise.all(notificationPromises);
      console.log(`Created notifications for ${refugeeUsers.length} refugee users`);
    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError);
      // Don't fail the opportunity creation if notifications fail
    }

    res.status(201).json({
      success: true,
      message: 'Opportunity created successfully',
      opportunity: savedOpportunity
    });
  } catch (error) {
    console.error('Create opportunity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating opportunity',
      error: error.message
    });
  }
};

// @desc    Get all opportunities
// @route   GET /api/opportunities
// @access  Public
const getAllOpportunities = async (req, res) => {
  try {
    console.log('getAllOpportunities: request received');
    const {
      type,
      category,
      location,
      isRemote,
      search,
      status, // add status
      page = 1,
      limit = 10
    } = req.query;

    let query = {};

    // If not admin, only show active
    if (!req.user || req.user.role !== 'admin') {
      query.isActive = true;
    }

    // Apply filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (isRemote !== undefined) query.isRemote = isRemote === 'true';
    if (status) query.status = status; // allow status filter for admin

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    console.log('getAllOpportunities: built query:', query);
    const skip = (page - 1) * limit;

    console.log('getAllOpportunities: starting Opportunity.find');
    const opportunities = await Opportunity.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('provider', 'firstName lastName email');
    console.log('getAllOpportunities: Opportunity.find complete, found', opportunities.length);

    const total = await Opportunity.countDocuments(query);
    console.log('getAllOpportunities: countDocuments complete, total', total);

    res.json({
      success: true,
      opportunities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
    console.log('getAllOpportunities: response sent');
  } catch (error) {
    console.error('Get opportunities error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching opportunities',
      error: error.message
    });
  }
};

// @desc    Get opportunity by ID
// @route   GET /api/opportunities/:id
// @access  Public
const getOpportunityById = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('provider', 'firstName lastName email');

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    res.json({
      success: true,
      opportunity
    });
  } catch (error) {
    console.error('Get opportunity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching opportunity',
      error: error.message
    });
  }
};

// @desc    Update opportunity
// @route   PUT /api/opportunities/:id
// @access  Private (Provider who created it or Admin)
const updateOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    // Check if user can update this opportunity
    if (opportunity.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this opportunity'
      });
    }

    const updatedOpportunity = await Opportunity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Send email notifications to users who saved this opportunity
    try {
      const savedUsers = await SavedOpportunity.find({ opportunity: req.params.id })
        .populate('user', 'firstName email')
        .populate('opportunity', 'title');

      for (const saved of savedUsers) {
        if (saved.user && saved.opportunity) {
          await sendOpportunityUpdate(
            saved.user.email,
            saved.user.firstName,
            saved.opportunity.title,
            'Opportunity details have been updated'
          );
        }
      }
      console.log(`Sent update emails to ${savedUsers.length} users`);
    } catch (emailError) {
      console.error('Failed to send opportunity update emails:', emailError);
      // Don't fail the update if emails fail
    }

    res.json({
      success: true,
      message: 'Opportunity updated successfully',
      opportunity: updatedOpportunity
    });
  } catch (error) {
    console.error('Update opportunity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating opportunity',
      error: error.message
    });
  }
};

// @desc    Update opportunity status
// @route   PUT /api/opportunities/:id/status
// @access  Private (Admin only)
export const updateOpportunityStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }
    opportunity.status = status;
    await opportunity.save();
    res.json({ success: true, message: 'Opportunity status updated', opportunity });
  } catch (error) {
    console.error('Update opportunity status error:', error);
    res.status(500).json({ success: false, message: 'Error updating opportunity status', error: error.message });
  }
};

// @desc    Delete opportunity
// @route   DELETE /api/opportunities/:id
// @access  Private (Provider who created it or Admin)
const deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    // Check if user can delete this opportunity
    if (opportunity.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this opportunity'
      });
    }

    await Opportunity.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Opportunity deleted successfully'
    });
  } catch (error) {
    console.error('Delete opportunity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting opportunity',
      error: error.message
    });
  }
};

// @desc    Get opportunities by provider
// @route   GET /api/opportunities/provider/:providerId
// @access  Public
const getOpportunitiesByProvider = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({
      provider: req.params.providerId,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      opportunities
    });
  } catch (error) {
    console.error('Get provider opportunities error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching provider opportunities',
      error: error.message
    });
  }
};

// @desc    Save opportunity for user
// @route   POST /api/opportunities/:id/save
// @access  Private (Refugees)
const saveOpportunity = async (req, res) => {
  try {
    const opportunityId = req.params.id;
    const userId = req.user._id;

    // Check if opportunity exists
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    // Check if already saved
    const existingSave = await SavedOpportunity.findOne({
      user: userId,
      opportunity: opportunityId
    });

    if (existingSave) {
      return res.status(400).json({
        success: false,
        message: 'Opportunity already saved'
      });
    }

    // Save the opportunity
    const savedOpportunity = new SavedOpportunity({
      user: userId,
      opportunity: opportunityId
    });

    await savedOpportunity.save();

    res.status(201).json({
      success: true,
      message: 'Opportunity saved successfully'
    });
  } catch (error) {
    console.error('Save opportunity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving opportunity',
      error: error.message
    });
  }
};

// @desc    Unsave opportunity for user
// @route   DELETE /api/opportunities/:id/save
// @access  Private (Refugees)
const unsaveOpportunity = async (req, res) => {
  try {
    const opportunityId = req.params.id;
    const userId = req.user._id;

    const result = await SavedOpportunity.findOneAndDelete({
      user: userId,
      opportunity: opportunityId
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Saved opportunity not found'
      });
    }

    res.json({
      success: true,
      message: 'Opportunity unsaved successfully'
    });
  } catch (error) {
    console.error('Unsave opportunity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unsaving opportunity',
      error: error.message
    });
  }
};

// @desc    Get saved opportunities for user
// @route   GET /api/opportunities/saved
// @access  Private (Refugees)
const getSavedOpportunities = async (req, res) => {
  try {
    const userId = req.user._id;

    const savedOpportunities = await SavedOpportunity.find({ user: userId })
      .populate({
        path: 'opportunity',
        populate: {
          path: 'provider',
          select: 'firstName lastName email'
        }
      })
      .sort({ savedAt: -1 });

    const opportunities = savedOpportunities.map(saved => saved.opportunity).filter(Boolean);

    res.json({
      success: true,
      opportunities
    });
  } catch (error) {
    console.error('Get saved opportunities error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching saved opportunities',
      error: error.message
    });
  }
};

// @desc    Check if opportunity is saved by user
// @route   GET /api/opportunities/:id/saved
// @access  Private (Refugees)
const checkIfSaved = async (req, res) => {
  try {
    const opportunityId = req.params.id;
    const userId = req.user._id;

    const savedOpportunity = await SavedOpportunity.findOne({
      user: userId,
      opportunity: opportunityId
    });

    res.json({
      success: true,
      isSaved: !!savedOpportunity
    });
  } catch (error) {
    console.error('Check saved opportunity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking saved opportunity',
      error: error.message
    });
  }
};

export {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
  getOpportunitiesByProvider,
  saveOpportunity,
  unsaveOpportunity,
  getSavedOpportunities,
  checkIfSaved
}; 