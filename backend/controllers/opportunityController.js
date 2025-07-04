import Opportunity from '../models/OpportunityModel.js';

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
    const {
      type,
      category,
      location,
      isRemote,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const query = { isActive: true };

    // Apply filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (isRemote !== undefined) query.isRemote = isRemote === 'true';

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const opportunities = await Opportunity.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('provider', 'firstName lastName email');

    const total = await Opportunity.countDocuments(query);

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

export {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
  getOpportunitiesByProvider
}; 