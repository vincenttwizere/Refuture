import express from 'express';
import { 
  createApplication, 
  getUserApplications, 
  getOpportunityApplications, 
  getProviderApplications,
  updateApplicationStatus, 
  getApplicationById 
} from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create a new application (refugee only)
router.post('/', createApplication);

// Get applications for the current user (refugee)
router.get('/user', getUserApplications);

// Get applications for a specific opportunity (provider only)
router.get('/opportunity/:opportunityId', getOpportunityApplications);

// Get all applications for the current provider (provider only)
router.get('/provider', getProviderApplications);

// Update application status (provider only)
router.put('/:applicationId/status', updateApplicationStatus);

// Get application by ID
router.get('/:applicationId', getApplicationById);

export default router; 