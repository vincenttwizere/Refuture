import express from 'express';
import {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
  getOpportunitiesByProvider,
  saveOpportunity,
  unsaveOpportunity,
  getSavedOpportunities,
  checkIfSaved,
  updateOpportunityStatus
} from '../controllers/opportunityController.js';
import { protect, provider, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Authenticated route (so req.user is available for admin filtering)
router.get('/', protect, getAllOpportunities);
router.get('/provider/:providerId', getOpportunitiesByProvider);

// Saved opportunities routes (Refugees) - must come before /:id routes
router.get('/saved', protect, getSavedOpportunities);

// Protected routes (Providers and Admins)
router.post('/', protect, upload.array('attachments', 5), createOpportunity);

// Individual opportunity routes - must come after /saved
router.get('/:id', getOpportunityById);
router.put('/:id', protect, upload.array('attachments', 5), updateOpportunity);
router.delete('/:id', protect, deleteOpportunity);
router.get('/:id/saved', protect, checkIfSaved);
router.post('/:id/save', protect, saveOpportunity);
router.delete('/:id/save', protect, unsaveOpportunity);
router.put('/:id/status', protect, admin, updateOpportunityStatus);

export default router; 