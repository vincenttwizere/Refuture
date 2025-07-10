import Application from '../models/ApplicationModel.js';
import Opportunity from '../models/OpportunityModel.js';
import User from '../models/UserModel.js';
import Notification from '../models/NotificationModel.js';

// Create a new application
export const createApplication = async (req, res) => {
  try {
    const { opportunityId, applicantId, status = 'pending', metadata } = req.body;
    
    console.log('Creating application:', { opportunityId, applicantId, status });

    // Verify opportunity exists
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ 
        success: false, 
        message: 'Opportunity not found' 
      });
    }

    // Verify applicant exists
    const applicant = await User.findById(applicantId);
    if (!applicant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Applicant not found' 
      });
    }

    // Check if application already exists
    const existingApplication = await Application.findOne({
      opportunityId,
      applicantId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this opportunity'
      });
    }

    // Create the application
    const application = new Application({
      opportunityId,
      applicantId,
      status,
      metadata
    });

    await application.save();

    // Populate opportunity and applicant details
    await application.populate('opportunityId', 'title providerName');
    await application.populate('applicantId', 'firstName lastName email');

    // Create notification for the provider
    const notification = new Notification({
      user: opportunity.provider, // The provider who created the opportunity
      type: 'new_application',
      message: `New application received for "${opportunity.title}" from ${applicant.firstName} ${applicant.lastName}`,
      metadata: {
        applicationId: application._id,
        opportunityId: opportunity._id,
        opportunityTitle: opportunity.title,
        applicantName: `${applicant.firstName} ${applicant.lastName}`,
        applicantEmail: applicant.email
      }
    });

    await notification.save();

    console.log('Application created successfully:', application._id);
    console.log('Notification created for provider:', notification._id);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });

  } catch (error) {
    console.error('Error creating application:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this opportunity'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating application',
      error: error.message
    });
  }
};

// Get applications for a user (refugee)
export const getUserApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicantId: req.user._id })
      .populate('opportunityId', 'title providerName type location applicationDeadline')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

// Get applications for an opportunity (provider)
export const getOpportunityApplications = async (req, res) => {
  try {
    const { opportunityId } = req.params;
    
    // Verify the opportunity belongs to the current user (provider)
    const opportunity = await Opportunity.findOne({
      _id: opportunityId,
      provider: req.user._id
    });

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found or access denied'
      });
    }

    const applications = await Application.find({ opportunityId })
      .populate('applicantId', 'firstName lastName email')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Error fetching opportunity applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

// Get all applications for a provider (across all opportunities)
export const getProviderApplications = async (req, res) => {
  try {
    // Get all opportunities created by this provider
    const opportunities = await Opportunity.find({ provider: req.user._id });
    const opportunityIds = opportunities.map(opp => opp._id);

    // Get all applications for these opportunities
    const applications = await Application.find({ 
      opportunityId: { $in: opportunityIds } 
    })
      .populate('opportunityId', 'title providerName type location')
      .populate('applicantId', 'firstName lastName email')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Error fetching provider applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

// Update application status (provider only)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, reviewNotes } = req.body;

    const application = await Application.findById(applicationId)
      .populate('opportunityId', 'provider title');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify the opportunity belongs to the current user (provider)
    if (application.opportunityId.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update the application
    application.status = status;
    application.reviewedAt = new Date();
    application.reviewedBy = req.user._id;
    if (reviewNotes) {
      application.reviewNotes = reviewNotes;
    }

    await application.save();

    res.json({
      success: true,
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application status',
      error: error.message
    });
  }
};

// Get application by ID
export const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId)
      .populate('opportunityId', 'title providerName type location')
      .populate('applicantId', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
}; 